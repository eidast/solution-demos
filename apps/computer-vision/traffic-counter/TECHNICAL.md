# Video gallery technical design

## Registry and storage

`videos.json` is the single committed registry consumed by Python, Node, and the browser. Only its four fixed IDs are accepted: san-francisco, shibuya, retail-najaf, banana-ripening. Source URLs and SHA-256, author/license, excerpt, native/playback dimensions, FPS, and limitations live there. No request supplies a URL, path, command, model, or arbitrary media.

Each video owns `data/<videoId>/source.mp4`, `prepared-source.json`, `annotated.mp4`, and `analysis.json`. Preparation/analysis affects only that directory. `--all` explicitly processes every registered entry. The old flat Shibuya files were moved into its directory, and its prior schema-v2 analysis retained locally as `analysis.v2.json` before recomputation; it is not an HTTP asset. San Francisco's original licensed cached source is reused to restore its original 13-second example.

Source preparation verifies downloads, writes the selected clean silent H.264 source and hash manifest, and invalidates only the selected result. Analysis verifies its source configuration/hash and model hash, performs local inference, draws boxes/labels with Supervision and a baked HUD, and publishes complete result files after success. Original video is unchanged by inference. Caches, data, Python environments and bytecode stay ignored and retained until manually removed. Successful re-analysis replaces the selected result; there is no run-history database or automatic deletion.

## Pipeline and count definition

Every playback frame is analyzed at 12 FPS. Letterboxing uses RGB, 640×640 top-left padding 114; YOLOX-S/OpenCV confidence is >=0.35, with class-aware NMS 0.5. Traffic and retail retain valid person (0) and car (2) xyxy boxes; count each accepted box once per frame. Supervision 0.31.0 annotates boxes/labels, and the HUD shows those same counts plus the selected excerpt time/duration. There is no identity tracking, unique-visitor count, walking-state classification, or line counting. People on posters or packaging may cause false detections; occlusion and low resolution cause misses. See VALIDATION.md for retail reference checks.

## Saved schema v3

analysis.json records schemaVersion 3, videoId, mode local-inference-replay, UTC generatedAt, selected source and license provenance, model URL/hash/thresholds, runtime versions, dimensions/FPS/frameCount/duration, processing time, output hashes, and ordered frames with frame/time/people/cars and detection class/confidence/xyxy rows. videoId must match the selected registry entry before results can render. Counts must equal the retained detection rows in each frame.

V1 was the 13-second San Francisco flat example, mode local-precomputed-inference. V2 was the single Shibuya flat example with browser-started inference, mode local-inference-replay. These earlier meanings are preserved; they are not silently relabeled as v3. Existing v2 evidence remains local. New model inference produces the new v3 result for each example. No credentials, provider payloads, faces/features, or participant choices enter these files.

## HTTP and global job control

The allowlist serves fixed frontend files and videos.json, plus `videos/<knownId>/{source.mp4,annotated.mp4,analysis.json}`. Video byte ranges/HEAD retain their existing behavior. Private manifests, legacy analysis, raw Python paths, caches, weights, and arbitrary files are inaccessible. Unknown IDs receive 404. Former flat media/job aliases refer to Shibuya for compatibility.

Bodyless `POST videos/<knownId>/analyze` retains the loopback-peer, matching loopback Origin/Host, custom-action-header, no-body and same-origin-metadata checks. A manager permits only one running worker globally. `GET videos/<knownId>/analysis-status` includes selected-video state and activeVideoId, letting the UI display another example while preserving the active worker. Each worker uses only fixed interpreter/script arguments plus a registry-validated `--video` ID, no shell, an environment allowlist, and a five-minute deadline. Output progress is bounded to that video's expected frames. Completion requires fresh output in the expected schema (v3 for legacy examples, v4 for configured classes) for the matching ID; raw stderr is not exposed.

## Selection and playback

The page defaults to banana-ripening, with optional known ?video= links. Selection changes the original, aspect ratio, duration, source credits and limitation. It clears old counts immediately. A monotonically increasing selection epoch prevents stale fetch, analysis, or polling responses from updating a different selection. Changing selection does not start, cancel, or redirect an active worker; progress can be resumed by selecting that video.

The original loads first and never has added overlays. Saved valid results may populate synchronized cards, and the toggle switches to the same frame with preserved play/pause intent. Per-frame callbacks use decoded media time where available; seek/pause/timeupdate fallbacks clamp frame selection. The HUD is baked in only to the analyzed video, so the clean original remains available. No invented results are displayed when analysis is missing.

## Publication boundary

Only source, registry, tests, licenses and documentation are committed. Source/weights are hash-verifiable downloads, and generated media/analysis remain ignored. Publishing the repository does not deploy the unauthenticated paid-key server publicly. The root .env and local participant histories remain ignored with their existing permissions and retention.

## Implementation source viewer

`GET/HEAD videos/<knownId>/implementation` returns the selected committed registry entry and a fixed allowlist of current implementation files: prepare.py, counts.js, app.js, analysis-job.js, http.js, third_party/yolox.py and its YOLOX-LICENSE. No query or request path chooses a disk file. Failures return a controlled 503. This read-only route needs no prepared media and does not start inference or change saved schemas/retention. The native dialog renders code as text, traps focus through showModal, supports Escape/Close, restores focus, and aborts obsolete requests when closed or reopened.

## Configurable classes and saved schema v4

The banana entry adds an explicit classes list: COCO id 46, name banana, count key bananas, display label Bananas. Python filters detections to those classes, annotates the actual retained boxes, and derives every HUD/card count from them. The three existing examples keep their person/car filter and unchanged schema-v3 outputs; their data is not migrated or invalidated.

Only configured-class examples write schemaVersion 4. They retain v3 provenance/model/runtime/video/output metadata and detection rows, add the exact classes list, and replace the flat frame.people/frame.cars fields with frame.counts (e.g. {bananas: 1}). The browser requires the selected registry's exact class definitions, video ID, complete ordered frame list and nonnegative integer counters with exactly the expected keys; v3 is rejected for configured-class selections. The worker expects the selected video's schema. Source preparation and successful re-analysis retain the existing per-video invalidation/replacement behavior; caches and results remain ignored and manually retained, with no run history.

The fruit UI has one metric and hides the car card. Original/HUD toggling, source viewing, global single-worker control and byte-range playback are shared with the other examples. Zero accepted detections does not establish absence: one physical banana remains in the full excerpt. This is not ripeness grading or an accuracy-certified inventory counter.
