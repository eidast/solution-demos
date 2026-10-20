## Tasks
- [x] Verify source rights, dimensions, and user acceptance of 24 seconds.
- [x] Test model output before adding the example and record channel-profile distinction.
- [x] Add per-class UI and isolated new registry entry.
- [x] Calculate all shop frames and inspect reference boxes against fruit displays.
- [x] Verify original/HUD/source modal and legacy examples in browser.
- [x] Update docs, test, validate OpenSpec/secrets and publish scoped source.

## Evidence
- The user explicitly accepted the 24-second alternative; source is portrait 1080×1920, CC BY 4.0 with Sarah Stierch attribution and pinned source/capture hashes.
- Actual first inference completed 288 frames in 26.19s. At 5s the HUD/card rows agree on 9 orange and 4 banana detections; validation documents grouped boxes and missed/unsupported fruit rather than presenting them as exact individual stock counts.
- Browser Analyze again completed with the expected schema-v4 classes and BGR metadata. Original/HUD toggling retains the 5-second position, the source modal contains the selected shop configuration, and San Francisco retains its prior v3 1-person/9-car first frame.
- 31 Node and 5 Python tests pass, including both input channel orders, profile mismatch rejection, per-class counts and audits of all five real results. Strict OpenSpec, secret scan, whitespace and private-file checks pass; .env remains ignored with mode 0600.
- Jev regression completed all 13 cases in the browser and received a live OpenRouter response; the controlled report stays local/ignored.
