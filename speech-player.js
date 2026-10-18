// Saved audio plays directly from this website. No Azure connection or key is used here.
class SavedSpeechPlayer {
  constructor(clips, report, createAudio = (url) => new Audio(url)) {
    this.clips = clips;
    this.report = report;
    this.createAudio = createAudio;
    this.audio = null;
    this.generation = 0;
    this.timeout = null;
  }
  stop() {
    this.generation++;
    clearTimeout(this.timeout);
    this.timeout = null;
    if (this.audio) {
      this.audio.onplaying = this.audio.onended = this.audio.onerror = null;
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.audio = null;
    }
  }
  play(text, rate = 0.9) {
    this.stop();
    const url = this.clips[text];
    if (!url) {
      this.report('This message doesn’t have a saved voice yet. Choose a device voice in Settings.');
      return;
    }
    const generation = this.generation;
    const audio = this.createAudio(url);
    this.audio = audio;
    // The recording already uses the Gentle speed. Preserve its pitch when adjusting playback.
    audio.playbackRate = rate / 0.9;
    audio.preservesPitch = true;
    const fail = () => {
      if (generation !== this.generation) return;
      this.stop();
      this.report('The saved voice couldn’t play. Check your connection and tap “Say again”.');
    };
    audio.onplaying = () => {
      if (generation !== this.generation) return;
      clearTimeout(this.timeout);
      this.timeout = null;
      this.report('Speaking…');
    };
    audio.onended = () => {
      if (generation !== this.generation) return;
      this.stop();
      this.report('Tap “Say again” to hear your message.');
    };
    audio.onerror = fail;
    this.report('Getting voice ready…');
    this.timeout = setTimeout(fail, 15000);
    // Start inside the tap handler, which is required for mobile browser audio permission.
    try { const playing = audio.play(); if (playing?.catch) playing.catch(fail); }
    catch { fail(); }
  }
}
window.SavedSpeechPlayer = SavedSpeechPlayer;
