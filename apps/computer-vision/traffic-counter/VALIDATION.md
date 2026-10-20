# HD retail validation record

This is a controlled local model run on Creative Commons footage, not a production accuracy study. The selected excerpt is source seconds 6–51 of Al Basheer Shopping Center, Najaf, native 1280×720 HD, CC BY 3.0. Source/author/license and transformations are in [THIRD_PARTY_ASSETS.md](THIRD_PARTY_ASSETS.md). The first moment still shows the exterior approach, followed by interior aisles and checkouts.

## Method

YOLOX-S/OpenCV inference with model SHA-256 `c5c2d13e59ae883e6af3b45daea64af4833a4951c92d116ec270d9ddbe998063`, confidence >=0.35 and NMS IoU 0.5; Supervision 0.31.0 annotations; 12 FPS, 540 frames. Source SHA-256: `41efc76d6a9da42788b821f3116534591abcb8df92d1a83ad060a97f34b52be2`. Original and annotated full-resolution frames were inspected at excerpt seconds 0, 2, 10, 22, and 38. Exact count references were recorded only where the reviewer could identify visible physical people; promotional portraits were not counted as physical people.

## Reference spot checks

| Excerpt time / source time | Frame index | Manual visible physical people | Model people | Observation |
| --- | --- | --- | --- | --- |
| 2s / 8s | 24 | 4 | 4 | Foreground woman walking toward the camera, a person beside the left shelf, and two people farther up the aisle. All four receive boxes. The promotional portrait on the lower-left product display is not counted. |
| 22s / 28s | 264 | 2 | 1 | Two people overlap at the far-left edge; the model yields one accepted box. This is an observed miss/merge under occlusion. |

At both reference times Cars is 0, consistent with the interior scene. Other inspected frames show moving shoppers and standing customers/checkouts, but no exact full-frame reference counts were assigned to those frames. People includes standing and walking persons; no movement classifier or unique customer count is implemented.

The first full retail run completed 540 frames in 55.87 seconds on the development computer. Every saved people/car count was checked against its actual accepted detection rows. A repeat calculation was also started from the gallery UI to verify progress and example isolation. Runtime is an observation, not a real-time performance promise.

These two references do not establish full-video precision, recall, tracking accuracy, or commercial suitability. Do not turn the table into a single accuracy percentage. Camera cuts, motion, occlusion, dark clothing, and people depicted in retail imagery remain limitations. HD improves source detail but does not guarantee detection correctness.

## Preserved examples

San Francisco retains its original 13-second excerpt (156 frames), with the clean source and new schema-v3 HUD result in its own folder. Shibuya retains its 45-second excerpt (540 frames), with 4:3 preserved and documented low-resolution undercounting. Preparing/analyzing another selected example does not replace these files. All three examples use real inference; no count is fabricated for missing analysis.
