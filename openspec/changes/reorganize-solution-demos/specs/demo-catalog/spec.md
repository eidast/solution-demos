## ADDED Requirements

### Requirement: Capability-based demo monorepo
The repository SHALL present independent demos by capability, with the portal in `apps/showcase`, existing Jev exercises in `apps/jev`, and future computer vision work in `apps/computer-vision`.

#### Scenario: Open the catalog
- **WHEN** a user opens the root page
- **THEN** the catalog identifies itself as Solution Demos, groups the three working Jev exercises, and labels the traffic counter as planned without a runnable action

### Requirement: Backward-compatible local exercises
The migration SHALL preserve existing HTTP routes, provider requests, experiment behavior, and saved data while updating filesystem references.

#### Scenario: Start after migration
- **WHEN** the user runs `npm start` or the macOS launcher from the repository root
- **THEN** the loopback server serves all three existing exercise routes using root credentials and the relocated local report and log directories

#### Scenario: Preserve local history
- **WHEN** an existing checkout is reorganized
- **THEN** existing ignored reports and logs move with their exercise, remain ignored, and keep their schema, permissions, and retention policy

### Requirement: Accurate project identity and documentation
The package metadata, portal, README, launch messages, and Git remote SHALL reflect the Solution Demos identity. Documentation SHALL distinguish implemented Jev demos from planned Supervision work.

#### Scenario: Read the computer vision plan
- **WHEN** a reader opens the traffic counter README
- **THEN** it states that implementation, model choice, and footage rights verification are pending
