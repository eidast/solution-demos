# Video Gallery · Object Counters

Three independent Creative Commons examples share the local YOLOX-S/Supervision player:

| Example | Excerpt | Source / playback dimensions | License |
| --- | --- | --- | --- |
| Fruit shop HD · Hudson Greens | Source seconds 0–24 (24 seconds, explicitly accepted) | Portrait 1080×1920 / 720×1280 | CC BY 4.0 |
| Fruit HD · Banana ripening | Source seconds 0–30 (30 seconds) | 1920×1080 / 1280×720 | CC BY 3.0 |
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

Open `/computer-vision/traffic-counter/`. **Video example** selects a video, initially the HD Hudson fruit shop. **Analyze video** calculates that video's detections locally and generates its HUD. Progress is shown while processing. **Show detections & HUD** switches between clean original and analyzed video at the same moment. Each example can also be linked as `?video=san-francisco`, `?video=shibuya`, `?video=retail-najaf`, `?video=banana-ripening`, or `?video=hudson-fruit-shop`.

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

See [TECHNICAL.md](TECHNICAL.md) for schemas v3/v4, selection safety, the globally bounded worker, and per-video retention.

The **View source code** button opens a keyboard-accessible modal for the selected video. Choose its registry configuration, Python detector/HUD pipeline, browser player/count logic, backend, or the YOLOX adapter and its license. These are the current local implementation files; every video uses the shared pipeline with its own configuration. Close or Escape returns to the demo.

## Fruit counting

**Fruit HD · Banana ripening** uses the same YOLOX-S model and Supervision pipeline with COCO class 46 (`banana`). Its single counter and baked HUD show accepted banana detections per frame; people and cars are excluded. The physical banana remains visible even when the detector returns zero. Of 360 frames in the reference run, 84 have one banana detection and 276 have zero; no frame has more than one. This is a detection demonstration with substantial misses, not production inventory or ripeness grading. The threshold remains 35%. Configurable-class outputs use schema v4 (`classes`, per-frame `counts`); the three traffic/retail examples retain schema v3. See TECHNICAL.md and VALIDATION.md.

## Multi-fruit shop (default)

**Fruit shop HD · Hudson Greens** shows many fruits in a real Napa produce shop, filmed by Sarah Stierch (Missvain). The user explicitly accepted this 24-second CC BY 4.0 portrait HD source. It has separate **Oranges** and **Bananas** counters (COCO 49/46), real local inference, the clean original, annotated HUD, and matching source modal. `?video=hudson-fruit-shop` opens it directly. The single-banana clip remains an optional comparison, not the primary fruit demonstration.

In the reference run, frame 60 (5s) has 9 accepted orange boxes and 4 banana boxes. Some boxes span piles or bunches and miss individual fruits; mangoes/pears are unsupported and may be misclassified. This is not a verified stock count. [VALIDATION.md](VALIDATION.md) records the reference checks. The shop entry explicitly uses BGR model input, while prior examples retain RGB and their earlier results. [TECHNICAL.md](TECHNICAL.md) explains the profile and saved metadata.
