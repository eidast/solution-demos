# Design

videos.json is the single committed registry consumed by Python, Node, and the browser. It contains three fixed IDs, dimensions, FPS, source excerpts, licenses, attribution, hashes, and explicit limitations. Existing San Francisco and Shibuya sources retain their respective excerpts. Retail uses source seconds 6–51, preserves native 1280×720 HD, and retains visible attribution including the source author's original name.

Store data/<videoId>/{source.mp4,prepared-source.json,annotated.mp4,analysis.json}. Preparation and successful analysis replace only the selected video's files. Migrate the prior flat Shibuya files without deleting them; retain its v2 analysis as a legacy file before generating new output. Schema v3 adds videoId and validates results against the selected registry ID. Counts remain accepted detections per frame.

Serve only fixed frontend files, the registry, and exact media/result paths for known IDs. Expose per-video job endpoints and retain default Shibuya aliases for existing links. One manager owns one job per video but permits only one running worker globally. Worker arguments contain only a registry-validated ID. Existing loopback, bodyless, origin, action-header, environment-allowlist and deadline controls remain. Changing selected video never changes the running worker; the page can reconnect to its progress and does not attach stale fetch results to a different selection.

The selector changes the original video, credits, aspect ratio, duration, and count context. Original/result toggle and HUD remain available independently per example. No-analysis states use em dashes rather than fabricated counts. The page defaults to the HD retail example and accepts known ?video= links for gallery entry points. Browser inference uses the committed model, not a manually chosen result.

Validate retail frames against visible people in selected full-resolution source frames, record misses and non-person objects, and distinguish real detector rows from manual reference counts. Publish only source, registry, tests, and documentation after secret and licensing checks; ignored assets and participant reports are never staged.
