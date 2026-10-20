## ADDED Requirements

### Requirement: Verified licensed example
The demo SHALL use a Creative Commons traffic clip with recorded source, author, license, SHA-256, and transformation details, plus visible credits.

#### Scenario: Inspect example provenance
- **WHEN** a user opens the demo
- **THEN** the source and license links identify Editor's San Francisco street video and disclose excerpting, resizing, silent playback, and annotations

### Requirement: Real per-frame people and car counts
The preparation command SHALL perform local detector inference and Supervision annotation, saving reproducible per-frame counts and boxes.

#### Scenario: Replay and seek
- **WHEN** playback, pausing, or seeking changes the displayed frame
- **THEN** People and Cars reflect that frame's accepted detections, excluding buses and trucks from Cars and without summing objects across frames

#### Scenario: Compare original and annotated video
- **WHEN** the user switches views
- **THEN** the player retains the requested playback time and synchronizes counts after the replacement frame loads

### Requirement: Bounded local output access
The shared server SHALL expose only the fixed public demo assets, support video byte ranges, and keep runtime downloads and local environments inaccessible.

#### Scenario: Missing prepared example
- **WHEN** generated outputs are absent
- **THEN** the page explains the local preparation commands without inventing model results

#### Scenario: Request private runtime data
- **WHEN** a request targets cache files, model weights, Python sources, or environment files
- **THEN** it receives a not-found response
