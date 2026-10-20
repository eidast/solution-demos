# Design

Use npm workspaces for the existing JavaScript applications without adding a framework, build system, or dependencies. The root starts `apps/showcase/server.js`; the old root server entry remains a compatibility import. The shared local server keeps its static allowlist and original `/MoralMachine/`, `/TicTacToe/`, `/CoinToss/`, and API routes. Workspace package manifests are private.

Move whole exercise directories, including ignored local reports and logs. Update ignore rules at the same time. Report schemas, snapshot contents, permissions, and retention do not change; only their parent paths do. The root `.env` remains the server-only credential location.

The portal retains its current visual styling and gains English capability headings, current demo links, and a non-interactive planned traffic-counter card. The proposed computer vision experience is documented separately: local short video, detector plus tracker plus Supervision annotations and line counts, original/processed comparison, and line repositioning followed by reprocessing. Implementation requires a separate change with model and footage provenance.

Do not create an empty shared-client package. Extract shared provider behavior only when a later change needs it. Keep the local checkout directory unchanged; rename the GitHub repository after validation and update origin.
