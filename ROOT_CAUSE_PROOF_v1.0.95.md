# LabOS REV 1.0.95 — root-cause proof: sticky tests vs planning tests

## Reported symptom

The tests shown in the sticky build workflow did not always match the tests in the build's actual planning/process definition. Because AUTO-PLAN was also capable of preserving existing locked bookings, the mismatch could influence the plan rather than being only a rendering defect.

## Proven root cause

The defect was reproduced against the REV 1.0.94 code.

REV 1.0.94 assigned test requirements by ordinal position. In the reproduced build:

- before the test selection was changed, `TESTREQ-P26-1001-1` meant **No-load speed**;
- after changing the selected tests, the same ID `TESTREQ-P26-1001-1` meant **Operating current**.

So the ID remained the same while the controlled meaning changed.

A locked future booking for the former **No-load speed** test was then deliberately retained. The REV 1.0.94 planner accepted it because the `stepId` still matched and the selected resource/qualification was valid. It did not prove that the booking's semantic task was still the current controlled test.

The exact reproduction result is stored in `ROOT_CAUSE_REPRO_v1.0.95.json`:

- `sameId: true` on REV 1.0.94;
- `staleLockKept: true`;
- stale retained booking name: `Test · No-load speed`;
- current controlled test: `Operating current`.

This also explains the UI mismatch: the sticky workflow enumerated bookings while the definition/process screen enumerated current test requirements.

## Secondary task-model drift found

The investigation also found that REV 1.0.94 had multiple independent planning definitions:

1. AUTO-PLAN constructed route work, tests, development prerequisites and final closeout separately.
2. The sticky schedule rendered current bookings.
3. Manual planning independently assembled route/tests and could omit or treat final work differently.
4. Optional route operations and already-released development work were not consistently treated across those paths.

This made it possible for two individually reasonable screens to disagree about what constituted the complete build plan.

## Correction

REV 1.0.95 introduces one canonical task graph: `ProtoLab.planningTasksForRequest(...)`.

AUTO-PLAN, manual planning and the sticky schedule all consume that graph. Each task has a semantic `definitionKey`, and every new planned booking stores the same fingerprint.

Standard-test requirement IDs are now stable and semantic. In the same reproduction after the correction:

- former No-load speed ID: `TESTREQ-P26-1001-TST-PT01`;
- current Operating current ID: `TESTREQ-P26-1001-TST-PT02`;
- `sameId: false`;
- `staleLockKept: false`;
- planning coverage: `ok: true`, with zero missing, mismatched or orphan tasks.

## Integrity rule

A planning candidate is no longer accepted merely because its resource bookings are conflict-free. It must also be an exact semantic cover of the current controlled build definition.

`ProtoLab.planningTaskCoverage(...)` rejects candidates containing missing, mismatched, orphan or duplicate controlled tasks. This gate is executed before proposal acceptance and again before transactional state replacement.

## Migration of existing saved data

On first load under REV 1.0.95, open builds are reconciled against the current canonical task graph. Historical/completed evidence is preserved. Obsolete or semantically invalid future bookings are removed, the affected forecast is reopened, and the build is marked for replanning instead of silently retaining stale work.

## Proof tests

The dedicated Chromium verification confirms:

- sticky task names equal canonical task names;
- manual planner task IDs equal canonical task IDs;
- the process/test definition contains the same controlled test set;
- AUTO-PLAN produced exactly 8 bookings for 8 required canonical tasks in the reference scenario;
- all bookings carried a definition fingerprint;
- deliberate deletion of a required test booking made coverage fail;
- a stale locked test booking was removed and the current test was replanned;
- test-development work disappears from the task graph once that method is released;
- optional route work is not silently scheduled as required work;
- explicit final closeout is present; and
- browser page errors = 0.
