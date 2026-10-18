const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function fixture() {
  const scope = { window:{}, setTimeout, clearTimeout };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../speech-player.js'), 'utf8'), scope);
  const reports = [];
  const audios = [];
  const player = new scope.window.SavedSpeechPlayer({'Water.':'./water.mp3','Help.':'./help.mp3'}, text => reports.push(text), url => {
    const audio = { url, paused:false, play(){return new Promise((resolve,reject) => { this.resolve=resolve; this.reject=reject; });}, pause(){this.paused=true;}, removeAttribute(){}, load(){} };
    audios.push(audio);
    return audio;
  });
  return {player,reports,audios};
}

test('a second selection cancels the first clip and ignores its late rejection', async () => {
  const {player,reports,audios} = fixture();
  player.play('Water.');
  player.play('Help.');
  assert.equal(audios[0].paused,true);
  audios[1].onplaying();
  audios[0].reject(new Error('interrupted'));
  await Promise.resolve();
  assert.equal(reports.at(-1),'Speaking…');
  assert.equal(player.audio,audios[1]);
  player.stop();
});
test('clear/quiet/hidden cancellation cannot be undone by a late ended callback', () => {
  const {player,reports,audios} = fixture();
  player.play('Water.');
  const lateEnd = audios[0].onended;
  player.stop();
  lateEnd();
  assert.equal(audios[0].paused,true);
  assert.equal(player.audio,null);
  assert.equal(reports.at(-1),'Getting voice ready…');
});
test('blocked playback reports an error and releases the player', async () => {
  const {player,reports,audios} = fixture();
  player.play('Water.');
  audios[0].reject(new Error('NotAllowedError'));
  await Promise.resolve();
  assert.match(reports.at(-1),/couldn’t play/);
  assert.equal(player.audio,null);
});
test('gentle playback keeps recorded speed and pitch, and repeat creates a fresh clip', () => {
  const {player,reports,audios} = fixture();
  player.play('Water.',0.9);
  assert.equal(audios[0].playbackRate,1);
  assert.equal(audios[0].preservesPitch,true);
  audios[0].onplaying();
  audios[0].onended();
  assert.match(reports.at(-1),/Say again/);
  player.play('Water.',0.75);
  assert.ok(audios[1].playbackRate<1);
  assert.equal(audios[1].url,'./water.mp3');
  player.stop();
});
test('missing saved clips give a clear message without silently changing voices', () => {
  const {player,reports,audios} = fixture();
  player.play('New words.');
  assert.equal(audios.length,0);
  assert.match(reports.at(-1),/doesn’t have a saved voice/);
});
