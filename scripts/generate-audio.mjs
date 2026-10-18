// Run locally only. Azure credentials must never be added to website files.
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(await fs.readFile(path.join(root, 'audio/voice.json'), 'utf8'));
const app = await fs.readFile(path.join(root, 'app.js'), 'utf8');
const boundary = app.indexOf('\nconst $ =');
if (boundary < 0) throw new Error('Cannot locate the board vocabulary. Export must be updated before generating audio.');
const categories = vm.runInNewContext(`${app.slice(0, boundary)}; categories`, {}, { timeout:1000 });
const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
const phrases = [...new Set([
  ...categories.flatMap(category => category.words.map(word => word[2])),
  ...[...html.matchAll(/data-phrase="([^"]+)"/g)].map(match => match[1]),
  'Hello. These are my words.'
])];
if (phrases.length < 60 || phrases.some(text => typeof text !== 'string' || !text.trim())) throw new Error('Incomplete vocabulary export.');
const xml = value => String(value).replace(/[<>&"']/g, char => ({'<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&apos;'}[char]));
const ssml = text => `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${xml(config.language)}"><voice name="${xml(config.voice)}"><mstts:express-as style="${xml(config.style)}" styledegree="${xml(config.styleDegree)}"><prosody rate="${xml(config.rate)}" pitch="${xml(config.pitch)}">${xml(text)}</prosody></mstts:express-as></voice></speak>`;
const records = phrases.map(text => {
  const hash = createHash('sha256').update(JSON.stringify(config) + text).digest('hex').slice(0, 12);
  const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').slice(0, 55);
  return { text, file:`audio/${slug}-${hash}.mp3` };
});
if (process.argv.includes('--list')) {
  console.log(JSON.stringify({ count:records.length, characters:phrases.join('').length, voice:config.voice, records }, null, 2));
  process.exit(0);
}
const region = process.env.AZURE_SPEECH_REGION || 'eastus';
if (!/^[a-z0-9]+$/.test(region)) throw new Error('Invalid Azure region.');
const keyFile = process.env.AZURE_SPEECH_KEY_FILE;
const key = (process.env.AZURE_SPEECH_KEY || (keyFile ? await fs.readFile(keyFile, 'utf8') : '')).trim();
if (!key) throw new Error('Set AZURE_SPEECH_KEY or AZURE_SPEECH_KEY_FILE locally. Never put a key in the website or GitHub.');
const endpoint = `https://${region}.tts.speech.microsoft.com`;
const headers = { 'Ocp-Apim-Subscription-Key':key };
const voiceResponse = await fetch(`${endpoint}/cognitiveservices/voices/list`, { headers, signal:AbortSignal.timeout(30000) });
if (!voiceResponse.ok) throw new Error(`Azure voice lookup returned HTTP ${voiceResponse.status}. Check resource status, key, and region.`);
const voice = (await voiceResponse.json()).find(item => item.ShortName === config.voice);
if (!voice || voice.Gender !== 'Male' || !voice.StyleList?.includes(config.style)) throw new Error('The configured male voice/style is not available in this region.');
console.log(`Verified ${config.voice}, ${config.style} style. ${records.length} unique clips, ${phrases.join('').length} text characters.`);
const selected = process.argv.includes('--sample') ? records.filter(record => record.text === 'Hello. These are my words.') : records;
let generated = 0;
for (const record of selected) {
  const destination = path.join(root, record.file);
  try { if ((await fs.stat(destination)).size > 1000) continue; } catch { /* Generate missing clips. */ }
  let audio;
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`${endpoint}/cognitiveservices/v1`, {
      method:'POST', headers:{...headers, 'Content-Type':'application/ssml+xml', 'X-Microsoft-OutputFormat':config.format, 'User-Agent':'MyWordsAudioBuilder'},
      body:ssml(record.text), signal:AbortSignal.timeout(60000)
    });
    if (response.ok) { audio = Buffer.from(await response.arrayBuffer()); break; }
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 3) throw new Error(`Azure synthesis returned HTTP ${response.status} for ${record.file}. Existing clips are retained.`);
    const delay = Math.min(60, Math.max(5 * (attempt + 1), Number(response.headers.get('retry-after')) || 0));
    console.log(`Azure busy; retrying after ${delay}s.`);
    await new Promise(resolve => setTimeout(resolve, delay * 1000));
  }
  if (!audio || audio.length < 1000 || !(audio.subarray(0,3).toString() === 'ID3' || (audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0))) throw new Error(`Invalid MP3 response for ${record.file}.`);
  await fs.writeFile(`${destination}.tmp`, audio);
  await fs.rename(`${destination}.tmp`, destination);
  generated++;
  console.log(`Saved ${record.file}`);
  // F0 permits 20 synthesis requests per minute. Stay below that limit.
  await new Promise(resolve => setTimeout(resolve, 3200));
}
if (!process.argv.includes('--sample')) {
  for (const record of records) if ((await fs.stat(path.join(root, record.file))).size < 1000) throw new Error(`Missing clip: ${record.file}`);
  const manifest = { ...config, clips:Object.fromEntries(records.map(record => [record.text, `./${record.file}`])) };
  await fs.writeFile(path.join(root, 'audio/manifest.js.tmp'), `// Generated by scripts/generate-audio.mjs. Contains no credentials.\nwindow.SAVED_SPEECH = ${JSON.stringify(manifest, null, 2)};\n`);
  await fs.rename(path.join(root, 'audio/manifest.js.tmp'), path.join(root, 'audio/manifest.js'));
  console.log(`Published local manifest covering all ${records.length} phrases. Generated ${generated} new clips.`);
} else console.log('Sample saved. The website is unchanged until the full set is ready.');
