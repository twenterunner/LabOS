# LabOS REV 1.0.50 — UX, route navigation, 5S, audit scope and personal actions

## Release intent
REV 1.0.50 continues the hard LabOS workflow contract introduced in 1.0.49: a user-facing action must either be executable to a real controlled outcome or guide the user through the complete evidence-backed resolution. This revision focuses on reducing duplicated controls and improving daily usability.

## Changes

### Build execution navigation
- Removed the redundant four-button `Process settings + Control Plan measurements` card from the execution page.
- The primary execution action remains the one guided entry point: `Record required data` when data is missing.
- CSV download, CSV upload and build-specific-field creation now live inside the data-matrix workflow rather than being repeated on the page.
- Route operations are now rendered as a second, horizontally scrollable sticky sub-navigation inside the main fixed build cockpit.
- Route chips show complete / partial / pending state and allow direct inspection of a route step without reintroducing a separate large route list.

### Audit capability scope by equipment category
- Laboratory capability scope is no longer maintained separately for every physical asset.
- Scope records are maintained by equipment capability/category, with the member equipment list retained underneath the category.
- Range, resolution, uncertainty/capability reference, method and notes are defined once at the relevant category level.
- Audit findings and scope CSV exports now use the category model.
- Existing per-asset scope data is non-destructively consolidated during schema migration when possible.

### Configurable test families
- Added a controlled `testFamilies` master.
- Every standard test now references a test-family ID instead of relying on an implicit/free-text grouping.
- Administrators/Lab Managers can open `Configure test families` from the Standard Test Library.
- Test-family assignment is editable as part of the planning-standard editor.

### 5S workplace control
- Added optional 5S zones under Lab Standards & Resources.
- Each zone has a named owner and physical area.
- 5S checks score Sort, Set in order, Shine, Standardize and Sustain on a 1–5 scale.
- Scores below 4 create a real Action Centre action assigned to the zone owner.
- The owner gets a guided resolution workflow requiring objective resolution evidence before the action can close.
- 5S is treated as an operational workplace-control / continuous-improvement mechanism, not as a substitute for product/process quality controls.

### Personal Action Centre
- Action Centre now shows only the current user's assigned mandatory actions and executable improvement proposals.
- The redundant `Person` grouping was removed because the queue is already personal.
- The top action badge and navigation count use the same personal queue.
- Global build blocker calculations still use all open actions, so another person's blocker cannot incorrectly make a build look clear.
- Legacy role-labelled action owners are normalized to a concrete user where a matching role user exists.

## Migration
- Application schema: **25**.
- REV 1.0.49 / schema 24 data is migrated automatically.
- Existing equipment scope records are retained and used to seed category scope where useful.
- Standard tests receive a deterministic default family when no family existed.
- Existing data is not deleted by the migration.

## Verification
The final packaged source was run through the current regression programme:

| Suite | Result |
|---|---:|
| Core domain/planner | 46 / 46 |
| Persistence/migration | 6 / 6 |
| Base UI regression | 23 / 23 |
| Governed execution / CP | 18 / 18 |
| REV 1.0.49 guided-workflow/UX regression | 15 / 15 |
| REV 1.0.50 focused UX/master-data tests | 12 / 12 |
| Tough planning/disruption scenarios | 10 / 10 |
| Role/build/workspace render stress | 1,783 / 1,783 |
| Static/mobile/package checks | 31 / 31 |
| **Total** | **1,944 / 1,944** |

REV 1.0.50 focused tests explicitly cover:
- category-level equipment scope;
- integrated sticky route navigation;
- removal of duplicated execution-data tiles;
- CSV/field controls inside the data matrix;
- configurable test-family master and test assignment;
- 5S zone/action architecture;
- individual Action Centre isolation;
- preservation of global blocker status independent of personal action visibility;
- mobile horizontal route navigation.

## Known validation limitation
The automated runtime/DOM/state/mobile checks pass, but this execution environment still does not provide a genuine physical Android/iOS/desktop exploratory browser session. Real-device visual/touch validation should therefore remain part of final production acceptance.
