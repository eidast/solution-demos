## Tasks
- [x] Check rights, native dimensions and model viability of replacement footage.
- [x] Remove both rejected active IDs, preserve other examples and bound player proportions.
- [x] Prepare/analyze replacement and inspect reference frames.
- [x] Verify responsive layout, legacy playback, source modal and removed routes.
- [x] Update attribution, technical/retention docs and tests; run required checks and publish.

## Evidence
- Explicit user request removes only banana-ripening and hudson-fruit-shop, superseding preservation for these entries; the active registry is exactly San Francisco, Shibuya, retail and apple-press. Real retired media/status/source requests return 404 and automated tests also reject POST actions. Local ignored history remains private.
- Selected native 1920×1080 source has CC BY-SA 3.0 permission; its hash/capture, author, excerpt 8–38 seconds and unchanged derivative license are recorded. Both served outputs are silent 1280×720, 30 seconds at 12 FPS.
- Initial 360-frame inference completed in 31.6s; range 0–19 accepted apples, 159 frames with detections. Reference 22s shows 16 boxes, including grouping/misses documented in VALIDATION.md. Browser-triggered re-analysis also completed and validated its own v4 class/input profile.
- Desktop 1440×1000 and mobile 390×844 checked: contain sizing, ratio 16:9, mobile page/content both 390px wide; Shibuya remains full 4:3 letterboxed with its saved 8-person/4-car first frame. Apple HUD/card match at 13 detections around 22.17s, original/HUD preserve position, and the source modal identifies apple-press. Viewport override was reset.
- 32 Node and 5 Python tests pass, including the exact active registry, removed routes and real-output counts for all four active entries. Strict OpenSpec, whitespace and secrets checks pass; .env stays ignored with mode 0600.
- Required Jev browser regression completed all 13 cases with a live OpenRouter response; its controlled report remains local/ignored.
