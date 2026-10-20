# Monorepo conventions

Solution Demos groups independent solutions by capability. `apps/showcase` owns the English catalog and shared loopback server. `apps/jev` contains the existing JavaScript workspaces; `apps/computer-vision` reserves future computer vision solutions. Root commands provide a single local entry point and shared verification without requiring a build framework.

## Structural migration

| Previous location | Current location | Existing HTTP route |
| --- | --- | --- |
| `site/index.html` | `apps/showcase/index.html` | `/` |
| `server.js` | `apps/showcase/server.js` (root compatibility import retained) | Existing API routes |
| `MoralMachine/` | `apps/jev/moral-machine/` | `/MoralMachine/` |
| `TicTacToe/` | `apps/jev/tic-tac-toe/` | `/TicTacToe/` |
| `CoinToss/` | `apps/jev/coin-toss/` | `/CoinToss/` |

The working checkout migration moves entire directories, including ignored `reports/` and `logs/`. Nothing is uploaded or deleted by that move. Report schemas, permissions, scenario snapshots, and retention behavior remain unchanged. Fresh clones contain no historical local outputs. If updating a different existing checkout, stop its server and move any ignored history from the previous directories into the corresponding new directory before restarting. Do not overwrite same-named output files; resolve any collision manually. Keep the root `.env` in place.

The repository's new GitHub name is `eidast/solution-demos`. The active local folder may remain `jev-decision-demos` so editor and tool paths continue to work; clone names and runtime behavior are independent. Existing clones can update origin with `git remote set-url origin git@github.com:eidast/solution-demos.git`.

## Runtime and boundaries

Use Node.js 22 or newer. `npm start` runs the showcase workspace. The macOS launcher resolves the root from its own location and invokes the same server. The server resolves credentials and data paths relative to the repository rather than the caller's working directory. Root `node server.js` remains supported.

Only allowlisted HTML, CSS, JavaScript, portrait assets, and the computer vision demo's fixed generated MP4/JSON outputs are served. Workspace manifests, documentation, local reports, logs, `.env`, and arbitrary source files are not static assets. Existing API report access remains local as documented in [SECURITY.md](../SECURITY.md). Public deployment still requires an authenticated backend and rate limits.

Keep demo-specific algorithms, assets, tests, and protocols separate. Add shared packages only for concrete shared needs. The computer vision application declares pinned Python requirements and uses an ignored `.venv`; its local preparation is invoked through root npm scripts. An npm workspace is not required for Python code. Catalog entries must accurately state whether they are runnable, configured, or planned.
