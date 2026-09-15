# LabOS REV 1.0.132

## Role switching
- Fixed inconsistent Demo role switching across pages.
- Desktop and mobile role selectors now stay synchronized with the active identity after every render.
- A role change keeps the current page when the destination role is permitted to use it.
- If the new role cannot access the current view, LabOS deliberately opens that role's dashboard and states why, rather than appearing to ignore the role change.
- Navigation is re-rendered from the active role after every page render, also covering role changes initiated by guided actions/approval flows.

## Explainable AUTO PLAN
- An unplanned build is no longer described as a valid “current baseline” to keep.
- AUTO PLAN now exposes a three-step strategy trail: protected plan, automatic readiness recovery, and portfolio recovery.
- Planner blocker diagnostics now identify the concrete equipment/person, readiness type, capability/skill and planning horizon when available.
- Generic `Planned activity` integrity rows are diagnostic only and are suppressed from the action list when a more concrete resource/readiness blocker exists.
- Added a direct `Schedule <readiness> & retry` action for prerequisites such as calibration/training. It runs the canonical planning engine with controlled readiness enabled and then presents the complete plan for review if successful.
- The exact recovery modal now states the required action and affected resource and distinguishes missing execution readiness from accepted planning situations.
- Vacation, lab closures, calibration/maintenance windows and other accepted planning situations remain operating facts that AUTO PLAN plans around; users are not asked to remove them merely to make a build plan.

## Compatibility
- No schema bump required; REV 1.0.132 remains on schema 35.
- Existing operational, approval, planning-situation and role-governance logic is retained.
