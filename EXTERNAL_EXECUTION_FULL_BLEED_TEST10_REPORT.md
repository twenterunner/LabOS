# LabOS REV 1.0.185 — External Execution + Full-Bleed Planning TEST-11

## Scope

Cumulative build from TEST-9. Two focused corrections:

1. Complete the task-scoped external execution flow after PO/order creation.
2. Correct Planning swim-lane left-edge positioning so the canonical board occupies the complete viewport (or begins at the actual visible sidebar edge on desktop).

## External execution lifecycle

Implemented governed task-level lifecycle:

`Requested -> Approved/Ordered -> Confirmed -> Dispatched -> Received -> InExecution -> ResultsReceived -> Accepted OR RetestRequired -> Returned/Disposed -> Closed`

### Supplier confirmation / canonical planning

After PO, the user can continue directly from the planned item or My Work into Supplier confirmation.

Supplier confirmation records:
- confirmed supplier start
- promised result date
- outbound shipping days
- return shipping days
- supplier confirmation reference
- supplier contact
- shipping destination / attention
- whether DUTs/samples must return
- downstream dependency mode:
  - physical return required, or
  - accepted result is sufficient

On confirmation:
- the internal equipment/person booking is released;
- the task becomes a locked external planning dependency;
- the external bar spans dispatch through the applicable release gate;
- the same canonical PlanningEngine replans downstream work;
- predecessor conflicts are rejected rather than silently moving earlier work.

### Logistics and execution

Implemented:
- dispatch date
- courier
- outbound tracking / chain-of-custody reference
- controlled DUT/sample serial list
- supplier receipt confirmation
- actual execution start
- supplier date revision / delay replan

### Results / evidence / disposition

Implemented:
- results received date
- supplier outcome/summary
- report/evidence reference
- optional result file payload
- technical review disposition:
  - Pass
  - Valid product failure
  - Invalid lab/test
  - Invalid sample
  - Retest required

Invalid lab/test, Invalid sample, and Retest required do **not** release downstream work. They create `RetestRequired`; a new supplier retest slot must be confirmed and replanned.

### Return / disposition / closeout

Implemented:
- return receipt and return tracking when samples must return
- supplier/disposal record when no physical return is required
- invoice reference
- actual external cost
- PO/committed-to-actual cost variance
- Closed status

### Planning invariants

External bookings:
- consume no internal equipment or staff capacity;
- remain in sequence/dependency coverage;
- are preserved as hard external anchors by the canonical planner;
- are exempt from legacy automatic internal-resource repair;
- are rejected if they start before controlled predecessors finish.

Both Prototype and Validation task identities are preserved.

## Planning left-edge / full-bleed correction

The TEST-9 screenshot showed that the right edge had reached the viewport, but the board's natural parent-column offset remained on the left.

TEST-11 now:
- removes fixed sidebar-width assumptions;
- measures the actual visible sidebar geometry;
- with hidden sidebar: target left = `0`, width = viewport width;
- with visible sidebar: target left = actual sidebar right edge, width = remaining viewport;
- resets legacy margins/left position before measuring the board;
- applies the exact corrective relative offset to cancel the parent-column inset;
- disables ancestor horizontal clipping while Planning is rendered;
- keeps the TEST-8 one-year-past + one-year-future scrollable timeline and +/- temporal zoom.

## Verification

Focused checks executed after implementation:
- External workflow / full-bleed UI: 6/6 PASS
- Prototype external execution smoke: 3/3 PASS
- Validation external anchor smoke: 1/1 PASS
- Transaction persistence smoke: 1/1 PASS
- TEST-9 full viewport lineage: 7/7 PASS
- TEST-8 year-range timeline: 8/8 PASS
- Swim-lane layout: 6/6 PASS
- Scenario/external restoration: 8/8 PASS
- Prototype Create Draft: 3/3 PASS
- Future Project copy scope: 4/4 PASS
- Future Project work-package/scenario: 7/7 PASS
- My Work cleanup / retired product naming: 7/7 PASS

Total focused checks: 61 PASS.

All TEST-11 JavaScript files pass `node --check`.

A local Chromium page-level run could not be used as the final visual gate because the environment blocks localhost and file URLs. The viewport correction is therefore additionally covered by deterministic DOM-geometry tests using the same left-offset condition shown in the user's screenshot. Manual GitHub Pages acceptance remains required.
