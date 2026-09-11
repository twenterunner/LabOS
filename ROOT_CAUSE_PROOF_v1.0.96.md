# REV 1.0.96 root-cause proof — planning architecture and timeline convergence

## Why prior behavior could still look inconsistent

REV 1.0.95 corrected canonical task identity, but several orchestration / presentation paths still remained:

1. **Manual planning had its own booking-construction path.** It could use common definitions but was not guaranteed to be only another constraint mode of the same solver.
2. **Protected portfolio planning could isolate a blocked build but a partial candidate could still be presented as selectable.**
3. **The Master Planner lane population was historically booking-centric.** A valid active/committed build without current bookings could disappear from the overall swimlane view.
4. **The six health tiles refreshed the health list but did not originally own the swimlane population.**
5. **Three timeline behaviors competed:** the main planner fixed-horizon renderer, a sticky-build zoom implementation, and a later generic pixel-width zoom / grouped-axis mutation. This is why CW/month/date formatting and zoom semantics remained inconsistent between screens.

These are architectural causes, not isolated CSS defects.

## Correction

REV 1.0.96 establishes two single-source contracts:

### One planning engine

`PlanningEngineV1096` orchestrates all planning modes. AUTO, manual constraints, tiered recovery/global optimization and escalation all invoke the same scheduling kernel and the same canonical `planningTasksForRequest` graph. Manual placement is represented as constraints; it does not directly create an independently accepted schedule. Selectable tier candidates must be complete and pass the same integrity gates.

### One timeline

`planningSwimlane` is now the universal timeline renderer used by the Master Planner, build-specific planning page and sticky build cockpit. It owns calendar grouping, ISO week-year, weekend shading, Fit bounds, semantic date-span zoom and full-width layout. The old generic pixel zoom, sticky-only zoom and post-render calendar mutation are explicitly disabled.

## Proven failure modes covered by tests

- **Unplanned committed build disappears:** a synthetic active committed build has all future bookings removed; the lane remains visible and displays Schedule unresolved.
- **Filters only change cards:** each of the six filter tiles is clicked and the number of build lanes is compared to the canonical filtered model; all six match exactly.
- **Zoom changes canvas width instead of time span:** browser test proves − changes 77 → 56 → 28 days, + changes 28 → 56 days, Fit restores 77 days, while `scrollWidth == clientWidth` throughout.
- **ISO week-year boundary:** 1 Jan 2027 is verified as **CW 53 · 2026**.
- **Partial protected candidate appears actionable:** Green intentionally encounters seven readiness blockers in the reference state and is verified `complete=false`, `eligible=false`; complete Yellow is the recommendation.
- **One build failure aborts protected portfolio:** one request is given an impossible weekend manual window; three sibling requests are still solved while the blocked request is isolated, and live input state remains unchanged.
- **Manual path bypasses engine:** a valid manual constraint is solved through `PlanningEngineV1096.manualPlan`, yields complete canonical coverage and zero collision/readiness failures, and the resulting booking is marked as solver-validated manual constraint.
- **Escalation does nothing:** target-first escalation produces a complete alternative in the reference portfolio; resulting state has zero invariants, collisions or readiness failures.
- **Years-away fake answer:** a 900-day lab closure with a bounded useful horizon produces no recommendation, no remote best-feasible date and no mutation of live bookings.

See `VERIFICATION_BROWSER_v1.0.96.json` and `VERIFICATION_RESULTS_v1.0.96.txt` for machine-readable evidence.
