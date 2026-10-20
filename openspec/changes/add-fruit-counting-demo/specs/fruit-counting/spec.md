## ADDED Requirements

### Requirement: Fruit detections
The gallery SHALL preserve existing examples and count accepted banana detections from licensed HD video using local inference.

#### Scenario: Analyze fruit
- **WHEN** the banana example is analyzed
- **THEN** original playback SHALL remain available and the HUD and cards SHALL show the same current-frame banana detections
- **AND** the configuration, code, license and limitations SHALL be visible

### Requirement: Class-specific result validation
New configurable-class results SHALL use schema v4 and match selected video and class definitions.

#### Scenario: Load another class schema
- **WHEN** saved results use mismatching classes or video IDs
- **THEN** the player SHALL reject them
- **AND** existing traffic schema-v3 results SHALL remain supported without relabeling
