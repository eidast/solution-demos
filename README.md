# Solution Demos

A monorepo of local demos showing how technologies can solve practical problems. The catalog groups demos by capability and distinguishes working exercises from planned solutions.

## Demo catalog

| Category | Demo | Status | What it demonstrates |
| --- | --- | --- | --- |
| AI decisions · Jev | [Moral Machine × Jev](apps/jev/moral-machine/README.md) | Implemented; sample mode available | Compare 13 participant choices in original dilemmas with Jev's A/B probabilities. |
| AI decisions · Jev | [Tic Tac Toe × Jev](apps/jev/tic-tac-toe/README.md) | Implemented; provider key required | Rules and minimax constrain candidate squares; Jev selects the final move. |
| AI decisions · Jev | [Coin Toss × Jev](apps/jev/coin-toss/README.md) | Implemented; provider key required | Compare Choice, Noul, and Score forecasts against 100 independent software coin flips. |
| Computer vision · Supervision | [Object Counters](apps/computer-vision/traffic-counter/README.md) | Implemented; prepare source first | Choose traffic, retail or an HD fruit shop; calculate per-frame people/car or orange/banana detections and compare the clean original with its HUD. |

Jev probabilities describe model answers, not human vote shares or proof of correctness. Moral Machine uses original demo scenarios rather than official experiment cases. The computer vision gallery preserves five independent examples and calculates real detections when you press Analyze video. Clean originals and per-video results remain available. Its video attribution and separate model/adapter licenses are documented in [the credits](apps/computer-vision/traffic-counter/THIRD_PARTY_ASSETS.md).

## Run locally

Requires Node.js 22 or newer. The showcase and Jev apps use Node.js built-ins and browser JavaScript; no dependency installation or build step is needed to run those apps.

```bash
npm start
```

Open <http://127.0.0.1:3000/>. Use `PORT=3117 npm start` for another port. The root command starts the `@solution-demos/showcase` workspace. Existing routes remain `/MoralMachine/`, `/TicTacToe/`, and `/CoinToss/`.

On macOS, double-click [scripts/start-macos.command](scripts/start-macos.command) in Finder or run:

```bash
./scripts/start-macos.command
```

The launcher creates a local `.env` with restrictive permissions if needed, selects an available port starting at 3000, and opens the catalog. Add `OPENROUTER_API_KEY` or `AI_GATEWAY_API_KEY` to the root `.env` to use Jev, then restart. Keys stay on the server. Moral Machine has a clearly labeled sample mode without a key; Tic Tac Toe and Coin Toss require a key. A complete Coin Toss run uses 100 successful paid provider requests. Close the launcher Terminal window or press Control-C to stop it.

## Prepare the computer vision example

Install Python 3.13, uv, and FFmpeg, then run from the repository root:

```bash
npm run vision:setup
npm run vision:source
npm start
```

Open `/computer-vision/traffic-counter/`. Source preparation downloads five hash-verified Creative Commons videos and YOLOX-S weights. Select San Francisco (13 seconds), Shibuya (45 seconds), native HD retail (45 seconds), HD banana ripening (30 seconds), or the multi-fruit shop (24 seconds), then press **Analyze video** to run that example’s local OpenCV/Supervision calculation and generate its own HUD. Other examples are preserved. No provider key is required for this demo. **People**, **Cars**, **Oranges**, and **Bananas** describe accepted detections in the displayed frame, not unique objects or cumulative traffic. The page lets you pause, seek, and compare the original and annotated clip. See [setup, attribution, and limits](apps/computer-vision/traffic-counter/README.md).

## Repository layout

```text
apps/
  showcase/                       # Catalog and shared loopback HTTP server
  jev/
    moral-machine/                # 13-case exercise, reports, and protocol
    tic-tac-toe/                   # Game, decision policy, and local logs
    coin-toss/                    # Experiment, protocol, and local logs
  computer-vision/
    traffic-counter/              # Local Python analysis and browser video demo
scripts/                          # Launch, secret scan, and log analysis
test/                            # Shared regression tests
docs/                            # Integration and monorepo documentation
openspec/                        # Change specifications
```

The showcase and three JavaScript demos are private npm workspaces. The computer vision demo manages its own isolated Python environment. Shared packages can be extracted when needed; this migration adds no shared-client abstraction or framework. The root `server.js` remains a compatibility entry point for existing launch commands.

Saved reports and logs moved with each Jev demo and remain local and Git-ignored. Their schemas, permissions, and retention policies are unchanged. The root `.env` remains in place. See [monorepo conventions](docs/MONOREPO.md), [integration contracts](docs/INTEGRATIONS.md), and [security](SECURITY.md).

## Verify

```bash
npm test
npm run check:secrets
npm run analyze:tictactoe
# After preparing the computer vision environment:
npm run test:vision
openspec validate --all --strict --no-interactive
```

Automated tests do not establish current provider availability. UI or evaluation changes also require the 13-case browser flow and a live provider check.

## Adding a demo

Create an isolated folder under its capability in `apps/`, with a README describing the problem, implemented behavior, launch instructions, requirements, data handling, licenses, and limits. Record material changes in OpenSpec and add the demo to the catalog. Label planned work explicitly. Keep credentials and local outputs out of Git, and expose only explicitly allowed browser files through the showcase server.

## License and credits

Original code and documentation are [MIT licensed](LICENSE). Moral Machine portraits have [separate attribution and license scope](apps/jev/moral-machine/THIRD_PARTY_ASSETS.md). Computer vision footage uses CC BY 2.0 and CC BY 3.0; its detector weights and vendored adapter are Apache 2.0, as recorded in [their separate credits](apps/computer-vision/traffic-counter/THIRD_PARTY_ASSETS.md).

The **View source code** button opens a keyboard-accessible modal for the selected video. Choose its registry configuration, Python detector/HUD pipeline, browser player/count logic, backend, or the YOLOX adapter and its license. These are the current local implementation files; every video uses the shared pipeline with its own configuration. Close or Escape returns to the demo.
