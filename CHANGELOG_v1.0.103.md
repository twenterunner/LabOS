# LabOS REV 1.0.103 changelog

## Scenario Lab · Stage 2 — optimization & recovery

REV 1.0.103 adds a governed operational digital-twin layer to Planning. Simulation always runs on a disposable clone of the current state; the LIVE plan is unchanged until a user explicitly applies an option with a rationale.

### Recovery search implemented
- Protected same-lab resequencing using released alternative equipment and qualified people.
- Controlled recovery that may schedule readiness, calibration, maintenance or qualification/training actions.
- Target-first escalation that protects the selected build and replans lower-priority work around it.
- Whole-portfolio trade-off candidate when the quantified portfolio objective improves.
- Temporary weekend / extended-calendar recovery with incremental weekend hours and estimated premium.
- Complete-build sister-lab alternatives solved end-to-end by the existing canonical site-scoped planner.
- External-facility alternative using configured lead time and cost.
- Controlled split-route proposal for selected bottleneck steps when a sister lab is materially earlier. This deliberately creates a review proposal, not fabricated mixed-site bookings; transport/custody/handover controls remain required before execution changes.
- Formal commitment-movement fallback when no recovery can preserve the original requested timing.

### Decision support
- Rank by Balanced, Delivery first, Minimum disruption, or Minimum incremental cost.
- Compare target finish, network on-time delivery, portfolio late days, worsened projects, moved bookings and estimated incremental cost.
- Review exact sampled booking changes and projects that become later before accepting a recovery.
- Scenario state is visibly labelled **NOT LIVE**.

### Governance
- Applying an option promotes the simulated disruption to controlled planning data, records a decision rationale and audit entry, and stores one-click undo state.
- Sister-lab and external decisions create traceable network-transfer records.
- Saved scenario definitions/results can be rerun against the latest LIVE state rather than persisting stale candidate schedules.

### Architecture
- No second scheduling engine was added. Executable recovery candidates use the existing REV 1.0.102 / V1099 site-scoped wrapper around the one V1096 canonical constrained-planning kernel.
- Schema remains **35**. No IndexedDB reset is required.
