# Security and credential handling

The Jev demos use a paid provider from a local Node.js server; the computer vision demo uses local Python inference without a provider key. Treat an OpenRouter or Vercel API key as a secret even when it was issued only for a short test.

## Current boundary

- `apps/showcase/server.js` reads `OPENROUTER_API_KEY` or `AI_GATEWAY_API_KEY` from the process environment or the local `.env` file. It sends the key only as a Bearer token to the selected provider over HTTPS.
- The HTTP server binds to `127.0.0.1` by default. Do not change `HOST` to a public address while relying on this unauthenticated evaluation endpoint.
- The browser receives scenario descriptions, a provider label, and reduced probability results. It never receives the key, raw provider metadata, or provider response bodies.
- The Tic Tac Toe page sends the chosen mark and human move indices to local game endpoints. The server owns the board, forwards the current board and a bounded move question to Jev, validates the answer, and returns the updated game state. It saves one local `apps/jev/tic-tac-toe/logs/<id>.jsonl` trace per game, including the board, prompt, sanitized choice probabilities, and deterministic decision audit. It does not save credentials or raw provider metadata in that trace.
- The Coin Toss page asks the server for one Jev request containing Choice, Noul, and Score questions per toss. The provider receives the future-coin prompt and ordinal, not prior results or the actual outcome. After all three valid responses, the server generates an independent coin result. It returns and saves sanitized method signals, predictions, forecast scores, coin result, and matches in `apps/jev/coin-toss/logs/<id>.jsonl`; credentials and raw provider metadata are excluded. Historical v1 and v2 logs retain their original schemas and meanings.
- The participant's A/B selections are validated by the local server but are not forwarded to Jev. The built-in hypothetical cases are sent to the provider.
- No application database or browser storage is used. Completed Moral Machine runs are saved as local JSON files in the Git-ignored `apps/jev/moral-machine/reports/` directory with mode `0600`. Tic Tac Toe and Coin Toss logs are saved in their Git-ignored `logs/` directories with mode `0700` and files with mode `0600`; no automatic deletion is implemented. The provider may retain requests according to its own terms; consult the provider before using private data.

## Local key setup

```bash
cp -n .env.example .env
# Edit .env locally and set one provider key.
chmod 600 .env
npm run check:secrets
```

`.gitignore` excludes `.env` and other `.env*` files except `.env.example`, plus local Moral Machine reports and Tic Tac Toe/Coin Toss logs. The current local `.env` is intentionally **not** part of the MIT-licensed project. Do not add it with `git add -f`, attach it to a task, paste its value into an issue, or place it in a client-side environment variable. Review downloaded reports before sharing them. Use a test key with a spending limit where the provider supports one. Revoke or rotate the temporary demo key after the demo.

## Leak defenses

1. `npm run check:secrets` scans repository-visible files for common key and private-key patterns, fails if Git tracks an `.env` secret file, and verifies that `.env` is ignored.
2. `.githooks/pre-commit` runs the scan before local commits. Enable it in this checkout with `git config core.hooksPath .githooks`.
3. `.github/workflows/check.yml` runs the scan and tests on push and pull request when this repository is hosted on GitHub.
4. The server serves only an explicit static file allowlist; it cannot serve `.env` through a URL. Error responses use controlled messages rather than raw provider bodies.

Pattern scanning is a backstop, not a guarantee. Review diffs before publication, and verify the destination repository has no staged secret with `git status --short --ignored` and `git ls-files .env`. A clean public scan does not prove that a key was never exposed elsewhere.

## Public deployment

The current evaluation, game-move, and coin-toss endpoints would let any caller who reaches them spend the server's provider credits. Before deploying them beyond loopback, add authentication, request rate limits, spending limits, server-side monitoring, and an explicit privacy policy for data sent to the provider. Keep provider keys in the deployment platform's secret store. Do not ship the local `.env` file.

## If a key leaks

Revoke it at the provider first, then issue a replacement. Remove the key from files, commits, logs, screenshots, and artifacts where possible. A key removed from the latest commit may still exist in Git history; treat it as compromised and rotate it regardless of cleanup. Report a suspected leak privately to the repository owner rather than opening a public issue containing the credential.

## Computer vision gallery

`videos.json` is a committed allowlist of three licensed example IDs. `vision:source` downloads only their fixed source URLs plus the pinned ONNX model, checking SHA-256. The worker verifies the selected prepared-source manifest and hashes before analyzing local assets. No downloads or `.env` reads occur during the HTTP-initiated worker.

The local page may start one job **globally across the gallery**. Its bodyless POST requires a loopback peer, matching loopback Origin/Host, custom action header, and same-origin fetch metadata when present. Unknown IDs, paths, URLs, request bodies, arbitrary arguments, and concurrent workers are rejected. The process receives only a registry-validated `--video` ID, fixed interpreter/script, no shell, non-secret environment allowlist, and a five-minute deadline. Raw stderr is never returned. There are no uploads, camera permissions, recognition of identities, or authorization for public deployment.

Each example has its own ignored `data/<videoId>/` original, prepared-source manifest, annotated video, and schema-v3 (traffic/retail) or schema-v4 (configured fruit classes) analysis. Preparing or analyzing one does not replace the others. Source preparation invalidates only that example’s old result; failed analysis retains its last successful files. Successful analysis replaces that example’s result. Local data/caches/environments persist until manually removed; job state is in memory. Old Shibuya v2 evidence remains private under its own directory. Private manifests, legacy outputs, raw Python paths, weights and arbitrary files are not served. The per-ID implementation viewer exposes only the selected public registry entry and a fixed allowlist of implementation source and adapter license files. Request paths and query parameters cannot choose files. Credentials, local results and environment contents are excluded. The explicit registry and per-ID public media/analysis files remain available.

The secret scanner excludes installed environments, caches, bytecode and generated vision data but scans original/vendored source and detects tracked secret .env files. Git ignores all participant histories and generated vision outputs. Publication includes source, registry, attribution, tests and reproducibility instructions, not local media/results, model weights, credentials, or participant choices.

The active fruit example is apple-press, a fixed registry ID with committed BGR input and COCO apple class 47. Neither requests nor query parameters can select a profile or arbitrary classes. Workers and the player validate the saved profile; missing historical inputColor means RGB. The rejected banana-ripening and hudson-fruit-shop IDs are no longer served by media, job or implementation routes. Their ignored historical files remain local/private until manually deleted. Current setup/--all commands process only the four active examples. No saved schema version or other retention behavior changes.
