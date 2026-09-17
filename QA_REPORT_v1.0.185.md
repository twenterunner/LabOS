# LabOS REV 1.0.185 — Planning Recovery QA

REV 1.0.185 is a release-critical planning regression recovery built from REV 1.0.184.

## Changes verified

- Overall Planning keeps the six filter tiles in one horizontal row.
- All / Prototype Builds / Validation remains immediately above the swim lanes.
- Overall timeline supports horizontal scrollbar, mouse/pointer drag, trackpad horizontal movement and − / + / FIT.
- Every live booking remains clickable and opens the shared Green / Yellow / Red manual replan search.
- The project column has a wider, bounded layout with stable action buttons.
- Prototype and Validation full-programme planning use strict target-lab equipment and people; remote resources cannot leak into a sister-lab feasibility result.
- Optimize Recovery remains local-only.
- Compare Sister Labs excludes the current lab and creates a formal transfer request instead of directly committing a cross-lab scenario.
- Sister-lab transfer lifecycle is request → receiving-lab review → accept/reject → live revalidation → apply, with cancel while pending and audit history.
- Direct cross-lab scenario commit is blocked as a governance backstop.
- Validation retains Archive Manager access.
- Material workflow completion requires every real BOM requirement to be fully provided/committed; a date/owner alone cannot make the Material step green.
- Process & Methods no longer auto-closes for an active build solely because technical route data is ready. Explicit review remains required; migrated legacy builds remain reconcilable.
- KPI context is selected-lab-specific, including the Equipment Availability trend denominator.
- Time-series KPI visuals remain line/point plots; filled/surface plots are explicitly suppressed.

## Verification gates

The packaged release is checked for JavaScript syntax, version consistency, required assets, canonical planning UI markers, formal sister-lab governance handlers, material/process workflow guards and lab-scoped KPI logic. Runtime tests exercise Prototype and Validation AUTO-PLAN, manual slots, sister-lab comparison, request/accept/reject, cross-lab resource integrity and lessons-learned APIs.

## Executed regression results

- JavaScript syntax: PASS for core, demo data, repository, services, planning and application bundles.
- Deployment/version/asset references: PASS; no missing runtime asset referenced by `index.html`.
- Canonical Overall population: 11 programmes in the fresh demo fixture (8 Prototype, 3 Validation).
- Prototype AUTO-PLAN: PASS, 8 bookings.
- Validation AUTO-PLAN: PASS, 4 bookings.
- Prototype manual planning: PASS; Green / Yellow / Red alternatives returned.
- Validation manual planning: PASS; feasible Green plus blocked Red alternatives returned in the tested window.
- Prototype sister-lab comparison: PASS; LAB-DE candidate 8 bookings, zero target-lab resource leaks.
- Validation sister-lab comparison: PASS; LAB-DE candidate 4 bookings, zero target-lab resource leaks.
- Prototype and Validation transfer governance: PASS for Requested-without-LIVE-move, Accept & revalidate, and Reject paths.
- Material semantics: PASS; expected date + owner without full commitment remains planning-ready but `workflowReady=false` and `buildReady=false`.
- Browser-rendered Overall Planning: PASS with 6 tiles, All / Prototype Builds / Validation controls, 38 live booking bars in the fixture, horizontal overflow, 360 px project column, governed sister-lab request action, Validation Archive Manager, and no page errors.
