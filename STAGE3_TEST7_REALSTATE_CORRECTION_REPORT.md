# LabOS Stage 3 — Test-7 Real-State Continuity Correction

Controlled target after correction: `STAGE3-GITHUB-TEST-8`  
Product revision: `1.0.185`

## Confirmed real-state root cause
The user's exported Test-7 browser state contained legitimate historical Validation graph representations (`programmeNodes/programmeEdges` and `validationNodes/validationEdges`) that had not been hydrated into canonical `validationActivities`. Stage-2 Planning and Stage-3 task routing therefore correctly rejected those programmes as noncanonical.

## Generic correction
Stage-1 canonical repair now migrates supported historical Validation graph structures into canonical Validation activities/legs/flow while preserving stable node/activity identity and genealogy. It does not use display-name guessing. Unrepresentable graphs create structured integrity issues instead of guessed state.

The repair is idempotent and preserves ownership/site semantics except for the stale structural references being canonicalized.

Application startup also preserves the controlled-build badge rather than overwriting it with the product revision only.

## Real exported-state reproduction after correction
- Previously failing Validation planned item resolves canonically.
- Manual feasibility returns Green and Yellow alternatives.
- Canonical Stage-3 task-level sister-lab comparison returns feasible remote alternatives where resources permit.
- The previously observed V26-31xx false `Generate the Validation programme before resource planning` blockers are removed after canonical hydration.
- Genuinely undefined Validation programmes remain legitimate blockers rather than being fabricated.

## Regression protection
`qa/stage3-realstate-regression-tests.js`: **8/8 PASS**.
