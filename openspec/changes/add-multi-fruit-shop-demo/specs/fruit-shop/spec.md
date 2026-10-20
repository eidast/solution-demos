## ADDED Requirements

### Requirement: Multi-fruit shop example
The gallery SHALL include the accepted 24-second HD licensed shop footage with multiple visible fruits and separate orange and banana detection counters.

#### Scenario: Compare shop video
- **WHEN** the user analyzes the shop example
- **THEN** accepted detections SHALL drive both per-class cards and the baked HUD
- **AND** the clean original and selected source modal SHALL remain available
- **AND** existing examples SHALL remain selectable with their own results

### Requirement: Reproducible channel profile
The new example SHALL record its BGR model input in its committed configuration and saved model metadata.

#### Scenario: Load incompatible preprocessing
- **WHEN** a saved shop result does not match its registered input color
- **THEN** the browser SHALL reject it
- **AND** absent inputColor in earlier results SHALL retain the RGB meaning
