# ProtoLab OS REV 1.0.15 — Verification

REV 1.0.15 is a direct upgrade from REV 1.0.13 and includes all REV 1.0.14 corrections plus the new request-edit and assurance-scope changes.

## Focused checks executed

- JavaScript syntax: `app.js`, `core.js`, `services.js`, `repository.js`, `demo-data.js` — PASS.
- REV 1.0.15 runtime-focused suite: **18/18 PASS**.
  - missing-objective request still renders and exposes **Edit request**
  - objective is mandatory when saving edited request
  - scope/timing changes clear stale forecast/triage and create a new feasibility action
  - change history and audit event are retained
  - quantity changes update material required quantities
  - E0/E1/V/P included/conditional/not-required matrix renders in request configuration and Administrator configuration
  - mobile request portfolio renders cards instead of squeezing the six-column table
- Purpose-based workspace rendering suite: **11/11 PASS** across E0, E1, V and P.
- REV 1.0.14 regression feature suite: all substantive feature checks PASS; its single old exact-text assertion for the former assurance-matrix heading was intentionally superseded by the more explicit REV 1.0.15 matrix.
- Static/deployment source checks: **31/31 PASS**.
- Local static HTTP serving: **9/9 principal files returned HTTP 200**.

## Important behaviour

Editing a request after process definition does not silently keep an obsolete commitment. Changes to objective, quantity, required date, priority, configuration/BOM, material source, product-safety/assurance or requested characterisation clear the committed forecast and require feasibility/AUTO-PLAN to be rerun. The previous values remain in change/audit history.

No claim is made that this POC itself establishes IATF certification.
