import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const expected = JSON.parse(execFileSync(process.execPath, [path.join(root, 'scripts/generate-audio.mjs'), '--list'], {encoding:'utf8'}));
const scope = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'audio/manifest.js'), 'utf8'), scope, {timeout:1000});
const manifest = scope.window.SAVED_SPEECH;
assert.equal(Object.keys(manifest.clips).length,expected.records.length);
let bytes = 0;
let seconds = 0;
for (const record of expected.records) {
  assert.equal(manifest.clips[record.text], `./${record.file}`, `Wrong clip for ${record.text}`);
  const file = path.join(root, record.file);
  const info = JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=codec_name,sample_rate,channels','-show_entries','format=duration,size','-of','json',file],{encoding:'utf8'}));
  assert.equal(info.streams[0].codec_name,'mp3');
  assert.equal(info.streams[0].channels,1);
  assert.equal(info.streams[0].sample_rate,'24000');
  const duration = Number(info.format.duration);
  assert.ok(duration>0.1 && duration<30,`Invalid duration for ${record.text}`);
  // Decode every frame, not just the header, to catch truncated or invalid audio.
  execFileSync('ffmpeg',['-v','error','-xerror','-i',file,'-f','null','-'],{stdio:'pipe'});
  bytes += Number(info.format.size);
  seconds += duration;
}
console.log(`Verified ${expected.records.length} mapped MP3 files; all decode successfully. ${(bytes/1024/1024).toFixed(2)} MiB, ${seconds.toFixed(1)} seconds total.`);
