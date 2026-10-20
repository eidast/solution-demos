# Video Gallery · People & Cars

Three independent Creative Commons examples share the local YOLOX-S/Supervision player:

| Example | Excerpt | Source / playback dimensions | License |
| --- | --- | --- | --- |
| San Francisco · Street traffic | Source seconds 21–34 (13 seconds) | 1920×1080 / 1280×720 | CC BY 3.0 |
| Shibuya · Crossing | Source seconds 0–45 (45 seconds) | 640×480 / 960×720, original 4:3 retained | CC BY 2.0 |
| Retail HD · Al Basheer | Source seconds 6–51 (45 seconds) | Native 1280×720 / 1280×720 | CC BY 3.0 |

The original San Francisco demo is retained; choosing or analyzing another video does not replace it. Retail is HD source footage, not an upscale. Shibuya remains a low-resolution crowd example with substantial misses. All clips are silent and sampled at 12 FPS. Source licenses, authors, hashes and modification notes are recorded in [THIRD_PARTY_ASSETS.md](THIRD_PARTY_ASSETS.md) and displayed for the selected video.

## Prepare and run

Requires Node.js 22+, Python 3.13, uv, and FFmpeg. From the repository root:

```bash
npm run vision:setup
npm run vision:source
npm start
```

Open `/computer-vision/traffic-counter/`. **Video example** selects a video, initially HD retail. **Analyze video** calculates that video's detections locally and generates its HUD. Progress is shown while processing. **Show detections & HUD** switches between clean original and analyzed video at the same moment. Each example can also be linked as `?video=san-francisco`, `?video=shibuya`, or `?video=retail-najaf`.

Only one worker runs across the gallery. You can watch another original or select the active example to follow progress. Reloading reconnects to running analysis. The HUD is encoded into the analyzed MP4 and remains visible in native fullscreen. Results are calculated before result playback, not live inference during playback.

`vision:source` prepares all registered sources and weights without inference. `vision:prepare` prepares and analyzes all examples. To prepare/analyze just one without affecting others:

```bash
apps/computer-vision/traffic-counter/.venv/bin/python apps/computer-vision/traffic-counter/prepare.py --video retail-najaf --source-only
apps/computer-vision/traffic-counter/.venv/bin/python apps/computer-vision/traffic-counter/prepare.py --video retail-najaf --analyze
```

Do not run CLI preparation while a browser job is active. POSIX setup commands require WSL on Windows. Fresh clones download hash-verified footage and weights; binaries, generated results, environments, and participant reports are not committed.

## Count meaning and retail validation

**People** counts accepted COCO person detections (0), including standing and walking people; **Cars** counts class 2 and excludes buses/trucks/bicycles/motorcycles. Neither metric is unique visitors, walking classification, or cumulative traffic. YOLOX-S uses confidence >=0.35 and class-aware NMS IoU 0.5; Supervision renders its accepted boxes.

The retail clip visibly contains walking shoppers, aisles, and checkouts. [VALIDATION.md](VALIDATION.md) records manual source-frame checks against the actual model output, including occlusion and poster/packaging risks. Model estimates are not an accuracy certification or a production visitor counter. Each video's specific limitations appear in the page.

```bash
npm test
npm run test:vision
npm run check:secrets
```

See [TECHNICAL.md](TECHNICAL.md) for schema v3, selection safety, the globally bounded worker, and per-video retention.
