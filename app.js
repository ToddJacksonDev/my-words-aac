// Edit labels, pictures, and spoken phrases here. Keep familiar words in stable positions.
const categories = [
  { id:'needs', label:'My needs', icon:'🏠', title:'Everyday needs', hint:'Things that help me feel comfortable.', tint:'#eef1df', words:[
    ['💧','Water','I want water.'], ['🥨','Food','I am hungry. I want food.'], ['🚽','Bathroom','I need to use the bathroom.'], ['🤗','Hug','I want a hug.'],
    ['🛏️','Rest','I need to rest.'], ['🧸','My toy','I want my toy.'], ['🛌','Blanket','I want a blanket.'], ['🎧','Quiet','I need some quiet.'],
    ['🫧','Wash hands','I want to wash my hands.'], ['👕','Change clothes','I want to change my clothes.'], ['🚪','Space','I need some space.'], ['🫶','Stay with me','Please stay with me.']
  ]},
  { id:'food', label:'Food & drink', icon:'🍎', title:'Food & drink', hint:'Something to eat or drink.', tint:'#fbecd9', words:[
    ['💧','Water','I want water.'], ['🧃','Juice','I want juice.'], ['🥛','Milk','I want milk.'], ['🍎','Apple','I want an apple.'],
    ['🍌','Banana','I want a banana.'], ['🍘','Crackers','I want crackers.'], ['🥪','Sandwich','I want a sandwich.'], ['🍝','Pasta','I want pasta.'],
    ['🥣','Cereal','I want cereal.'], ['🥣','Yogurt','I want yogurt.'], ['➕','More','I want more, please.'], ['✅','All done','I am all done.']
  ]},
  { id:'activities', label:'Things to do', icon:'🧩', title:'Things to do', hint:'What would I like to do?', tint:'#e8eef8', words:[
    ['🧸','Play','I want to play.'], ['📺','Watch TV','I want to watch TV.'], ['📱','Tablet','I want my tablet.'], ['🎵','Music','I want to listen to music.'],
    ['📖','Read','I want to read a book.'], ['🖍️','Color','I want to color.'], ['🧩','Puzzle','I want to do a puzzle.'], ['🫧','Bubbles','I want to play with bubbles.'],
    ['🌳','Outside','I want to go outside.'], ['🚶','Walk','I want to go for a walk.'], ['🛁','Bath','I want a bath.'], ['🛏️','Bed','I want to go to bed.']
  ]},
  { id:'feelings', label:'My feelings', icon:'🙂', title:'My feelings', hint:'All feelings are okay.', tint:'#f8eddb', words:[
    ['🙂','Happy','I feel happy.'], ['😢','Sad','I feel sad.'], ['😠','Angry','I feel angry.'], ['😨','Scared','I feel scared.'],
    ['😟','Worried','I feel worried.'], ['🤩','Excited','I feel excited.'], ['😴','Tired','I feel tired.'], ['😌','Calm','I feel calm.'],
    ['😕','Confused','I feel confused.'], ['😣','Too much','This is too much. I need a break.'], ['🥱','Bored','I feel bored.'], ['❤️','Love you','I love you.']
  ]},
  { id:'body', label:'My body', icon:'🩹', title:'My body', hint:'Tell someone how your body feels.', tint:'#f4e8ed', words:[
    ['🤒','Feel sick','I feel sick.'], ['🤢','Tummy hurts','My tummy hurts.'], ['🤕','Head hurts','My head hurts.'], ['👂','Ear hurts','My ear hurts.'],
    ['🦷','Tooth hurts','My tooth hurts.'], ['🗣️','Throat hurts','My throat hurts.'], ['🩹','It hurts','Something hurts. Please help me.'], ['🤮','Throw up','I need to throw up.'],
    ['🥵','Too hot','I feel too hot.'], ['🥶','Too cold','I feel too cold.'], ['🚽','Bathroom now','I need the bathroom now.'], ['🆘','Breathing help','I am having trouble breathing. I need help now.']
  ]}
];

