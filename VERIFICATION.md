# LabOS REV 1.0.95 verification

Release verification result: **124 / 124 passed, 0 failed**. Dedicated Chromium regression completed with **0 page errors**.

REV 1.0.95 specifically proves that sticky workflow scheduling, the controlled process/test definition, manual planning and AUTO-PLAN all use one canonical planning-task graph. Stable semantic test IDs prevent a removed test's ID from being reassigned to another test, task-definition fingerprints prevent stale locks from masquerading as current work, and plan coverage rejects missing/mismatched/orphan/duplicate required tasks.

The exact REV 1.0.94 failure was reproduced before correction: `TESTREQ-P26-1001-1` changed meaning from **No-load speed** to **Operating current**, and AUTO-PLAN retained the stale locked No-load speed booking. REV 1.0.95 gives the two tests different semantic IDs, removes the stale lock, replans the current test, and passes full task coverage.

See `ROOT_CAUSE_PROOF_v1.0.95.md`, `ROOT_CAUSE_REPRO_v1.0.95.json`, `VERIFICATION_v1.0.95.md`, `VERIFICATION_RESULTS_v1.0.95.txt`, and `VERIFICATION_BROWSER_v1.0.95.json`.
