# LabOS REV 1.0.95 — one canonical planning definition for sticky workflow, manual planning and AUTO-PLAN

## Purpose

REV 1.0.95 fixes a planning-definition defect in which the tests shown in the sticky build workflow could diverge from the tests shown in the controlled process/test definition and from the work actually scheduled by AUTO-PLAN.

The correction is architectural rather than cosmetic: every planning surface now reads the same canonical task graph.

## Root cause corrected

REV 1.0.94 created test-requirement IDs by ordinal position (`TESTREQ-<build>-1`, `-2`, ...). The end-test editor rebuilt the requirement list after selection changes. This allowed the ID formerly representing one test to be reassigned to a different test.

That was dangerous because:

- the sticky workflow displayed current bookings;
- process/test setup displayed the current `testRequirements`;
- AUTO-PLAN and manual planning assembled overlapping but not identical task lists;
- a user-locked booking was preserved mainly by `stepId` and resource validity, without proving that the booking still represented the same controlled task.

A stale booking could therefore remain labelled with the former test while the controlled definition contained a different test under the same ordinal ID.

## Canonical controlled planning graph

Added `ProtoLab.planningTasksForRequest(...)` as the single controlled source of required work for a build. It contains, in order:

- required non-optional routed process operations;
- required process-development prerequisites until the method is released;
- the current controlled end-test requirements;
- required custom-test development prerequisites until released; and
- an explicit final quality review / release / handover activity.

The sticky workflow, manual planner and AUTO-PLAN now consume this same task graph. Optional route operations are not silently treated as required planning work.

## Stable test identity

Standard tests now receive semantic stable IDs, for example:

`TESTREQ-P26-1001-TST-PT01`

instead of positional IDs such as `TESTREQ-P26-1001-1`.

Custom tests receive deterministic semantic IDs. An unchanged test retains its identity across edits, while a removed test's ID cannot be reassigned to a different test.

## Booking fingerprints and reconciliation

Every controlled planning task has a semantic `definitionKey`. Newly created bookings carry that fingerprint.

`ProtoLab.reconcilePlanningBookings(...)` now:

- retains completed/historical evidence;
- upgrades compatible legacy future bookings;
- removes obsolete or semantically mismatched future bookings;
- removes stale locks that no longer represent the current controlled task definition; and
- forces replanning when the controlled route/test definition changes.

Existing saved states are reconciled once on startup through planning-definition migration `1.0.95`.

## AUTO-PLAN integrity gate

AUTO-PLAN now schedules from the canonical task graph and performs a task-coverage integrity check before a candidate can be accepted. A valid plan must have exactly the required controlled tasks with no:

- missing required task;
- mismatched task/booking identity;
- obsolete/orphan future booking; or
- duplicate required task.

The same coverage check is repeated on the transactional working state before the live state is swapped.

## Manual planning and sticky workflow

Manual planning now uses the same IDs, names, order and development/closeout activities as AUTO-PLAN. The old shadowed manual-plan writer was removed, including its hidden extra four-hour forecast tail.

The sticky schedule no longer derives its test list by enumerating whatever bookings happen to exist. It renders the canonical required tasks and shows each as scheduled or not scheduled using semantic compatibility.

The Resource plan & committed timing step now explicitly reports plan coverage, e.g. `8/8 required tasks scheduled`, and warns if a required, stale, obsolete or duplicate task is found.

## Definition-change invalidation

Changes to routed process topology or test selection invalidate affected future planning and require a fresh plan. Test selection no longer clears and recreates requirement identity. Existing semantically unchanged requirements are retained.

## Verification

REV 1.0.95 includes a direct reproduction of the REV 1.0.94 defect plus browser and source-level regression testing. Final retained verification: **124 / 124 passed, 0 failed**, with the dedicated Chromium suite completing with **0 page errors**.

See `ROOT_CAUSE_PROOF_v1.0.95.md`, `ROOT_CAUSE_REPRO_v1.0.95.json`, `VERIFICATION_v1.0.95.md` and `VERIFICATION_BROWSER_v1.0.95.json`.