const $ = (id) => document.getElementById(id);
const synth = window.speechSynthesis;
const deviceSpeechAvailable = Boolean(synth && window.SpeechSynthesisUtterance);
const savedSpeech = window.SAVED_SPEECH;
const savedSpeechAvailable = Boolean(savedSpeech?.clips && window.SavedSpeechPlayer);
const savedVoiceId = 'saved:andrew';
const speechAvailable = savedSpeechAvailable || deviceSpeechAvailable;
let settings = { autoSpeak:true, voice:savedSpeechAvailable ? savedVoiceId : '', rate:0.9, savedVoiceVersion:1 };
try {
  const saved = JSON.parse(localStorage.getItem('my-words-settings'));
  if (saved && typeof saved.autoSpeak === 'boolean') settings.autoSpeak = saved.autoSpeak;
  // Existing visitors receive the new saved voice once; later choices are respected.
  if (saved && typeof saved.voice === 'string' && (!savedSpeechAvailable || saved.savedVoiceVersion === 1)) settings.voice = saved.voice;
  if (saved && [0.75, 0.9, 1].includes(saved.rate)) settings.rate = saved.rate;
} catch { /* The board still works when storage is unavailable. */ }
let currentPhrase = '';
let currentLabel = '';
let currentUtterance = null;
let selectedButton = null;
let speechToken = 0;
const savedPlayer = savedSpeechAvailable ? new window.SavedSpeechPlayer(savedSpeech.clips, reportSpeech) : null;
if (!deviceSpeechAvailable && savedSpeechAvailable) settings.voice = savedVoiceId;
persistSettings();

