# Verification — REV 1.0.130

## Daily Operations governance

Expected access for current Staffing / Capacity proposals:

| Role | Staffing | Capacity | Cross-lab cards |
|---|---:|---:|---:|
| Quality Engineer | No | No | No |
| Prototype Lab Coordinator / Planner | Yes | No | No |
| Lab Manager | Yes (oversight) | Yes | No |
| Prototype Technician | No | No | No |
| Administrator | Yes | Yes | No (active lab only) |

Checks performed in the release QA include JavaScript syntax, source-policy assertions, archive integrity and a runtime service harness using synthetic multi-lab load.

## Planning-situation revocation / relaxation

Expected behavior:

| Change | Must run complete planner before applying? | Existing accepted schedule | Optional follow-up |
|---|---:|---|---|
| Revoke lab closure / absence / outage | No | Retained | Preview released-capacity optimization |
| Shorten same constraint interval | No | Retained | Preview released-capacity optimization |
| Metadata-only edit | No | Retained | None required |
| Add / extend / move constraint to another resource/site | Yes | Unchanged until proposal accepted | Complete portfolio proposal |

Regression assertions:
- Site-scoped lab closure blocks only bookings in that lab.
- Revocation is classified as capacity release and ignores unrelated blocker state.
- Shortening releases only bookings outside the reduced interval.
- Revoke-only path does not call the portfolio optimizer.
- Pending retry state from an earlier failed planning-situation transaction is cleared.
- Revocation remains in audit history and does not behave like an Undo snapshot restore.


## My Work role-governance verification
Corrective v1.0.130 hotfix verified resource-care ownership at service level and added a runtime regression hook `window.__LABOS_V130_ROLE_SCOPE_TEST__`. Process Engineer My Work is now process/method scoped; training administration is Lab Manager governed, calibration is Metrology governed, duplicate readiness/action cards are suppressed, and stale care ownership is normalized automatically.

## Manual-planning readiness floor / timing-decision continuity

Expected behavior:

| Scenario | Expected result |
|---|---|
| Material ready before the task's current booking | Manual planner searches from material/operational readiness, not from the current booking |
| Material ready earlier on the current day | Earlier same-day feasible slots may be reviewed/selected |
| A closure or resource constraint covers an earlier date | Date remains unavailable; the readiness-floor change does not bypass the canonical solver |
| AUTO PLAN finds a better plan | Review proposal; use Accept plan only or Accept & commit forecast |
| AUTO PLAN finds no better plan but the live baseline is complete | Review/commit the current baseline; workflow does not stall |
| Baseline review is open and planning data changes | Acceptance is rejected as stale; AUTO PLAN must be re-opened |
| Material/process feasibility is incomplete | Current baseline may be reviewed, but commitment remains blocked until the prerequisite is complete |

Regression assertions include a material-ready 15 Sep / current-booking 29 Sep case, a 16–27 Sep whole-lab closure, and an end-to-end no-improvement AUTO PLAN review/commit transaction.
