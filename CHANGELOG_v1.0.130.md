# LabOS REV 1.0.130 — Daily Operations role/site governance

- Fixed Daily Operations cards being shown to roles that do not own the action.
- Improvement proposals now carry `ownerRoleId`, `actionableRoleIds` and `siteId`.
- Staffing proposals: Prototype Lab Planner, Lab Manager oversight, Administrator.
- Capacity proposals: Lab Manager, Administrator.
- Quality Engineer, Technician and other unrelated roles do not receive these actionable cards.
- Dashboard, My Work and Action Centre use one shared authorization path.
- Accept / Reject / Defer and implementation re-check authorization at action time.
- Daily Operations generation and daily snapshots are scoped to the active lab.
- Role changes and active-lab changes re-render from live role/site-scoped data; stale proposal cards are not reused.
- Staff/equipment load balancing is constrained to the same lab. Sister-lab work must use the controlled Lab Network transfer workflow.
- Lab-wide planning-event conflicts now respect the resource lab.

No schema version bump was required; new proposal/review fields are additive.
