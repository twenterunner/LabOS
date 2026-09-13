# LabOS REV 1.0.107 changelog

REV 1.0.107 builds directly on REV 1.0.106 and keeps schema 35. It corrects AUTO PLAN decision logic that could previously present a more-feasible schedule as an optimization even when total lateness or maximum delay became substantially worse.

## AUTO PLAN — optimization versus recovery
- Added a strict baseline qualification gate around the existing canonical planning engine.
- A candidate is a **verified optimization** only when all critical delivery KPIs are no worse than the current LIVE baseline and at least one improves.
- Critical guardrails: unplanned builds, total days late, maximum project delay, commitment worsening and priority-weighted lateness.
- Target-specific AUTO PLAN also treats a later target forecast as a worsening and an earlier target forecast as an improvement.
- Complete candidates that solve more work but worsen one or more guardrail KPIs are reclassified as **Recovery trade-offs — not optimization proposals**.
- Partial candidates with unresolved blockers are not optimization or recovery proposals; their existing guided blocker-resolution path remains available.
- Recovery results that are dominated by another recovery strategy are suppressed to avoid offering an objectively inferior choice.
- Only a verified optimization may receive the **Recommended** label.

## AUTO PLAN — comparison UX
- Added a prominent **Current LIVE baseline vs verified optimizations** table.
- Table fields include unplanned builds, total late days, maximum delay, commitment worsening, priority-weighted lateness and projects moved later.
- Verified optimization cards explicitly state why they beat baseline.
- Recovery trade-offs are placed in a separate collapsed section with a plain-language **What improves / What gets worse** summary.
- Reviewing a recovery option inserts a warning and pre-populates the rationale with the quantified trade-off.
- When no tested strategy safely improves baseline, LabOS tells the user to keep the current baseline.

## Preserved
- REV 1.0.106 compact-desktop/header formatting fixes.
- REV 1.0.106 Scenario Lab baseline filtering and comparison table.
- Same canonical planner, multi-lab model, sister-lab logic, audit trail, proposal review and undo behavior.
- IndexedDB schema remains **35**; no reset or migration required.
