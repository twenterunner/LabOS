# LabOS REV 1.0.124 — changelog

## Purpose
REV 1.0.124 is a stabilization and fault-injection release on top of REV 1.0.123. It preserves the REV 1.0.98 accepted functional baseline and the REV 1.0.123 test-specific external-cost/evidence feature while correcting stale-state and multi-lab edge cases found during deeper testing.

## Fixes

1. **Stale per-task planning state is now reconciled together.** When a controlled process/test task is removed or replaced, obsolete active bookings, `taskSiteOverridesV1170`, per-task manual constraints, and accepted task-transfer records are reconciled as one transaction. Historical transfer evidence is retained but marked `Superseded` rather than left active or deleted.
2. **Single-operation sister-lab work no longer disappears from Planning.** The operational Planning view now has an explicit network-task view scope. The home lab sees its complete build including a remote task; the receiving sister lab sees the incoming operation. The canonical planning-engine scope remains lab-isolated and unchanged.
3. **Inactive sister-lab overrides are rejected.** A task can no longer be scheduled at a lab that is inactive, missing, or an external facility. The planner returns `TASK_SITE_UNAVAILABLE` and the guided recovery offers another active sister lab or return of only that operation to the build lab.
4. **External quote validity is enforced in economics.** Expired and not-yet-valid test-specific quotes remain traceable but do not drive current sourcing decisions. The generic external-facility benchmark is used until a currently valid controlled commercial record exists.
5. **External evidence cannot silently certify changed commercial terms.** When supplier/price/basis/fees/lead time/reference/validity changes, the prior commercial record and proof are archived. If no replacement file is supplied, the current record is deliberately left without proof. Replacing/removing proof also preserves the previous evidence revision.
6. **No phantom generic setup fee on fully quoted work.** Whole-build external costing no longer adds the generic external-facility setup fee when all evaluated hours are already covered by valid test-specific quotes.
7. **Stale commercial-record messaging corrected.** Sister-lab comparison now distinguishes “no quote configured” from “quote exists but is expired/not yet valid”.

## Compatibility
- Browser data schema remains **35**.
- Static GitHub Pages deployment remains unchanged.
- No backend, npm runtime or data reset is required.
- Existing REV 1.0.123 external-sourcing records are normalized automatically; new evidence history is additive.
