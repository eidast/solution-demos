# Preserve video examples and add validated HD retail

## Why
The user requested that earlier video demos remain available, requested an HD Creative Commons retail example with validation of walking people, and authorized publication.

## What Changes
- Preserve San Francisco (13 seconds) and Shibuya (45 seconds) as independent selectable examples.
- Add a 45-second HD retail excerpt from Al Basheer Shopping Center, Najaf (1280×720, CC BY 3.0).
- Use a committed fixed video registry, separate local output folders, per-video analysis, dynamic attribution, and a selector.
- Keep a single analysis worker across the gallery; accept only committed video IDs.
- Record schema v3 with videoId, preserve old results locally, validate retail detections and publish the approved monorepo/video changes to GitHub.

## Impact
No arbitrary uploads, remote media choices, public inference deployment, identity tracking, or accuracy certification. Runtime files, weights, and generated video/reports stay ignored; fresh clones reproduce the examples from pinned source hashes.
