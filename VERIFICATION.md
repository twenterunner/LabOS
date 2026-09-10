## REV 1.0.75 verification

REV 1.0.75 makes workflow blockers stage-specific, gives route/readiness blockers exact resolution paths, routes 5S corrective actions through a dedicated correction/recheck flow, and consolidates resource assurance into Lab Standards & Resources with manual plus 30/60/90-day bulk scheduling. Capacity wording now calls calibration/maintenance/training time "Resource assurance work" rather than "Readiness load".

See `VERIFICATION_v1.0.75.md` and run `python verification-v175.py` for the current release evidence.

## REV 1.0.71 verification

REV 1.0.71 consolidates Dashboard and Action Centre into the role-specific My Work view and moves drag alternatives from a separate list onto the swimlane itself. Planning alternatives are classified green/yellow/red according to current-resource feasibility, prevalidated training, or quantified cross-build impact. Red and yellow alternatives require an explicit decision; green no-impact alternatives apply directly.

# LabOS REV 1.0.61 — verification

REV 1.0.61 was built on the REV 1.0.60 static application baseline. The database pilot is not included; the application explicitly uses browser IndexedDB.

The included `verification-v161.py` checks release completeness, static web-only storage, version/cache identity, the new guided requester action, archive lifecycle, constrained drag/drop scheduling, consolidated Resource Assurance, configurable assurance warnings/reporting, sticky/filter navigation, proposal rationale defaults, vacation explanation, 5S visual examples and JavaScript syntax.

A local Chromium navigation smoke test was attempted, but the execution environment blocks localhost browser navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`. This is an environment restriction rather than an application error. The package should therefore still receive a quick exploratory pass after deployment to GitHub Pages on desktop/mobile before treating the revision as accepted.

## REV 1.0.69 verification

The v1.0.69 release adds deterministic green/yellow/grey/red guided-state semantics, yellow next-action controls, a refined execution route card, and a full-build Morning/Afternoon sticky planning timeline with Fit / zoom controls. `verification-v169.py` reports 24/24 release checks passed. The retained portfolio-planner regression reports 14 successful build plans, 198 bookings, 0 equipment-capability mismatches and 0 invariant errors.

## REV 1.0.70 verification

REV 1.0.70 replaces optimistic move suggestions with transaction-safe prevalidation. Each planning move shown to a user is simulated through the complete remaining build before being offered, and the exact validated snapshot is the state that is committed. Stale planning preferences for staff no longer create false structural competency blockers; the optimizer ignores invalid preferences and selects qualified capacity. True missing-competency resolutions are likewise simulated through training reservation and the complete affected build before they are shown.

The sticky build plan now renders every planned activity on its own lane and exposes the same move workflow directly in the build workspace. Within-build timing changes apply without a separate approval. The transaction contains a cross-build impact gate for any move that changes other builds.

`verification-v170.py` reports 21/21 release checks passed, including JavaScript syntax, portfolio planning with intentionally stale/unqualified preferences (14 plans, 198 bookings, 0 invariant errors), and an end-to-end true missing-skill training + plan resolution simulation.

## REV 1.0.76
See `VERIFICATION_v1.0.76.md`. Smart target-first/selective replanning, one-section impact review, staged yellow Re-optimize → Commit workflow, and Audit relocation of detailed equipment scope were regression tested before packaging.

## REV 1.0.77
Sequential workflow ordering, stage confirmation, assurance reporting/navigation, 5S persistence views, process detail and runtime regression checks were added before packaging.

## REV 1.0.78
- Manual controlled planning added as an alternative to AUTO-PLAN.
- Main and build swimlanes now expose active − / Fit / + zoom controls.
- Commitment replan reasons are surfaced in Build Commitment Health and aggregated on the KPI tab.
- See `VERIFICATION_v1.0.78.md` and `verification-v178.py` for executable evidence.

## REV 1.0.79
See `VERIFICATION_v1.0.79.md`. AUTO-PLAN/readiness resource semantics are unified, same-day calibration/maintenance/training readiness is time-accurate, 5S preserves scroll position, the Lab Standards & Resources sticky navigator is unified, E0/E1/V/P are remapped to Pre-A/A/B/C intent, and the demo portfolio is replaced with 24 power-tool prototype requests.
