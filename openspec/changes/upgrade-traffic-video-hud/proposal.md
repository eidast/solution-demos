# Longer licensed video with in-demo analysis and HUD

## Why
The user requested a different Creative Commons video at least 30 seconds long, calculation initiated from the demo, a HUD, and continued access to the original video.

## What Changes
- Replace the 13-second San Francisco example with 45 seconds of Emran Kassim's 90-second Shibuya Crossing video, CC BY 2.0.
- Make the original available before inference. Add a local Analyze video action with progress and controlled failure handling.
- Run one fixed local Python job at a time, with no request-supplied paths, URLs, credentials, or arguments.
- Render a readable people/car HUD into the analyzed video, preserve aspect ratio, and retain synchronized original/results comparison.
- Document schema v2, output replacement, origin/loopback controls, and new source attribution.

## Impact
This supersedes the earlier no-HTTP-processing constraint only for the fixed licensed example. Uploads, arbitrary media, cloud inference, unique identity tracking, and public deployment remain outside scope. Jev behavior is unchanged.
