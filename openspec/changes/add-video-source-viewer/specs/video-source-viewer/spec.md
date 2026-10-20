## ADDED Requirements

### Requirement: Selected implementation viewer
The demo SHALL expose a View source code button opening a modal with the selected video configuration and actual shared implementation source.

#### Scenario: Open and navigate source
- **WHEN** the user opens the modal for a registered video
- **THEN** its title and configuration SHALL match that video and the user SHALL be able to select implementation files
- **AND** code SHALL render as text, with Close and Escape restoring focus to the trigger

### Requirement: Fixed public source boundary
The source endpoint SHALL expose only an explicit allowlist of project source and adapter license files.

#### Scenario: Attempt arbitrary file access
- **WHEN** a request supplies an unknown video or a file query
- **THEN** an unknown video SHALL receive 404 and query parameters SHALL NOT select disk files
- **AND** private credentials, manifests and local output SHALL remain excluded
