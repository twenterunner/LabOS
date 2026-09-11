# LabOS REV 1.0.99 — Multi-lab network architecture

## Scope

REV 1.0.99 preserves the REV 1.0.98 application baseline and adds a scalable multi-laboratory operating model for Prototype now and Validation / Testing and Failure Analysis later.

## New capabilities

- Added configurable internal laboratories and external-facility benchmarks with stable site IDs.
- Added active-laboratory selector and site-scoped operational views.
- Added per-product default routing for Prototype, Validation / Testing and Failure Analysis.
- New demand automatically receives the relevant product default site; changing a default affects new demand only.
- Added site ownership to equipment, staff, competencies/certifications where applicable, material stock, allocations, planning events, care/readiness work and bookings.
- Added **Lab Network Recovery** to Planning for late/unplanned home-lab work.
- Sister-lab comparison runs the same canonical planner independently against each candidate site's people, equipment, material/readiness and existing workload.
- Added transfer lead-time handling before sister-site work can start.
- Added controlled sister-lab execution transfer with retained home site, accepted schedule, rationale, audit history and network-transfer record.
- Added configurable external benchmark lead time, hourly cost and setup fee without making external outsourcing an automatic planner choice.
- Added network KPIs: sister-lab builds, internal hours retained, estimated external spend avoided and external spend.
- Added Administration → **Laboratory network & product routing**.

## Planning-engine safeguards

- AUTO, MANUAL, Green/Yellow/Red portfolio optimization and Escalation still use the same canonical scheduling kernel.
- Portfolio optimization is scoped to the active/target laboratory; one site's overload or closure cannot consume or block another site's resources.
- Candidate sister-site states are evaluated independently and merged back transactionally only after acceptance.
- Cross-site equipment/staff leakage is a state invariant failure.
- External facilities remain comparison benchmarks rather than hidden fallback capacity.

## Data migration

- Schema 33 → 34 migration added.
- Existing REV 1.0.98 controlled work remains assigned to the original single-lab site during migration and is not silently redistributed.
- Existing request count and user-edited data were regression-tested for preservation.

## Verification

- Core/network/migration checks: **37/37 passed**.
- Tier/Escalation site-isolation checks: **8/8 passed**.
- Browser runtime exercised: startup, Planning, network comparison, controlled transfer, site switch and Administration routing; no invariant errors observed.
