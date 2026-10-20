## Implementation
- [x] Verify HD retail footage, provenance, and sample frames.
- [x] Preserve old examples and isolate files through a fixed registry.
- [x] Add per-video jobs, global concurrency control, and selection-safe UI.
- [x] Update schema, attribution, README, security, and validation records.

## Verification and publication
- [x] Prepare/analyze all three examples and audit retail reference frames.
- [x] Verify selector, original/HUD switching, progress, and legacy access in browser.
- [x] Run tests, OpenSpec strict validation, secrets, and private-file checks.
- [x] Verify Jev's 13-case flow and live provider response.
- [x] Commit/push only approved project files and verify GitHub publication/CI.

## Validation evidence

- Registry retains San Francisco (156 frames), Shibuya (540 frames), and adds native-HD retail (540 frames); actual schema-v3 inference completed for each in isolated folders.
- Retail reference: excerpt 2s / source 8s has four physical people and four accepted person detections, without counting the printed promotional portrait. Excerpt 22s / source 28s shows two overlapping people but one accepted detection. VALIDATION.md records these observations without claiming full-video accuracy.
- Browser: selected restored San Francisco and Shibuya using the gallery, then ran a new retail job from Analyze video. While retail was active, selecting San Francisco displayed its own saved 1-person/9-car first frame and disabled a second worker; original/HUD access and per-video attribution were preserved.
- 29 Node tests and 3 Python tests passed, including global job concurrency, matching result IDs, isolated media routing, private paths, and actual count/detection agreement for all three examples.
- Strict OpenSpec, secret scan, Markdown links, and whitespace checks passed. Downloaded footage, weights, generated results, .env, and participant reports remain ignored.

## Publication

- Approved monorepo and video gallery source published on main as a10cd25681df79c73e6233d4b1dd49af237fcab1.
- GitHub Check completed successfully for that implementation commit: https://github.com/eidast/solution-demos/actions/runs/39369447548.
- The final live Jev regression returned all 13 cases through OpenRouter; its local report remains ignored with mode 0600.
- Staged-path audit confirmed no credentials, runtime environments/caches, generated media/analysis, or participant reports were included. Originals and generated videos remain local, reproducible from the committed registry and setup commands.
