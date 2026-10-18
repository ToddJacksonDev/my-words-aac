# My Words

A small AAC (augmentative and alternative communication) website for everyday communication at home. Built with plain HTML, CSS, and JavaScript. No build step, account, or subscription is needed.

## Use the board

- Choose a category, then tap a picture. A full message appears and plays in Andrew's saved calm male voice.
- Yes, No, Help, and Stop stay in the same place above every category.
- Say again repeats the latest message. Clear message clears it and stops speech.
- Settings lets you turn automatic speech off, adjust speaking speed, or choose a device voice instead of Andrew. Say again and Try voice still work in quiet mode when explicitly pressed.
- Keyboard users can Tab between buttons and press Enter or Space. Escape closes Settings.

There are 60 picture buttons across needs, food and drink, activities, feelings, and body/sickness, plus four quick words. Pictures use built-in emoji, which vary by device. Replace them with familiar pictures later if useful.

## Open in VS Code

Open this folder in VS Code. The main files are:

- `index.html`: page structure and settings
- `styles.css`: layout, colors, and responsive sizing
- `app.js`: word lists, button behavior, and speech
- `speech-player.js`: saved audio playback and cancellation
- `audio/`: saved MP3 clips, voice configuration, and the phrase-to-file manifest

To preview, run this in the VS Code terminal from this folder:

```sh
sh start.command
```

Open http://localhost:8080. Save edits and refresh the browser. Press Control+C in the terminal to stop the preview. You can also open `index.html` directly; a local server is preferable for predictable browser behavior.

## Change words

Edit the `categories` array at the top of `app.js`. Each entry contains a picture, a short visible label, and a spoken message:

```js
['💧', 'Water', 'I want water.']
```

Keep familiar buttons in stable locations as the board grows.

After adding or changing a spoken phrase, generate its saved recording using the instructions in `audio/README.md`. The board shows a clear message if the selected saved voice has no recording for a new phrase; you can choose a device voice until the recording is added.

## GitHub Pages

This static site can be hosted from the `main` branch and `/ (root)` folder in the repository's Settings → Pages. All asset paths are relative, so it works under a repository URL. Pushing commits updates the published version after GitHub's deployment finishes.

## Privacy and device notes

The website has no analytics, ads, message history, or server database. It stores only voice preferences in this browser's local storage. It does not request microphone access. Andrew's recordings were generated once with Azure Speech and are served as ordinary MP3 files from this website. Playing them does not call Azure, send a selected phrase to Azure, or consume Azure credits. No Azure keys are included in the site or repository. As with other hosted files, the hosting provider handles normal web requests for audio files.

If you explicitly choose a device voice, speech is provided by the browser/operating system; some device voices may require a network connection or use the platform's speech service. This version does not cache the website for offline use.

Use the device volume controls for loudness. If speech is unavailable, picture selection and the written message still work. This board does not notify a caregiver remotely or place calls; it is for communicating with someone nearby.

## Verification

See `VERIFICATION.md` for the checks performed on the starting version and remaining device checks.
