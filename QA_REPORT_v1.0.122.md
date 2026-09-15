# LabOS REV 1.0.122 — focused QA report

## Defect reproduced

REV 1.0.121 intentionally classified `Final quality review / release / handover` as `closeout`, but individual sister-lab routing admitted only `process` and `test`. The Planned Task popup therefore omitted the sister-lab action for the exact P26-1005 booking shown by the user. The planner's closeout branch also wrote the booking to `homeSiteId`, so adding only a UI button would not have fixed the behavior.

## Corrected layers

1. UI eligibility — process, test, development and closeout canonical tasks are routable.
2. Routing service — the same four kinds are accepted by `_taskContext`.
3. Canonical planner — closeout uses `taskSiteFor(task)` instead of hard-coded home site and records governed remote-execution metadata.
4. Planning integrity — governed cross-site assignments accept the same four canonical task kinds.

## Runtime checks

A Chromium 390×844 execution harness was run with all six REV 1.0.122 runtime assets inlined because direct localhost navigation is blocked by environment administrator policy.

- Startup: PASS; REV 1.0.122 initialized with zero page errors.
- Active canonical demo tasks counted: 105 process, 47 test, 21 closeout; no unsupported active task kind in the current seeded portfolio.
- Sample process step (`P26-1001 · Material Receipt`): both sister-lab comparisons completed and returned verified feasible plans.
- Sample formal test (`P26-1001 · Test · No-load speed`): both sister-lab comparisons completed and returned verified feasible plans.
- Sample closeout (`P26-1001 · Final quality review / release / handover`): both sister-lab comparisons completed and returned verified feasible plans.
- Exact user-reported case (`P26-1005 · Final quality review / release / handover`): Planned Task popup displayed `Route only this step to a sister lab →`; Stuttgart and Detroit both returned feasible comparisons.
- Acceptance test: Stuttgart was selected for the P26-1005 closeout. The live canonical booking changed from `LAB-NL` to `LAB-DE`, `homeSiteId` remained `LAB-NL`, `remoteExecution` became true, and no browser/page error occurred.
- JavaScript syntax: PASS for core, services and app runtime.

The seeded portfolio currently contains no active development booking, so development routing was verified by the same shared `place()` path and routing/invariant eligibility checks rather than by a seeded UI acceptance example.
