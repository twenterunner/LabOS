# LabOS REV 1.0.95 — verification

## Result

**124 / 124 checks passed, 0 failed.**

The dedicated Chromium REV 1.0.95 suite also completed successfully with **0 page errors**.

## Planning-definition tests

The release verifies that the sticky workflow, manual planning and AUTO-PLAN use one canonical controlled task graph.

Key browser assertions:

- canonical tasks == manual planner task IDs and names;
- sticky task names == canonical task names;
- process/test setup contains the same current controlled tests;
- explicit final quality review / release / handover is included;
- unchanged tests retain their semantic ID after selection edits;
- removed test IDs are not reassigned to a different test;
- stale semantically mismatched locked bookings are removed before AUTO-PLAN;
- AUTO-PLAN schedules exactly one booking for every canonical required task;
- every planned booking contains its task-definition fingerprint;
- deliberate removal of one required test booking is detected by coverage validation;
- custom test-development work is present only until method release;
- optional route operations are not silently included as required work;
- the Resource plan UI reports complete canonical task coverage.

Reference AUTO-PLAN scenario: **8 expected canonical tasks / 8 bookings / exact ID match / explicit closeout present**.

## Root-cause regression

The untouched REV 1.0.94 behavior was reproduced before applying the correction:

- old test: `No-load speed`, ID `TESTREQ-P26-1001-1`;
- new controlled test: `Operating current`, same ID `TESTREQ-P26-1001-1`;
- stale locked `No-load speed` booking was preserved by the planner.

Under REV 1.0.95:

- the two tests have different stable semantic IDs;
- stale lock is removed;
- current `Operating current` work is actually planned;
- task coverage has zero missing/mismatched/orphan work.

Machine-readable reproduction: `ROOT_CAUSE_REPRO_v1.0.95.json`.

## Retained REV 1.0.94 planning regression

The full Master Planner/tiered planning regression is retained and passes, including:

- grouped ISO month/CW/date headings;
- commitment-health filters and Total days late;
- bounded horizon behavior with no fabricated remote forecast;
- Green/Yellow/Red planning rule checks;
- target-first Escalation Mode;
- zero collision/readiness/invariant findings in the tested escalation result;
- project-team authority positive/negative check; and
- no browser page errors.

## Static/runtime checks

All runtime JavaScript modules pass syntax checking. The static suite also checks migration wiring, booking reconciliation, semantic fingerprints, task-coverage gates, route/test change invalidation and retained prior controlled-workflow behavior.

Detailed output is stored in `VERIFICATION_RESULTS_v1.0.95.txt` and `VERIFICATION_BROWSER_v1.0.95.json`.
