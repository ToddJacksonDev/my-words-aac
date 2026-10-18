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
