# LabOS REV 1.0.134

## Governed sister-lab transfer handshake

- Replaced direct sender-side sister-lab acceptance with a formal two-lab handshake.
- A sister-lab comparison now remains a non-binding feasibility analysis until the sending lab submits a transfer request.
- Whole-build and single-operation transfers create `Requested` records; LIVE planning remains unchanged while the receiving lab decides.
- Incoming requests are visible to the receiving lab in My Work and Planning → Lab Network Recovery.
- Receiving Prototype Lab Coordinator / Planner, Lab Manager or Administrator can accept or reject with a retained rationale.
- Acceptance re-runs the canonical planner against the current receiving-lab and portfolio state before applying anything.
- Failed revalidation leaves the transfer pending/unapplied; no stale comparison is committed.
- Accepted transfer records retain sender, receiver, request/decision timestamps, rationale, scope and routing purpose without duplicate KPI records.
- Sender can cancel a still-pending outgoing request.
- Network KPI continues to count only accepted transfers, not pending requests.
- Scenario Lab sister-lab options now enter the same formal sender-request / receiver-acceptance workflow; a scenario can no longer directly move LIVE work.

## UI / formatting

- Added a dedicated Transfer requests & acceptance section with separate Incoming and Outgoing queues.
- Added a three-stage handshake visualization in the transfer-review modal.
- Improved sister-lab comparison/modal spacing, line height, rationale presentation, card layout and responsive behavior.
- Updated single-operation routing wording from immediate "Use this lab" to formal "Request this lab" semantics.
