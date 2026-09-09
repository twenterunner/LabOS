# LabOS REV 1.0.47 Verification

REV 1.0.47 is based on REV 1.0.46 and schema 22. This revision focuses on audit usability/governance, resource-assurance scheduling, customer configuration, request sorting and removal of the duplicate in-app risk-analysis workflow.

## Current acceptance results

All current revision suites pass:

- `verification-node.js` — **46 / 46** domain and planning checks.
- `verification-repository-node.js` — **6 / 6** persistence/migration checks.
- `verification-ui-node.js` — **23 / 23** base UI checks.
- `verification-v147-node.js` — **78 / 78** revision-specific governance/UI checks.
- `verification-v147-behavior-node.js` — **10 / 10** behavioral checks.
- `scenarios-v147.js` — **10 / 10** realistic disruption/planning scenarios.
- `ui-stress-v147.js` — **1,783 / 1,783** role/build/workspace render combinations.
- `verification-static.py` — **31 / 31** packaging/responsive/static checks.

## REV 1.0.47 items explicitly verified

- Audit pack cannot be generated with an empty organisation, site/laboratory or scope statement.
- Every automated Major/Minor finding provides a guided **Resolve → Evidence → Recheck** route.
- Audit-trail retention and ISO internal-audit reference findings resolve through controlled audit references rather than dead-end warnings.
- Audit evidence pack includes the scope, findings, resource/calibration/maintenance/training registers, methods, Control Plans, traceability, quality records, release dossiers, audit trail and resource-assurance schedule.
- Calibration, maintenance and training evidence links are surfaced in the relevant reports/evidence pack.
- Customers are maintained in **Administrator → Configuration & data → Customers & requirements**.
- Build requests can be filtered/sorted by customer and sorted by submitted date, required date, product, customer and priority.
- Calibration and maintenance duration can be configured per equipment item; training duration per competency.
- Calibration, maintenance and training can all be directly scheduled as real resource reservations.
- Combined and activity-specific readiness schedules can be printed.
- Primary Quality/workspace navigation no longer exposes a dedicated in-app PFMEA workflow.
- High-information screens use progressive disclosure/foldouts for secondary detail.

## Deliberate compatibility note

Legacy risk-analysis fields remain in migrations/import compatibility so an older LabOS dataset is not destructively stripped on import. They are not an owned/current LabOS workflow in REV 1.0.47. The active product model uses external controlled risk analysis feeding applicable characteristics/controls into the LabOS Control Plan.

## Environment limitation

A full physical-device/Chromium end-to-end visual pass cannot be claimed in this execution environment because local browser navigation is restricted. DOM rendering, state transitions, responsive CSS/static checks and 1,783 role/build/workspace combinations were exercised successfully. Final production acceptance should still include Android/iOS/desktop browser exploratory testing, accessibility testing and real printer/PDF-output checks.
