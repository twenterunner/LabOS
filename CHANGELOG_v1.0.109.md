# LabOS REV 1.0.109 changelog

REV 1.0.109 is a fault-injection / boundary-hardening release built on REV 1.0.108. IndexedDB schema remains **35**.

## Planning integrity — sister-lab transfer
- Auto-generated calibration, maintenance and qualification/readiness work is now treated as **portfolio-owned resource readiness**, not disposable request-owned planning data.
- A replan, request-definition change, archive cleanup or sister-lab move can no longer silently delete shared readiness that other accepted bookings depend on.
- Sister-lab comparison candidates are validated against **whole-portfolio invariants and the full planning-integrity audit** before they are offered.
- `transferToSite` repeats that integrity gate immediately before acceptance and fails atomically if the transfer would create a readiness, overlap, capability, assignment, sequence or calendar defect.

## Scenario Lab — LIVE baseline semantics
- The untouched **current LIVE plan** is now the only optimization reference.
- A separate **Scenario as-is** row shows the simulated disruption before recovery; it is informational and is never treated as an optimization proposal.
- A scenario option is shown as an optimization only if it has no residual scenario conflict, does not move another accepted project later, does not worsen critical delivery metrics versus LIVE, and improves at least one outcome.
- Options that merely resolve the simulated conflict while making LIVE delivery performance worse are filtered out.
- Applying a scenario now has a stale-state fingerprint guard plus a whole-portfolio integrity gate so a previously calculated twin cannot overwrite newer planning changes.

## Request and sample boundary controls
- Strict calendar-date validation rejects rollover dates such as `2026-02-30` and correctly handles leap-year boundaries.
- Prototype request quantity is limited to a configurable browser-safe maximum; default **5,000** (`settings.maxPrototypeQuantity` can intentionally change it).
- Request create, edit and wizard paths enforce whole-number quantities in the range 1..limit.
- Sample generation rejects negative/fractional counts and can never allocate more active samples than the controlled request/material limit.

## Responsive layout
- Request-search controls use responsive auto-fit columns and no longer clip at common desktop/mobile widths.
- Scenario Lab labels, inputs and selects are width-contained at narrow Android-class widths, including when outage/absence date/resource fields are exposed.
- REV 1.0.108 compact-screen role switching is preserved.

## Verification
Targeted regression and fault-injection tests cover the reproduced sister-lab readiness defect, forced-invalid transfer candidates, Scenario Lab baseline behavior, stale scenario application, date/quantity/sample boundaries, request/scenario responsive breakpoints and all 12 Android demo roles. See `QA_REPORT_v1.0.109.md` and `VERIFICATION_v1.0.109.json`.
