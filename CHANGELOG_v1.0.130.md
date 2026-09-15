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

## Planning-situation revocation / relaxation patch

- Revoke/remove of a temporary planning constraint is now applied directly and cannot be blocked by unrelated skill, equipment, readiness or capacity failures elsewhere in the portfolio.
- Strict constraint relaxation (for example shortening a lab closure) follows the same non-blocking capacity-release path.
- Existing accepted bookings and commitment history remain untouched until the user separately accepts an optimization proposal.
- Added **Revoke situation** in the editor and renamed the planning-list action from Remove to Revoke.
- Added the choice to keep the current schedule or preview optimization using newly released capacity.
- Optional optimization failures are presented as non-blocking follow-up items; they never reinstate the revoked/relaxed event.
- Metadata-only edits bypass the planner.
- Planning-event site scope is preserved during edits.
- Stale pending planning-situation retry state is cleared when the constraint is revoked/relaxed.
- No schema-version change required; inactive/revoked events use additive audit fields (`revokedAt`, `revokedBy`) and remain historically traceable.


## Corrective hotfix — My Work role governance
- Corrected Process Engineer **My Work** so it no longer presents whole-lab workload, readiness administration, future-project load, or unrelated delivery data as personal work.
- Added a dedicated **Process engineering dashboard** containing only governed process/method actions, owned method developments, related builds, and bookings assigned to the logged-in Process Engineer.
- Corrected training readiness ownership: the competency master `owner` remains the technical/standard owner, while scheduling/completion governance is assigned to the **Lab Manager** (`skills:manage`). The technical owner is retained separately for traceability.
- Calibration readiness is assigned to **Metrology**; maintenance remains governed by **Lab Manager** with Metrology as an allowed operational role where applicable.
- Existing persisted resource-care bookings/actions are normalized on render, so stale REV 1.0.130 data that incorrectly assigned training to a Process Engineer is repaired without a demo reset.
- Removed duplicate My Work readiness cards when a governed resource-care action already exists for the same reservation.
- Resource-care resolution role now follows the care type rather than a stale person-name owner.