function persistSettings() {
  try { localStorage.setItem('my-words-settings', JSON.stringify(settings)); } catch { /* Private mode may block storage. */ }
}
function stopSpeech() {
  speechToken += 1;
  if (deviceSpeechAvailable) synth.cancel();
  savedPlayer?.stop();
  currentUtterance = null;
}
function reportSpeech(text) {
  $('speech-status').textContent = text;
  $('settings-status').textContent = text;
}
function speak(text) {
  stopSpeech();
  if (settings.voice === savedVoiceId && savedPlayer) {
    savedPlayer.play(text, settings.rate);
    return;
  }
  if (!deviceSpeechAvailable) {
    reportSpeech('Voice is unavailable in this browser. You can still show your message.');
    return;
  }
  const token = speechToken;
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = synth.getVoices().find((v) => v.voiceURI === settings.voice);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || 'en-US';
  utterance.rate = settings.rate;
  utterance.onstart = () => { if (token === speechToken) reportSpeech('Speaking…'); };
  utterance.onend = () => {
    if (token !== speechToken) return;
    currentUtterance = null;
    reportSpeech('Tap “Say again” to hear your message.');
  };
  utterance.onerror = (event) => {
    if (token !== speechToken || event.error === 'canceled' || event.error === 'interrupted') return;
    currentUtterance = null;
    reportSpeech('Voice couldn’t play. Your message is still shown. Try “Say again” or another voice.');
  };
  currentUtterance = utterance;
  reportSpeech('Getting voice ready…');
  synth.speak(utterance);
}
function selectWord(button) {
  if (selectedButton) selectedButton.setAttribute('aria-pressed', 'false');
  selectedButton = button;
  button.setAttribute('aria-pressed', 'true');
  currentPhrase = button.dataset.phrase;
  currentLabel = button.dataset.label;
  $('message').textContent = currentPhrase;
  $('say-again').disabled = !speechAvailable;
  $('clear').disabled = false;
  if (settings.autoSpeak) speak(currentPhrase);
  else { stopSpeech(); reportSpeech('Quiet mode. Your message is ready to show.'); }
}
function showCategory(category) {
  $('category-title').textContent = category.title;
  $('category-hint').textContent = category.hint;
  for (const button of $('categories').children) button.setAttribute('aria-current', String(button.dataset.category === category.id));
  $('word-grid').replaceChildren();
  for (const [picture, label, phrase] of category.words) {
    const button = document.createElement('button');
    button.className = 'word-card';
    button.dataset.label = label;
    button.setAttribute('aria-label', label);
    button.dataset.phrase = phrase;
    button.style.setProperty('--tile-tint', category.tint);
    button.setAttribute('aria-pressed', String(currentPhrase === phrase && currentLabel === label));
    if (button.getAttribute('aria-pressed') === 'true') {
      if (selectedButton) selectedButton.setAttribute('aria-pressed', 'false');
      selectedButton = button;
    }
    const icon = document.createElement('span');
    icon.className = 'word-picture';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = picture;
    const text = document.createElement('span');
    text.textContent = label;
    button.append(icon, text);
    button.addEventListener('click', () => selectWord(button));
    $('word-grid').append(button);
  }
}
for (const category of categories) {
  const button = document.createElement('button');
  button.className = 'category';
  button.dataset.category = category.id;
  button.setAttribute('aria-controls', 'word-grid');
  const icon = document.createElement('span');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = category.icon;
  button.append(icon, document.createTextNode(category.label));
  button.addEventListener('click', () => showCategory(category));
  $('categories').append(button);
}
document.querySelectorAll('.quick-word').forEach((button) => button.addEventListener('click', () => selectWord(button)));
$('say-again').addEventListener('click', () => { if (currentPhrase) speak(currentPhrase); });
$('clear').addEventListener('click', () => {
  stopSpeech();
  currentPhrase = '';
  currentLabel = '';
  if (selectedButton) selectedButton.setAttribute('aria-pressed', 'false');
  selectedButton = null;
  $('message').textContent = 'What would you like to say?';
  $('say-again').disabled = true;
  $('clear').disabled = true;
  updateVoiceStatus();
});
function updateVoiceStatus() {
  $('voice-indicator').textContent = !speechAvailable ? 'Pictures only · voice unavailable' : settings.autoSpeak ? (settings.voice === savedVoiceId ? 'Andrew · voice on' : 'Device voice is on') : 'Quiet mode';
  reportSpeech(!speechAvailable ? 'Voice is unavailable in this browser. You can still show your message.' : settings.autoSpeak ? 'Tap a picture. I’ll say it out loud.' : 'Quiet mode. Tap a picture to show your message.');
}
function populateVoices() {
  const voices = deviceSpeechAvailable ? synth.getVoices().filter((voice) => /^en([-_]|$)/i.test(voice.lang)) : [];
  $('voice').replaceChildren();
  if (savedSpeechAvailable) $('voice').add(new Option(savedSpeech.label, savedVoiceId));
  if (deviceSpeechAvailable) $('voice').add(new Option('Device default', ''));
  voices.forEach((voice) => $('voice').add(new Option(`${voice.name} (${voice.lang})`, voice.voiceURI)));
  $('voice').value = (savedSpeechAvailable && settings.voice === savedVoiceId) || voices.some((voice) => voice.voiceURI === settings.voice) ? settings.voice : '';
}
$('auto-speak').checked = settings.autoSpeak;
$('rate').value = String(settings.rate);
$('auto-speak').addEventListener('change', (event) => {
  settings.autoSpeak = event.target.checked;
  stopSpeech();
  persistSettings();
  updateVoiceStatus();
});
$('voice').addEventListener('change', (event) => { stopSpeech(); settings.voice = event.target.value; persistSettings(); updateVoiceStatus(); });
$('rate').addEventListener('change', (event) => { stopSpeech(); settings.rate = Number(event.target.value); persistSettings(); });
$('settings-open').addEventListener('click', () => { stopSpeech(); $('settings-status').textContent = ''; $('settings').showModal(); });
$('settings-close').addEventListener('click', () => $('settings').close());
$('settings').addEventListener('close', () => { stopSpeech(); $('settings-open').focus(); });
$('test-voice').addEventListener('click', () => speak('Hello. These are my words.'));
$('stop-voice').addEventListener('click', () => { stopSpeech(); reportSpeech('Voice stopped.'); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopSpeech(); });
window.addEventListener('pagehide', stopSpeech);
if (deviceSpeechAvailable) synth.addEventListener('voiceschanged', populateVoices);
if (!speechAvailable) ['auto-speak', 'voice', 'rate', 'test-voice', 'stop-voice'].forEach((id) => { $(id).disabled = true; });
populateVoices();
updateVoiceStatus();
showCategory(categories[0]);
