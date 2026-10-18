# Starting-version checks

Checked October 18, 2026 in Chrome on macOS.

- JavaScript syntax check passed with `node --check app.js`.
- Local HTTP preview returned 200 and rendered the board.
- All five categories rendered 12 word buttons each.
- Water and Sad selections displayed their complete phrases; the browser delivered speech completion events.
- Tummy hurts activated with Enter and displayed the expected message in quiet mode.
- Quick Help replaced the prior selection, with exactly one visible button selected.
- Say again completed speech even when automatic speech was off.
- Quiet mode survived a reload; the previous message was not retained.
- Try voice and Stop voice worked; Escape closed Settings and returned focus to Settings.
- Clear stopped speech, cleared the selection, reset the message, and disabled repeat.
- Phone layout inspected at 390 pixels wide; 320- and 390-pixel viewports had no horizontal page overflow.
- Desktop layout visually inspected.

Actual speaker loudness and clarity have not been independently listened to. Safari/iPhone/iPad and Android need a real-device check; voices and emoji depend on the device. The board has no offline cache or remote caregiver notifications.

## Saved Andrew voice update — October 18, 2026

- The user approved the generated Andrew sample before the full set was generated.
- Generated 64 unique MP3 recordings covering every current board phrase, quick word, and the voice test. The duplicate Water phrase shares one recording.
- All 64 files matched the vocabulary manifest and decoded fully with FFmpeg. Each is mono MP3 at 24 kHz; the set is 1.39 MiB and 121.4 seconds total.
- Five automated player tests passed: rapid replacement ignores old rejections; cancellation ignores late completion; blocked playback reports failure; repeat and speed preserve the recorded voice; missing recordings do not silently change voices.
- Chrome selected Andrew by default for an existing visitor. Water, quick Help, repeat, quiet mode, and clear behaved correctly with saved recordings.
- Saved playback also completed on an ignored local test page with `speechSynthesis` and `SpeechSynthesisUtterance` disabled.
- No browser console errors or warnings were captured during these checks.
- The Azure credential was supplied through a restricted temporary file outside the repository. An exact-key scan of project files and existing Git history found no matches, and the temporary file and directory were deleted after generation.

The generation used an active Free F0 Speech resource. Playback uses website-hosted MP3 files and no Azure API calls. Real iPhone/iPad and Android speaker checks remain outstanding.
