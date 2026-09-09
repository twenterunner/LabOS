## REV 1.0.46 · Closed-loop improvements, guided blockers & unified build-step execution

REV 1.0.46 turns several previously advisory LabOS workflows into controlled executable workflows.

### Accepted improvements now mean implementation
- **Staff load balancing:** LabOS reassigns eligible unlocked future bookings to qualified, conflict-free people, updates route ownership, recalculates load and writes the audit trail.
- **Equipment load balancing:** LabOS moves eligible bookings to ready equivalent equipment and updates the route/equipment records.
- **Calibration / maintenance opportunities:** LabOS schedules the accepted service action into the lowest-impact feasible Resource Assurance slot when it can do so safely.
- **Capacity / new-equipment proposals:** where a physical purchase or installation is required, acceptance starts a guided workflow: confirm capacity need → approve solution/business case → order/arrange → receive/register → commission/qualify → replan and verify.
- **Skills / process / quality improvements:** acceptance starts the corresponding controlled workflow and stays open until implementation and effectiveness evidence are complete.

### Blockers are contextual
Readiness blocker actions no longer route to a generic dashboard or show healthy resources. The resolver displays only the booking/condition that fails, the exact reason, and the immediate corrective action. Where possible it offers a one-tap valid equipment/person reassignment; otherwise it opens the exact calibration, maintenance, qualification or replan action needed.

### One consistent cockpit for every build-process step
Every route step now exposes the same operating pattern:
1. Select one, several or all pending samples.
2. Start execution to capture the real start timestamp for those samples.
3. Capture common machine/setup values once and sample-specific values in a sample × field matrix.
4. Download or upload the same matrix as CSV.
5. Complete execution to record finish time/duration and mark the selected samples complete.

Control Plan characteristics linked to the route step flow directly into the same sample matrix. Saving those columns creates the formal CP measurement records with limits, method, reaction-plan context and traceability; there is no duplicate CP-entry workflow.

### Data and analysis
- Every sample-level field supports **Same value for all samples** bulk fill while allowing individual exceptions.
- Machine/setup settings are separated from sample measurements/characteristics.
- Critical-characteristic plots use a 50-bin histogram for larger datasets or individual-value scatter/rug presentation for smaller prototype datasets, fitted normal distribution, and Anderson–Darling normality p-value.

### Governance hardening retained
Release/lifecycle/quality/Control Plan rules are enforced in the domain layer, JSON imports are invariant-validated before persistence, IDs are collision-safe, and the Administrator/Closeout/Verify workspaces have current render coverage.

This remains a static GitHub Pages proof-of-concept. Enterprise deployment still requires production identity, backend/database, security, concurrency, validated e-signatures, backups and organisation-specific governance.
