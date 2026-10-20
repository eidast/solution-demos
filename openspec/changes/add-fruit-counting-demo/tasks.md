## Tasks
- [x] Verify source rights and test real model detections.
- [x] Add registry entry, per-video class configuration and compatible result validation.
- [x] Generate fruit analysis and validate reference frames.
- [x] Verify original/HUD/source modal and existing demos in browser.
- [x] Update documentation, run tests, OpenSpec and secrets checks.

## Evidence
- Original CC BY 3.0 footage is 1920×1080 and 30.03s, downloaded locally with pinned SHA-256; source page captured privately with its own hash.
- Initial real inference processed 360 frames in 31.32s: 84 frames have one banana detection, 276 have zero despite one physical banana in view. These limitations and reference frames are documented.
- Browser Analyze again completed the real fruit worker and accepted schema v4. Original/HUD switching, synchronized banana card at 5.08s, selected fruit source modal, and restored San Francisco v3 playback were checked. All four originals/results remain separate.
- 30 Node tests and 4 Python tests passed, including fruit class filtering, schema isolation and actual detection/count agreement across all four videos. Strict OpenSpec, secret scan, ignored mode-0600 .env and whitespace checks passed.
- Required Jev browser regression completed all 13 cases with a real OpenRouter response; report stays local/ignored.
