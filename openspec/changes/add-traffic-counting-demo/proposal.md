# Add the people and cars video demo

## Why
The user approved the monorepo catalog and requested a Creative Commons traffic video with on-screen counts of people and cars.

## What Changes
- Add a runnable local, prerecorded computer vision demo at `/computer-vision/traffic-counter/`.
- Use a verified CC BY 3.0 San Francisco street clip with visible attribution, source hashes, and modification notes.
- Run actual YOLOX-S inference through OpenCV and use Supervision for detections and annotations.
- Preprocess a 13-second excerpt into original and annotated browser-compatible video plus synchronized per-frame counts.
- Expose only fixed generated assets, with media range support, and mark absent assets as not prepared.
- Update the catalog, README, integration, security, and data documentation.

## Impact
No uploads, webcam, live inference, unique-person tracking, line-crossing totals, or production accuracy claims. The user narrowed this iteration to visible people/car counts; the previously proposed adjustable line remains future work. Jev contracts and local histories are unchanged.
