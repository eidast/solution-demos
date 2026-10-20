## Implementation
- [x] Move apps and local histories; update workspaces, imports, launchers, and ignores.
- [x] Update portal, root README, exercise docs, and repository instructions.
- [x] Document the planned Supervision traffic counter.

## Verification
- [x] Validate OpenSpec, automated tests, static routes, and private-file boundaries.
- [x] Verify the browser catalog and 13-case exercise; attempt a live Jev evaluation and record the result.
- [x] Check secrets and local credential permissions.
- [x] Rename the GitHub repository and update origin after local validation.

## Verification evidence

- `npm test`: 21 passing tests, including workspace startup from a different working directory, legacy routes, portrait serving, and private static-file boundaries.
- `npm run check:secrets`: passed; root `.env` is ignored and mode `0600`.
- `npm run analyze:tictactoe`: historical logs remain readable from the relocated directory.
- `openspec validate --all --strict --no-interactive`: passed.
- Browser: catalog categories and planned status verified; all three exercise pages open. Completed the 13-case Moral Machine flow with controlled all-A test choices and received a valid live OpenRouter Jev response. The resulting local report is ignored and mode `0600`; no participant choices or reports are published.
- GitHub rename verified as `eidast/solution-demos`; origin uses the new SSH URL. Local checkout folder remains unchanged.
- No commit or push performed; pre-existing local changes are preserved in the reorganized working tree.
