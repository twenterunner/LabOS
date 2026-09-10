# LabOS REV 1.0.57 — contextual MSA, automatic daily review and mobile navigation

## Changes

- Replan reason/explanation is pre-populated from the planning situation, request change or active constraint that caused the forecast movement; selecting a linked planning situation refreshes the explanation.
- Capability & SPC has been removed from the Quality workspace and from the legacy navigation redirect.
- MSA / Gage R&R is now a first-class controlled evidence workflow: upload an existing study or run a guided crossed/balanced Gage R&R.
- MSA studies retain study date, raw observations or uploaded document, technical conclusion, formal approval and explicit links to process, Standard Test and gage/equipment.
- Process, Standard Test and equipment views show linked MSA studies and guide the user to run/upload one when none exists.
- Controlled setup governance was rebuilt as responsive cards. Names/IDs no longer concatenate on narrow Android screens; each process/test/equipment is directly tappable.
- Daily Operations Check continues to run on application start and now rechecks automatically when the app becomes active/focused on a new calendar day, with manual rerun always available.
- Page subsection navigation is made reliably sticky below the fixed LabOS header on long non-workspace pages.
- The Lessons shortcut was removed from the primary build command area and local jump menu. Lessons remain a single controlled workbench in the late handover/closeout workflow, with automatic proposals plus manual/hindsight capture.

## Data migration

Schema 29 normalizes existing Gage R&R records with a study date, source type, Standard Test link field, technical conclusion and evidence metadata while preserving all existing study data.

## Verification

See `VERIFICATION.md` and `VERIFICATION_RESULTS_v1.0.57.json` in this package for the executed checks.
