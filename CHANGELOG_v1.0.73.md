# LabOS REV 1.0.73

## Request and approval flow
- Creating or submitting a prototype build request is now a hand-off, not an approval event.
- Build-readiness sign-offs are not instantiated before Build Readiness Review.
- Customer/Quality, Engineering and Lab Manager release sign-offs are not instantiated before Engineering Review.
- Final release controls remain available when the build genuinely reaches the release decision.

## Engineering-supplied material
- Added **Receive all engineering material** to record every outstanding BOM component in one receipt sheet.
- The sheet supports a common handover/shipment reference plus per-component lot/batch and quantity.
- Each fully received/issued BOM component turns green immediately.
- Full physical receipt now closes the Material step even if no earlier supply promise was entered.
- Once the full BOM is ready, the material workspace shows a yellow **Next guided action** button.
- The guided Material step is green only when required material is physically received/issued; a future supply promise remains a planning input, not false completion.

## New / modified method release
- Replaced the multi-click development gate path in normal workflow use with one consolidated **method release sheet**.
- The sheet captures planning allowance, setup/cycle time, equipment capability, required competency, development plan, trial evidence, parameters, risk/EHS reference, measurement/verification, fitness envelope, Control Plan impact, work instruction and required evidence.
- A Process Engineer may complete and release the sheet in one controlled action without a duplicate formal approval.
- If another authorised role prepares the sheet, the same populated sheet is routed to the Process Engineer for review/release; no data is re-entered.

## AUTO-PLAN robustness
- Unknown/non-library characterisation requests now receive provisional planning defaults using name-based equipment-capability and competency inference where possible.
- Stale or absent staff-skill associations no longer create a false structural blocker when a trainable lab person exists; AUTO-PLAN can reserve prerequisite training automatically.
- Existing technical equipment/capability mapping remains enforced so planned operations are not assigned to an incompatible setup.

## Guided-action colour convention
- Build submission, engineering material receipt, next-material-step and method-sheet actions use the yellow next-action treatment.
- Completed material components use explicit green completion styling.
