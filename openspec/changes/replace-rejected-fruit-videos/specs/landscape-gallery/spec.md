## ADDED Requirements

### Requirement: Landscape fruit replacement
The gallery SHALL replace the two explicitly rejected fruit entries with a horizontal HD example showing multiple apples and actual current-frame detections.

#### Scenario: Select fruit
- **WHEN** the user opens the default example
- **THEN** the 30-second 1280×720 apple excerpt SHALL provide original and annotated views plus selected implementation source
- **AND** the three earlier traffic/retail examples SHALL remain registered

### Requirement: Removed example routes
Retired fruit IDs SHALL NOT remain selectable or served.

#### Scenario: Request retired media or analysis
- **WHEN** a request uses banana-ripening or hudson-fruit-shop
- **THEN** fixed per-ID routes SHALL return 404
- **AND** local ignored historical files SHALL remain private

### Requirement: Consistent player size
The video player SHALL occupy a responsive 16:9 area using contain sizing.

#### Scenario: Display a different source aspect ratio
- **WHEN** a 4:3 source is selected
- **THEN** its full image SHALL fit with letterboxing without changing player proportions or stretching the source
