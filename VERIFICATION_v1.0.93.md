# LabOS REV 1.0.93 — verification

## Scope

Targeted verification covers the two REV 1.0.93 corrections: Control Plan approval invalidation / guided ownership and bounded AUTO-PLAN behavior.

## Automated result

**22 / 22 checks passed; 0 failed.**

Key checks include:

- REV and cache-bust identity updated to 1.0.93;
- Control Plan approval invalidation engine present;
- stale approval rows are retained as Superseded audit evidence;
- all four Control Plan mutation paths invalidate approval when content changes;
- sticky sign-off exposes the final Quality Engineering action;
- sticky next action shows a blocker rather than an unusable Continue action;
- visible three-stage Control Plan approval path rendered before resource planning;
- explicit planner horizon present;
- blocker-end jump optimization present;
- multi-year fake-feasible result rejected;
- syntax checks pass for `core.js`, `demo-data.js`, `repository.js`, `services.js`, `app.js`, and `service-worker.js`;
- runtime behavior suite: **10 / 10 passed**;
- exact REV 1.0.92 multi-year root cause reproduced;
- same case correctly blocked in REV 1.0.93;
- Chromium Control Plan governance UX verification passes with **no page errors**.

## Control Plan runtime behavior

The runtime suite verifies that editing an approved Control Plan:

1. creates a new Draft revision rather than mutating the approved revision;
2. clears formal review/approval metadata on the new revision;
3. retains the previous approval round as Superseded history;
4. creates fresh Pending records for the required roles; and
5. prevents progress into Resource plan & committed timing until the governed approval path is complete.

## Planner runtime behavior

The normal regression creates eight planned bookings and a valid forecast inside the controlled horizon. The pathological long-closure scenario is independently run against both REV 1.0.92 and REV 1.0.93. REV 1.0.92 produces a forecast 999 days late; REV 1.0.93 returns `CAPACITY_UNRESOLVABLE`, leaves live bookings unchanged and commits no forecast.

Detailed logs:

- `VERIFICATION_RESULTS_v1.0.93.txt`
- `VERIFICATION_BEHAVIOR_v1.0.93.json`
- `VERIFICATION_BROWSER_v1.0.93.json`
- `ROOT_CAUSE_REPRO_BEFORE_v1.0.93.json`
- `ROOT_CAUSE_REPRO_AFTER_v1.0.93.json`
