# Reorganize Solution Demos

## Why
The repository hosts three Jev exercises but needs to present solutions across technologies, starting with a planned Supervision traffic counter. Its name and flat layout currently imply a Jev-only collection.

## What Changes
- Rename the project and GitHub repository to `solution-demos`.
- Move the portal and loopback server into `apps/showcase` and Jev exercises into `apps/jev` as private npm workspaces.
- Preserve existing public routes, provider contracts, experiment protocols, and local data while updating filesystem paths.
- Group the portal by capability and mark the future computer vision demo as planned.
- Document the monorepo and the intended traffic counter without claiming it is runnable.

## Impact
This is a structural migration and catalog update. The Supervision implementation, model selection, footage acquisition, public deployment, and shared client extraction are outside this change. Existing uncommitted work is preserved. The local checkout folder remains in place so active tools are not invalidated; the Git remote changes to the new repository name.
