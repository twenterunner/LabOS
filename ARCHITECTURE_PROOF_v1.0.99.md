# REV 1.0.99 architecture proof — independent labs, one network optimizer

## Invariant 1 — a laboratory is an operational boundary

Internal laboratories are not one pooled resource list. Requests have a home site and an execution site; equipment, staff, material stock, closures/readiness work and bookings are site-owned. Site-scoped state is constructed before the canonical planner is called. State invariants reject any booking that uses equipment or staff outside the request execution site.

## Invariant 2 — there is still one planner

REV 1.0.99 does not implement a separate sister-lab scheduler. The same canonical `PlannerService`/planning engine used for normal AUTO, MANUAL, tiered portfolio optimization and Escalation is run independently for each candidate internal lab. The candidate changes only the execution-site context and corresponding site-scoped constraints.

## Invariant 3 — the network is an optional recovery layer

Normal work remains inside its home laboratory. Network comparison is used when the home plan is late/unresolved or when the user deliberately compares alternatives. The comparison does not silently rewrite the live plan. A sister-site result becomes live only through an accepted controlled transfer.

## Invariant 4 — controlled transfer preserves traceability

An accepted sister-lab transfer retains the original home site, records from/to sites, actor, rationale, accepted forecast, planned hours and external-cost benchmark, then commits the accepted sister-site planning state. Product default changes never retroactively move existing controlled builds.

## Invariant 5 — external capacity is a benchmark, not a hidden answer

External facilities carry configurable lead-time and cost assumptions. They establish the cost/time alternative against which sister-lab savings are measured. The optimizer does not silently turn external outsourcing into an internal capacity resource.

## Invariant 6 — scalable workstream routing

Product routing contains independent defaults for Prototype, Validation / Testing and Failure Analysis. Prototype is operational now; the same site/routing contract is reserved for Validation and FA rather than creating workstream-specific site logic later.

## Regression evidence

The release test suite includes a real REV 1.0.98 schema-33 state migrated to schema 34, preservation of all 24 baseline requests and a sentinel user edit, three independent internal-site planning evaluations, controlled transfer, zero cross-site equipment/staff leakage, site-specific closure isolation, unified MANUAL mode, tiered optimization and Escalation isolation.
