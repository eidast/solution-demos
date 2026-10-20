## Implementation
- [x] Add fixed selected-video source endpoint.
- [x] Add accessible native modal with actual source file selection.
- [x] Update documentation and preserve all examples.

## Verification
- [x] Verify route boundaries, tests, secrets and strict OpenSpec.
- [x] Verify modal selection, close, keyboard and existing demos in browser.

## Evidence
- 29 Node tests and 3 Python tests pass; fixed source responses match all three selected registry IDs, ignore arbitrary file queries and reject unknown IDs/non-read methods. Raw private paths remain blocked.
- Browser verified retail and Shibuya configuration, real prepare.py selection, narrow-screen code scrolling, Close/Escape and trigger focus restoration. All existing examples remain registered and retain their originals/results.
- Existing Jev browser flow completed all 13 cases and received a live OpenRouter response; the report remains local and ignored.
- Strict OpenSpec, whitespace checks and secret scan pass; root .env is ignored with mode 0600. No saved schema or retention behavior changed.
