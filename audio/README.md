# Saved calm male voice

The board defaults to **Andrew**, Microsoft's `en-US-AndrewMultilingualNeural` voice. The configuration is in `voice.json`: empathetic style at intensity 0.7, 10% slower speaking rate, and pitch lowered by 2%. The sample was approved on October 18, 2026.

The recordings cover 64 unique phrases: all 60 board items, four quick words, and the voice-test sentence, with the duplicate Water phrase shared between categories. They contain 1,117 text characters in total. MP3 output is 24 kHz mono at 96 kbps. The manifest maps exact spoken phrases to files whose names include a hash of the phrase and voice configuration, preventing stale audio after a word or voice changes.

## Azure resource

- Resource: `my-words-aac-speech`
- Resource group: `my-words-aac`
- Region: East US (`eastus`)
- Pricing tier: Free F0

The public website never connects to this resource. Azure is used only when generating new recordings locally. The recordings remain usable if the Azure trial or resource stops. Website loading still requires internet access; there is no offline installation/cache in this version.

## Generate or update recordings

The generator requires Node.js 20 or newer. It uses built-in Node tools with no dependencies. From the project folder:

```sh
node scripts/generate-audio.mjs --list
```

This only lists phrases; it makes no Azure requests. To generate audio, supply `AZURE_SPEECH_KEY` in your local environment or point `AZURE_SPEECH_KEY_FILE` at a private file outside the repository. Set `AZURE_SPEECH_REGION` if using a resource outside East US. Never paste a key into source files, commit it, or put it in browser JavaScript.

```sh
node scripts/generate-audio.mjs --sample
node scripts/generate-audio.mjs
```

The first command creates only the voice-test recording. The second generates missing clips and writes `manifest.js` only when the entire set exists. Existing recordings are reused when their text and configuration match. Requests are spaced to stay below the F0 limit, with bounded retries for temporary service errors. Changes to voice configuration produce new filenames; older recordings are retained until intentionally cleaned up.

Commit the MP3s, `voice.json`, and `manifest.js` with the corresponding word changes. Never commit credentials. The `.gitignore` excludes `.env` files and `.local/` work files as an additional precaution.

## Playback behavior

- A new selection stops the previous recording immediately.
- Clear, quiet-mode changes, opening Settings, and leaving the page stop playback.
- Say again starts the selected phrase from the beginning.
- Gentle plays the approved recording at its original speed. Slower and Normal adjust playback speed while preserving pitch.
- A failed clip shows a retry message; it does not silently switch to an unfamiliar device voice.
- Device voices remain available as an explicit alternative in Settings.

Reference: [Azure voice support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts), [SSML voice controls](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice), [text-to-speech REST API](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech), [Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/speech/).
