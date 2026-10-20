# Repository rules

These rules apply to every change in this repository.

## Language and documentation

- Write source code, identifiers, comments, UI text, tests, and documentation in English.
- Keep `README.md`, `apps/jev/moral-machine/EXPERIMENT.md`, `apps/jev/coin-toss/EXPERIMENT.md`, `docs/INTEGRATIONS.md`, `SECURITY.md`, and exercise READMEs aligned with the behavior that is actually implemented. Document changes to each saved run schema and retention behavior in its experiment or technical design file.
- Preserve the distinction between original demo cases, the published Moral Machine experiment, and Jev model outputs. Never describe demo cases as official cases or model probabilities as human vote shares.
- Record material changes to the 13-case protocol, model question wording, provider IDs, or reported metrics in `apps/jev/moral-machine/EXPERIMENT.md` before calling a change complete.

## License and attribution

- The original code and documentation in this repository are MIT licensed; keep `LICENSE` and the `license` field in `package.json`.
- Do not copy Moral Machine artwork, scenario data, or third-party code into this project without checking their separate rights and recording provenance.
- Keep `apps/jev/moral-machine/THIRD_PARTY_ASSETS.md` and the visible credits page aligned with any third-party artwork. Do not imply the repository's MIT license covers copied artwork.
- Use only controlled test runs or synthetic data in public README media. Label example model outputs as one run and do not publish participants' local report files or choices without their instruction.

## Secrets and verification

- Never commit, paste into documentation, log, or send API keys to the browser. Keep local credentials only in ignored `.env` files or environment variables.
- Keep saved run reports local and ignored by Git. Do not include API keys or raw provider metadata in a report, and preserve the exact scenario snapshot so historical reports remain interpretable.
- Run `npm run check:secrets` before staging or publishing changes. Verify that `.env` is ignored and has restrictive local permissions.
- Keep the development server bound to loopback by default. Any public deployment needs a separate authenticated backend and rate limits before using a paid key.
- Verify the 13-case flow in the browser and the live provider response after changes to the UI or evaluation path. A sample-mode run alone does not verify Jev.

## Monorepo layout

- Keep the catalog and loopback server in `apps/showcase`, Jev exercises in `apps/jev`, and computer vision demos in `apps/computer-vision`.
- Use Node.js 22 or newer for the existing JavaScript workspaces. Keep root launch and verification commands working.
- Preserve existing public exercise and API routes during filesystem-only reorganizations.
- Keep each demo's protocol, attribution, and local data rules with that demo. Planned catalog entries must not imply a runnable implementation.
- Root credentials stay in the ignored root `.env`. Reports and logs remain ignored under their owning demo.

## Video gallery preservation

- Adding a video must preserve existing registered examples, source credits, and per-video output directories. Add a new registry ID instead of replacing an earlier example.
- Keep the shared videos.json registry, browser selection, Python worker, per-video result schema, license provenance and validation records aligned. Do not label detected people as unique visitors or a walking classifier.
