# LabOS REV 1.0.101 — startup hotfix root cause

## Symptom
REV 1.0.100 stopped during JavaScript evaluation with:

`Uncaught ReferenceError: enablePlanningDragV1065 is not defined`

The failure occurred before `DOMContentLoaded` could initialize LabOS, so the application shell appeared but the app could not start. Existing IndexedDB data was not modified.

## Proven root cause
The REV 1.0.100 packaging/edit step accidentally removed a contiguous REV 1.0.65 compatibility block from `labos-app`. The removed block contained:

- `resourceAssuranceIntegratedHtmlV1065`
- the REV 1.0.65 navigation integration
- `planningMovePanelV1065`
- `enablePlanningDragV1065`

The later alias `enablePlanningDragV1064=enablePlanningDragV1065;` remained. JavaScript therefore raised a ReferenceError as soon as the file was evaluated.

A controlled top-level runtime smoke test reproduces the failure against the released REV 1.0.100 app file and passes against REV 1.0.101.

## Fix
REV 1.0.101 restores only the omitted compatibility block from the REV 1.0.99 source, ahead of the existing alias. The REV 1.0.100 multi-lab demo portfolio, sister-lab logic, exact 17:00 delivery-cutoff logic, forecast reconciliation and left/right timeline panning remain unchanged.

No schema migration was added and no customer/demo data reset is performed by this hotfix.
