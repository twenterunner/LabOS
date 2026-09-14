# LabOS REV 1.0.117 — full process-flow and fault-injection qualification

## Executive result
REV 1.0.117 was subjected to a broad deterministic QA campaign focused on workflow liveness, planning integrity, multi-lab behavior, manual replanning and fault recovery. Within the static POC test environment, every exercised non-final workflow state had a concrete guided continuation and every accepted planning/transfer result passed invariant and planning-integrity gates.

## Demo portfolio coverage
- 24 seeded demo builds, 8 per internal lab (Twente, Stuttgart, Detroit).
- 21 distinct scenario categories across the 24 examples.
- Baseline domain invariants: 0 findings.
- Baseline planning-integrity audit: 0 findings across all 15 audited categories.
- Workflow-liveness audit: 23/23 active/non-archived demo builds have a concrete action, owner role and destination section. The remaining build is intentionally archived/closed.
- AUTO PLAN on all non-final demo requests: 20 complete plans; 1 intentional structural capability blocker (`P26-1023`) with explicit diagnosis and network recovery path.

## End-to-end A/B/C lifecycle campaign
Fresh requests were created and driven through the controlled lifecycle for every seeded product family:
- 12 product families × A-sample = 12 complete lifecycles.
- 12 product families × B-sample = 12 complete lifecycles.
- 12 product families × C-sample = 12 complete lifecycles.
- Total: **36/36 reached CLOSED**.

The campaign exercised request submission, material issue, route/method control, resource planning, Control Plan where required, readiness, sample allocation, route execution, characterisation, quality review, engineering/release approvals, release, delivery and closeout. The Heat Gun route explicitly removed the unreleased Thermal Soak step and completed all A/B/C paths without the previous route-reuse loop.

## Sister-lab / network qualification
### Whole-build routing
- Every active build was compared with both alternative internal sister labs: **42 sister-lab alternatives**.
- 41 were feasible complete plans; 1 was blocked and returned a structured diagnosis.
- All six ordered transfer directions were exercised successfully with zero post-transfer planning-integrity findings:
  - NL → DE
  - NL → US
  - DE → NL
  - DE → US
  - US → NL
  - US → DE

### Single-test sister-lab routing
- 43 canonical active test tasks × 2 sister labs = **86 test/site alternatives**.
- 76 feasible; 10 blocked with structured diagnosis rather than silent failure.
- Structural recovery example: `P26-1023` remains a Detroit build, but its specialist vibrodynamic test is routed to Stuttgart. The selected test uses the Stuttgart specialist rig, downstream work is replanned, the whole-build forecast is recalculated, and the complete portfolio remains integrity-clean.
- An elective test transfer was also applied on a build that was feasible at home, proving the feature is not restricted to structural blockers.
- Network metrics distinguish sister-lab **build transfers** from sister-lab **test transfers**.

## Planning and fault injection
Passed fault cases include:
- Removal of all matching home-lab equipment capability → `ZERO_EQUIPMENT_CAPABILITY` with capacity/event/manual/escalation recovery actions.
- Removal of the required local skill path → `ZERO_REQUIRED_SKILL` with qualification/training/manual/escalation recovery actions.
- 120-day finite lab closure → planner searched beyond the visible window and found the first feasible recovery date after the closure (13 Jan 2027 in the injected case).
- A Twente lab closure did not block independent Stuttgart or Detroit replanning.
- Manual move of the third activity in a build → selected calendar day honored, all downstream bookings regenerated sequentially, zero planning-integrity findings.
- Manual move after a single-test sister-lab transfer → remote test stayed at the sister lab, selected day was honored, downstream plan stayed valid.

## Guided-flow checks
Representative blocker/gate paths were explicitly checked for request definition, materials, route/method definition, planning, readiness, sample creation/execution, characterisation, quality disposition, approvals, delivery and closeout. The final workflow liveness guard provides a role switch or an executable destination/action instead of a passive disabled control.

## Important defect corrections found during this campaign
1. Lab-wide planning events were still treated globally by several planner cleanup paths. This could make a closure at one lab disturb another lab. Event handling is now site-aware in those paths.
2. Site-scoped orchestration initially removed sister-lab resources before the per-test planner could see them. Requests with per-test network routing now execute the canonical planner against the network resource model.
3. Enterprise invariant validation originally rejected any resource outside the build execution site. It now permits only explicitly governed remote **test** tasks and still rejects accidental cross-site resource assignments.
4. The initial specialist demo test was regenerated away by the canonical test-requirement synchronizer. The demo now declares the specialist requirement through the controlled `characterisation` source, so it persists correctly.
5. Single-test transfer records were initially counted as whole sister-lab builds in network metrics. Build and test transfer counts are now separated.

## Packaging / static checks
- Runtime JavaScript syntax: PASS.
- Manifest JSON parse: PASS.
- HTML local runtime references: PASS.
- Version/runtime references: REV 1.0.117.
- ZIP integrity: PASS.
- IndexedDB schema: 35 (unchanged).

## Qualification boundary
Automated Chromium navigation to localhost/file URLs is blocked by administrator policy in the execution environment (`ERR_BLOCKED_BY_ADMINISTRATOR`). Therefore this campaign does not claim a fresh physical-Android or automated browser-navigation qualification. The deterministic core/services/data-model code, app integration source, static package and generated demo state were exercised directly. A physical Android smoke test remains appropriate before production-style deployment.
