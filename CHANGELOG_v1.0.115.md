# LabOS REV 1.0.115 — changelog

## Controls-stage Product Safety dead-end

REV 1.0.113 correctly knew that Product Safety approval was required before resource planning, but the underlying approval-record lifecycle still created Product Safety approvals only at **BUILD READINESS REVIEW**. A product-safety build sitting at **PROCESS DEFINITION / Controls** could therefore have no pending Product Safety record at all. The guided UI saw `safetyReady = false`, yet had no approval object to action, so the yellow button fell back to a generic **Continue** scroll action and the build could not progress.

REV 1.0.115 aligns the data model with the guided workflow:

- Product Safety approval records are instantiated from **PROCESS DEFINITION**, when the Controls gate becomes actionable.
- Pending Product Safety records are preserved through the Controls and Planning stages instead of being removed until BUILD READINESS.
- Build Readiness approvals remain deferred to BUILD READINESS REVIEW.
- `v1077ControlsTechnicalReady()` now refreshes approval records before evaluating the controls gate, so existing IndexedDB data self-repairs on render without a reset.
- An authorised Product Safety Representative receives **Approve Product Safety →**; other roles receive a direct role switch.
- After approval, **Confirm controls & continue →** becomes available and advances the request to Resource plan & committed timing.

IndexedDB schema remains 35.
