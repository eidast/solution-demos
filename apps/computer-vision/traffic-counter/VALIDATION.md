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

## Retired reference run · Banana ripening

Source: mauiwowialoha's Time Lapse Banana Ripening (CC BY 3.0), pinned in videos.json. First 30 seconds, HD 1280×720 playback at 12 FPS. Local YOLOX-S and Supervision processed all 360 frames in 31.32 seconds. Counts use the unchanged 0.35 confidence threshold and class-aware NMS at 0.5 IoU.

One physical banana remains visible throughout the timelapse. Reference frame 60 (5.00s) has one accepted banana detection (confidence 0.67646). Frame 180 (15.00s) has one accepted detection (0.35488). Frames 0, 300 (25.00s), and 348 (29.00s) have zero accepted detections despite the visible banana. The peel's changing appearance and close framing affect this detector. The full output contains 84 frames with one banana detection and 276 frames with zero; none has more than one. These are observed results of one controlled local run, not a certified accuracy or a dataset benchmark. No threshold tuning or fabricated boxes/counters were applied.

The card, HUD and saved schema-v4 per-frame counts are derived from the same accepted rows. Original footage, caches and result files remain local/ignored. Existing traffic/retail results remain intact.

## Retired reference run · Multi-fruit shop

The user accepted the 24-second portrait HD source from Hudson Greens and Goods, Napa, by Sarah Stierch (Missvain), CC BY 4.0. All 288 frames were processed at 720×1280 and 12 FPS in 26.19s using the pinned YOLOX-S weights, confidence 0.35 and class-aware NMS 0.5. The shop's committed inputColor is BGR; prior results and profiles remain intact. With the same raw source frame at 5s, RGB yielded one apple-class detection and no accepted oranges/bananas, whereas BGR produced visible orange/banana boxes. This is a bounded profile comparison, not an accuracy benchmark. Upstream profile differences are linked in TECHNICAL.md.

Reference frame 60 (5.00s) contains 9 accepted orange boxes and 4 banana boxes, matching the HUD and cards. Visual inspection shows multiple trays of blood oranges, other citrus, banana bunches and mangoes. Some banana boxes span bunches and one orange box spans a large part of a pile; the detector does not resolve every fruit individually. Some overlapping/group boxes survive NMS. Mangoes are not a supported target and may be confused with target fruit. The manual reference is therefore not a ground-truth count of 9 individual oranges or 4 individual bananas.

Further saved frames: 0s = oranges 1 / bananas 0; 3s = 3 / 4; 10s = 12 / 0; 15s = 3 / 0; 20s = 12 / 0; 21s = 12 / 0; 23s = 3 / 0. Across this run the accepted counts range from 1–16 orange boxes and 0–6 banana boxes. This verifies changing multi-object detections and explicit limitations, not complete stock or unique-fruit accuracy. Python audits every counter against its accepted class rows; browser checks verify original/HUD time preservation and selected source configuration.

## Landscape apple replacement

The portrait shop and single-banana entries were removed from the active gallery at the user's request. Historical reference runs above do not describe currently selectable examples. The replacement is a 30-second landscape HD apple-press excerpt, source 8–38 seconds, at 1280×720 and 12 FPS. It retains schema v4 and the committed BGR input profile with COCO apple class 47, confidence 0.35 and NMS IoU 0.5. The initial full run completed 360 frames in 31.6s, with 159 frames containing at least one accepted apple detection and a range of 0–19 boxes. These are detector observations, not a certified accuracy percentage.

At excerpt 22s / source 30s, frame 264 has 16 accepted apple boxes. Visual inspection confirms many physical apples entering the crusher, with several grouped/overlapping boxes and missed fruit; 16 is not a complete manual inventory count. At excerpt 10s / source 18s, frame 120 has 17 accepted boxes. Other reference counts are 0s = 3, 2s = 2, 12s = 1, 24s = 16, and 29s = 0. Zero-count scenes include machinery and chopped/occluded fruit.

Browser checks at desktop 1440×1000 and mobile 390×844 confirmed a 16:9 contained player. Mobile content width equals viewport width (390px); the video was 348×195.75. Shibuya's intrinsic 960×720 source is letterboxed in the same box and retains its saved 8-person/4-car first frame. The apple HUD and card agreed on 13 at 22.17s; seeking and original/HUD switching were checked. The source modal identifies apple-press and the old fruit IDs are absent from the four-entry selector. Automated route checks reject both retired IDs for source, annotated media, analysis, status, action and source viewing.
