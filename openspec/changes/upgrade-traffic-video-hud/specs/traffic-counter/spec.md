## ADDED Requirements

### Requirement: Longer Creative Commons example
The demo SHALL provide a different licensed traffic/person video excerpt at least 30 seconds long, with source provenance and clean original playback.

#### Scenario: Open the original
- **WHEN** the page opens before inference
- **THEN** the user can play the 45-second Shibuya excerpt without boxes or HUD, with CC BY 2.0 credits

### Requirement: Analysis initiated from the demo
The demo SHALL calculate people/car detections locally when the user requests analysis and report progress without accepting arbitrary media or exposing secrets.

#### Scenario: Analyze the fixed video
- **WHEN** the user selects Analyze video
- **THEN** one bounded local job processes the fixed clip and exposes progress until complete or a controlled failure

#### Scenario: Reject another or untrusted job
- **WHEN** a second job is requested while one is running, or the request comes from an untrusted origin
- **THEN** the server rejects the request without starting another process

### Requirement: HUD and original comparison
The analyzed video SHALL display a readable people/car HUD derived from actual per-frame inference, while preserving a clean original view.

#### Scenario: Compare the same moment
- **WHEN** the user switches between original and analyzed views after completion
- **THEN** the displayed frame and counts stay synchronized, the original has no overlays, and the analyzed version shows boxes and the HUD
