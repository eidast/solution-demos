## Implementation
- [x] Verify clip and detector licensing and preserve hashes and attribution.
- [x] Implement reproducible local inference and output schema.
- [x] Implement player, synchronized counts, credits, and error states.
- [x] Integrate allowlisted routes and update project documentation.

## Verification
- [x] Inspect actual detections against selected source frames and document limitations.
- [x] Test counting, synchronization helpers, missing data, and media range boundaries.
- [x] Verify video playback, pause, seeking, view switching, and all catalog links in the browser.
- [x] Verify Jev's 13-case browser flow and live provider response after shared server changes.
- [x] Run automated tests, OpenSpec strict validation, and secret checks.

## Evidence

- Verified the Commons CC BY 3.0 file page and author credit; preserved a local source-page capture and SHA-256. Downloaded and verified the actual video and pinned Apache-2.0 model. OpenCV Zoo's exact commit and adapter license are recorded in THIRD_PARTY_ASSETS.md.
- Actual local inference generated 156 frames. Manual source/annotation inspection at excerpt second 6 found the three clearly visible people represented; distant/occluded car counts remain uncertain. Technical documentation states this is not an accuracy benchmark.
- `npm test`: 24 passing Node tests. `npm run test:vision`: 3 passing Python tests, including audit of every real generated frame against its detection rows.
- Browser at a narrow 319px panel: video playback, paused seeking, final frame 156 at 13.00s, and original/annotated switching verified. Counts stayed on the matching frame (including frame 133 with 4 people/8 cars and last frame with 3 people/9 cars). The responsive count cards remain readable without horizontal overflow. Missing output and private boundaries are covered by HTTP tests.
- Shared-server regression: completed all 13 Moral Machine cases in the browser and received a valid live Jev response through OpenRouter; report remains local/ignored with mode 0600. Other legacy routes are covered by the shared-server test.
- OpenSpec strict validation, secret scan, local Markdown link resolution, `.env` ignore and 0600 permissions, and diff whitespace checks passed.
- Changes remain local with no commit or push. Downloaded video, weights, environment, generated clips, and analysis remain Git-ignored.
