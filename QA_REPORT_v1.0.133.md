# LabOS REV 1.0.133 — QA report

Date: 15 September 2026

## Scope

This regression campaign targets the Prototype Build planning defects reported against REV 1.0.132: contradictory material readiness, false calibration blockers, accepted planning situations being treated as blockers, and generic/non-actionable AUTO PLAN recovery diagnostics.

## Root cause verified

The multi-lab site-scoped planner filtered request allocations by the scoped site's material-master IDs. Request-level issued/received evidence could therefore be present in the build workflow but absent inside the canonical planner. The UI could correctly show material received while the planner recreated a `Material Receipt` planning task. REV 1.0.133 preserves all request allocations for in-scope requests and makes route planning explicitly evidence-aware.

## Automated regression checks

All checks below passed against the REV 1.0.133 runtime:

1. Runtime reports version 1.0.133.
2. Fully satisfied request material evidence removes `Material Receipt` from required planning tasks.
3. Site-scoped planning preserves request allocations, including evidence-only/non-local-material-master rows.
4. A genuinely material-not-ready request still retains `Material Receipt` as planning demand.
5. Electrical Bench A is treated as calibration-valid for planned use before its October calibration due date.
6. Electrical Bench A requires calibration renewal only when planned use falls after the calibration due date.
7. Missing approved calibration evidence while the interval is still valid is diagnosed as an evidence/governance gap, not as a new calibration requirement.
8. When calibration evidence is the true blocker, the planner reports the exact equipment and concrete evidence requirement.
9. A lab closure is treated as an availability constraint and the build is planned around it rather than asking the user to remove the closure.
10. A September closure does not cause AUTO PLAN to invent a new Electrical Bench A calibration before its October due date.
11. A finite closure extending beyond the previous fixed 180-day horizon still produces the earliest best-feasible schedule after the closure.
12. Accepted vacation/closure/maintenance/calibration availability events appear only as planning context and are not returned as recovery actions.

## Additional code-level checks

- JavaScript syntax validation executed for every REV 1.0.133 runtime JavaScript file.
- `index.html` asset references were checked against the packaged files.
- Visible revision/runtime revision/file names are synchronized at REV 1.0.133.
- Release ZIP integrity was checked after packaging.

## Behaviour expected after this release

- A received/issued exact BOM is authoritative readiness evidence. The later resource-plan step must not ask for a duplicate `Material Receipt` booking.
- AUTO PLAN always treats accepted availability events as operating facts and finds the earliest feasible schedule around them.
- Equipment calibration is evaluated against the candidate equipment-use date, its due date/status, and governed certificate evidence.
- A calibration that is still valid is not rescheduled merely because a planner readiness check runs.
- Missing certificate evidence routes the user to the exact equipment assurance record.
- A calibration that will genuinely expire before the candidate use date may be automatically inserted as readiness work and the build is replanned afterwards.
- Generic `Planned activity` recovery rows are replaced by the first exact missing/mismatched planning task wherever the planner has concrete task data.

## Notes

This campaign is focused on deterministic/runtime planner regression. It does not claim a full manual cross-browser UI campaign; the implemented flows were validated through the same core planner and state functions used by the app.
