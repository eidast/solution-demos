# Third-party assets and provenance

The repository MIT license covers original project code and documentation. It does not replace the licenses below. Checked on 19 October 2026 (America/Costa_Rica).

## Active video registry

All three entries remain available. Exact download URLs, hashes and modification notes are committed in [videos.json](videos.json); credits are displayed dynamically for the selected example. Downloads, source-page captures, and derivative media stay local and ignored.

### San Francisco · Street traffic

- Author: **Editor**, https://www.youtube.com/user/Editor.
- Source: https://commons.wikimedia.org/wiki/File:Street_traffic.webm, 28 May 2011.
- License: **CC BY 3.0**, https://creativecommons.org/licenses/by/3.0/; Commons records McZusatz's license review on 3 February 2013.
- Original SHA-256: `e5facb24baf755f0c1193999d823e99f6032661ad2bdef5cc28cc1cbbfde03e2`.
- Restored original example: source seconds 21–34, 1280×720, silent, 12 FPS. Added boxes/HUD only in the analyzed derivative.

### Shibuya · Crossing

- Author: **Emran Kassim**, https://www.flickr.com/people/15622795@N05.
- Source: https://commons.wikimedia.org/wiki/File:Shibuya_Crossing.ogv, 8 October 2008; Flickr https://www.flickr.com/photos/15622795@N05/2922954559/.
- License: **CC BY 2.0**, https://creativecommons.org/licenses/by/2.0/; Commons records a DrJunge review on 22 December 2009.
- Original SHA-256: `68f0d2f3b7acd107c462ac14ba30c7ffce7572594b30fe576c45f68ad1b43d42`.
- Source-page capture .cache/shibuya-source-page.html SHA-256: `df7c8f5b5a1d51b21dc6f648b851504329b2495670b53b8dbabcd363d12aaa69`.
- Excerpt 0–45 seconds; 640×480 source upscaled to 960×720 with 4:3 preserved, silent 12 FPS. Added boxes/HUD only in the analyzed derivative.

### Retail HD · Al Basheer Shopping Center, Najaf

- Author/attribution: **Al Basheer Shopping Center (مركز البشير للتسوق)**, https://www.youtube.com/channel/UCMnJZZP_rusJmO7fBPQI7HA. The original proper name is retained for attribution.
- Source: https://commons.wikimedia.org/wiki/File:Al_Basheer_shopping_center,_Najaf.webm.
- Original: https://www.youtube.com/watch?v=wQpLZf6jQiQ, 14 January 2018; 52.364 seconds, native **1280×720 HD**, 19,791,246 bytes.
- License: **CC BY 3.0 Unported**, https://creativecommons.org/licenses/by/3.0/. Commons records YouTubeReviewBot's license verification on 14 February 2020; it does not certify unrelated personality, trademark or depicted-artwork rights.
- Download: https://upload.wikimedia.org/wikipedia/commons/9/9a/Al_Basheer_shopping_center%2C_Najaf.webm.
- Original SHA-256: `41efc76d6a9da42788b821f3116534591abcb8df92d1a83ad060a97f34b52be2`.
- Local source .cache/retail-najaf.webm; source-page capture .cache/retail-source-page.html SHA-256 `cf463b02f0f00e6788234482c6ad0585ea905599eeb3a867388e8220368b2199` (retrieval snapshot, not a live service).
- Changes: source seconds 6–51, native HD dimensions retained, silent 12 FPS H.264; analyzed derivative adds model boxes and HUD. No endorsement implied. Required title/author/license/source and changes appear in the selected demo.
- Validation concerns: real walking/standing people, shelves, promotional portraits, scene cuts and camera movement. See VALIDATION.md. The video is not a demographic or identity dataset.

The unused 4K Yevropeisky escalator candidate was inspected but not added: only 20.6 seconds long and not suitable for the requested walking-retail scene. No candidate footage is included in Git. Licenses above apply to media independently of the repository MIT license; retain attribution/license and modification notes when sharing derivatives.

## Fruit HD · Banana ripening

- Source: [Time Lapse Banana Ripening](https://commons.wikimedia.org/wiki/File:Time_Lapse_Banana_Ripening.webm), by [mauiwowialoha](https://www.youtube.com/user/mauiwowialoha), 12 May 2015. Original YouTube: https://www.youtube.com/watch?v=EAjPKdCPFWM.
- License: [CC BY 3.0 Unported](https://creativecommons.org/licenses/by/3.0/); Commons records INeverCry's license review on 15 May 2016. No endorsement implied.
- Original: 1920×1080, 30.03 seconds; https://upload.wikimedia.org/wikipedia/commons/d/d7/Time_Lapse_Banana_Ripening.webm.
- SHA-256: `4cfe817d09dc96c5846d2577664044fd56ac97475b59b79c10eac6b00d62c7a1`. Cached as `.cache/banana-ripening.webm`; not committed.
- Changes: first 30 seconds, resized to 1280×720 at 12 FPS, silent H.264. Only the analyzed derivative has boxes and the banana HUD. The derivative retains CC BY 3.0 media attribution independently of the project's MIT code license.
- Source-page retrieval snapshot: `.cache/banana-source-page.html`, SHA-256 `eb4bbe8f64463deccb00d5820cef629c73e5d1875a1d5eb06e77fd182575ab49`.
- The timelapse shows one banana changing appearance. Detection is intermittent; it is not a ripeness classifier, inventory system or multi-fruit benchmark. See VALIDATION.md.

## YOLOX model and adapter

- Model family: YOLOX-S, COCO 80-class detector; https://github.com/Megvii-BaseDetection/YOLOX.
- Distributor: OpenCV Zoo, https://github.com/opencv/opencv_zoo/tree/47534e27c9851bb1128ccc0102f1145e27f23f98/models/object_detection_yolox.
- Exact OpenCV Zoo commit: `47534e27c9851bb1128ccc0102f1145e27f23f98`.
- Adapter: `third_party/yolox.py`, copied verbatim from that commit's `models/object_detection_yolox/yolox.py`. SHA-256: `c99d8f103d93d27d0fb1807c7b91cb32d2d6c4959326cb88c801f17d00468f84`.
- Attribution: OpenCV Zoo, contributor Sri Siddarth Chakaravarthy (GSoC 2022), and YOLOX/Megvii. The model-directory license includes Copyright (c) 2021–2022 Megvii Inc.
- License: **Apache License 2.0**, preserved in [third_party/YOLOX-LICENSE](third_party/YOLOX-LICENSE). OpenCV Zoo's directory README states that all files in the model directory use that license. No separate model-directory NOTICE file was present at retrieval.
- Weights: `object_detection_yolox_2022nov.onnx`, 35,858,002 bytes, SHA-256 `c5c2d13e59ae883e6af3b45daea64af4833a4951c92d116ec270d9ddbe998063`.
- Download: https://media.githubusercontent.com/media/opencv/opencv_zoo/47534e27c9851bb1128ccc0102f1145e27f23f98/models/object_detection_yolox/object_detection_yolox_2022nov.onnx.
- Weights remain in ignored `.cache/yolox-s.onnx`; preparation checks the exact hash before loading them. Model and adapter licensing is separate from footage rights and is not an accuracy certification.

## Runtime libraries

Supervision 0.31.0 is MIT licensed: https://github.com/roboflow/supervision. OpenCV uses Apache 2.0: https://opencv.org/license/. `requirements.txt` pins the Python environment used for this example; dependencies retain their own licenses. FFmpeg is an external system prerequisite; no FFmpeg binary is copied into this repository. The demo uses local inference and does not require a Roboflow account or service.
