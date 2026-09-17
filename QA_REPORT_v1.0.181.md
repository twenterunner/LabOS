# LabOS REV 1.0.181 — QA report

## Release objective

Replace the recent Prototype/Validation planning special cases with a single generic planning architecture and verify that sister-lab comparison, recovery, manual slot search, Planning tile filtering and selected-lab Audit all use that same model.

## Architecture verification

A new `ProtoLab.PlanningEngine` is loaded before the application UI. The following public functions delegate to it:

- `planProgrammeV181`
- `compareProgrammeLabsV181`
- `optimizeProgrammeRecoveryV181`
- `findProgrammeSlotsV181`
- `scopeLabV181`

The primary Prototype AUTO-PLAN preview now calls `PlanningEngine.plan()`. `planValidationV161()` delegates to `planProgrammeV181()` when the planning module is loaded, so the Validation workspace and integrated Planning page use the same cross-domain engine. The former Validation sister-lab override was removed.

Static assertion: `labos-planning-1.0.181.js` contains **zero `P26-...` or `V26-...` demo project IDs**.

## Executable generic-engine test

The final source was executed against a fresh real LabOS demo state.

Selected-lab row population at the default lab:

| Filter | Programme lanes |
|---|---:|
| All open work | 11 |
| With bookings | 5 |
| Planned Validation | 1 |
| Active situations | 0 |
| Forecast late | 2 |
| Commitment movement | 6 |

The exact same counts were obtained from the rendered canonical Planning HTML. This verifies that the tiles change the **lane population itself** rather than only changing metrics or CSS.

## Sister-lab planning

The test discovers feasible alternatives programmatically rather than referring to a hard-coded showcase ID.

A Prototype programme was found with:

- current lab: `LAB-NL`
- feasible sister lab: `LAB-DE`
- sister-lab forecast: 2026-09-23
- 8 complete constrained bookings

A Validation programme was found with:

- current lab: `LAB-NL`
- feasible sister lab: `LAB-DE`
- sister-lab forecast: 2026-09-30
- 4 complete constrained bookings

The comparison did not mutate the accepted state.

## Recovery optimization

`optimizeRecovery()` evaluates the same whole-programme scenarios returned by the generic lab comparison. A separate planned-programme regression verified that a later/worse scenario is marked `improves = false`; such a scenario is rendered as **Resilience only** rather than as an optimization.

## Manual planning

The generic slot finder was executed for both domains. It searches the same constrained planner with a manual date constraint and returned feasible and blocked dates for Prototype and Validation.

Example executable results included:

- Prototype: feasible Yellow/Green alternatives plus Red blocked dates depending on the randomly generated demo-state readiness/capacity pattern.
- Validation: feasible Yellow alternatives plus Red blocked dates.

Red candidates contain the planner's actual block reason and are not commit-capable. Yellow candidates require a planning rationale before commit.

## Generic commit path

A complete sister-lab scenario was committed through `PlanningEngine.commitPlan()` for both domains:

- Prototype: `LAB-NL → LAB-DE`, 8 bookings, forecast 2026-09-23.
- Validation: `LAB-NL → LAB-DE`, 4 bookings, forecast 2026-09-30.

In both cases the programme execution site, bookings and audit history were updated by the same canonical commit implementation.

## Selected-lab Audit

`auditScopedState()` was executed for `LAB-NL`, `LAB-DE` and `LAB-US`.

For every lab:

- all returned equipment belonged to the selected lab;
- all returned staff belonged to the selected lab;
- all returned active bookings were executed at the selected lab;
- Prototype and Validation work executed there was included;
- unrelated other-lab resource evidence was excluded.

The Audit route calls the selected-lab adapter directly; REV 1.0.181 does not install a new `renderAuditReadiness` wrapper.

## UI integration verification

The packaged application UI was loaded in a DOM-mocked executable harness. Assertions passed for:

- canonical Planning route available;
- Optimize recovery button rendered per lane;
- Compare sister lab button rendered per lane;
- six `data-plan-filter` tiles rendered;
- `−`, `+`, `FIT` controls rendered;
- actual rendered lane counts changed by tile filter;
- Programme commitment health absent from the canonical Planning page;
- generic manual-replan handler installed for the existing booking click surface;
- Validation and Prototype both use the same slot-search API.

## Static/package gates

- `node --check` passes for all packaged JavaScript files.
- `labos-version.json` and `manifest.webmanifest` parse as JSON.
- `index.html` references the REV 1.0.181 core, repository, services, **planning**, demo-data and app assets.
- revision markers are consistent at REV 1.0.181.
- clean ZIP extraction and ZIP integrity check pass.

## Browser-render limitation

The execution environment does not provide a reliable unrestricted Chromium navigation target for this static app. No claim of a fresh visual Chromium click-through is made. Behaviour above was verified by executing the real packaged model/UI functions and the rendered HTML path directly.
