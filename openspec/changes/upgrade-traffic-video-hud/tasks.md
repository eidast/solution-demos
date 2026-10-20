## Implementation
- [x] Acquire and verify a different >=30-second licensed clip and source provenance.
- [x] Separate source preparation and local analysis; generate a HUD and schema v2.
- [x] Add bounded local job control and same-origin/loopback request checks.
- [x] Update player, progress, original/results switching, and documentation.

## Verification
- [x] Run the actual analysis from the browser and inspect HUD/count synchronization.
- [x] Test worker concurrency, error handling, request boundaries, and schema v2 outputs.
- [x] Verify original playback, seek/switch behavior, and the 45-second duration.
- [x] Verify Jev's 13-case flow and live provider response after shared server integration.
- [x] Run automated tests, strict OpenSpec validation, secret and whitespace checks.

## Evidence

- Downloaded and SHA-256 verified Emran Kassim's 90.000544-second Shibuya Crossing source, CC BY 2.0. Prepared a distinct 45.000-second, 960×720, 4:3 source derivative; ffprobe confirms 540 frames.
- Started the actual calculation using Analyze video in the browser. Progress advanced through 540 frames; the worker finished in 48.03 seconds and generated schema-v2 analysis and a HUD video.
- Browser verified clean original before calculation, analyzed playback, seeking to another moment, paused original/results switching with matching frame 147 (9 people / 0 cars), and original-first behavior after reload. The HUD is encoded into the result for fullscreen playback.
- Source/result frames at second 30 were inspected: saved row and HUD both show 16 accepted people and 0 cars. Visual comparison also shows missed distant people and cars. The UI and technical documentation explicitly state that the low-resolution crowd is undercounted and is not an accuracy benchmark.
- 28 Node tests and 3 Python tests passed, covering same-origin input rejection, fixed worker arguments/environment, single-flight behavior, timeout kill, controlled errors, private manifests/runtime files, ranges, frame selection, and actual output-count agreement.
- Completed all 13 Moral Machine decisions in the browser and received a valid live OpenRouter response. Its report remains local and ignored; Jev contracts and protocols are unchanged.
- Strict OpenSpec validation, secret scan, Markdown links, .env ignore/0600 permissions, and diff whitespace checks passed.
- No commit or push; source downloads, weights, environment, output media, and analysis remain ignored locally.
