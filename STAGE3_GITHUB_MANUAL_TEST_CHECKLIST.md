# Stage 3 GitHub Manual Test Checklist — TEST-8

**Do NOT reset demo data, clear site data, clear IndexedDB, or use a fresh browser profile.** Use the same carried-forward browser state that exposed the Test-7 failures.

1. Confirm the visible badge remains `REV 1.0.185 · S3 TEST-8` after startup completes.
2. Tap the same previously failing Validation activity. Confirm `Move / replan in swimlane` produces usable Green/Yellow alternatives.
3. Confirm the same Validation planned-item window exposes `Route only this test/activity to a sister lab` when independently routable, and that feasible remote labs are shown.
4. Run AUTO PLAN. Historical/migrated Validation programmes such as the previously failing V26-31xx examples must no longer be falsely blocked with `Generate the Validation programme before resource planning`. A genuinely undefined programme may still be reported as a legitimate blocker.
5. Review more than one AUTO scenario, including same-tier candidates if shown. Each Review action must open the exact scenario selected and must not show `That scenario is not reviewable` for a displayed reviewable scenario.
6. Repeat manual replan and task-level sister-lab routing on a Prototype task to confirm Prototype behavior is unchanged.
7. Accept one Validation partial transfer, run AUTO/replan, then refresh/reopen the page without clearing IndexedDB. The accepted remote assignment must remain the single live assignment and the Validation manual/network actions must still work.

Also report any unrelated regression, missing/restored functionality, confusing behavior, performance concern, or new-function request. Each item will be classified into the fixed 10-stage framework before any change is made.
