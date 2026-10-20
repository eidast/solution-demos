## ADDED Requirements

### Requirement: Persistent selectable video examples
The demo SHALL retain the San Francisco and Shibuya examples and add a separate HD retail video with verified Creative Commons provenance.

#### Scenario: Choose an earlier example
- **WHEN** the user selects San Francisco or Shibuya
- **THEN** that example's own original video, result, duration, and credits are loaded without replacing another video's files

### Requirement: Isolated bounded analysis
Analysis SHALL accept only registered video IDs, publish results in that video's folder, and run at most one worker across the gallery.

#### Scenario: Analyze retail while another video is running
- **WHEN** another gallery worker is active
- **THEN** the server rejects a second launch and lets the user watch other original videos without altering the active job

#### Scenario: Switch during a pending request
- **WHEN** the user changes selection while loading analysis or polling
- **THEN** late responses cannot display the previous video's counts or HUD on the new selection

### Requirement: Evidence-bounded retail validation and publication
The HD retail example SHALL be processed with actual local inference, checked against source frames, and documented with limitations before publication.

#### Scenario: Review retail output
- **WHEN** the retail result is shown
- **THEN** its HUD agrees with saved per-frame detections and its source license, author, HD dimensions, and observed validation limitations are available
