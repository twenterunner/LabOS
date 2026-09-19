# Stage 3 GitHub Manual Test Checklist — TEST-9

**Do NOT reset demo data, clear site data, clear IndexedDB, or use a fresh browser profile.** Use the same carried-forward browser state that exposed the Test-8 failures.

1. Confirm the visible badge remains `REV 1.0.185 · S3 TEST-9` after startup completes.
2. Open legacy Validation development/test bookings. Eligible canonicalized activities must expose governed single-activity sister-lab routing. If an item is genuinely ambiguous/helper/non-routable, LabOS must explain why instead of silently hiding the action.
3. On a Validation booking with no feasible option in the visible timeline, select `Move / replan in swimlane`. LabOS must continue the bounded Stage-2 search and surface the next Green/Yellow option (or an explicit bounded no-feasible result) rather than misleadingly stopping at visible-range `0 Green / 0 Yellow`.
4. Run AUTO PLAN. It should be materially faster than the former ~18 s synchronous path. A partially feasible portfolio must still offer a controlled proposal for successful programmes while leaving genuine blockers unchanged and visible.
5. Review multiple AUTO scenarios, including same-tier scenarios where available. Each Review action must open the exact selected scenario.
6. Accept a stale sister-lab request. LabOS must open governed revalidation, show what changed, allow an explicit refresh for a fresh receiver decision, and require a new Accept/Reject decision rather than showing only a raw error.
7. Repeat manual replan and single-task sister-lab routing on a Prototype task to confirm Prototype behavior remains unchanged.
8. Accept one partial transfer, run AUTO/replan, then refresh/reopen the page without clearing IndexedDB. The accepted remote assignment must remain the single live assignment.

Also report any unrelated regression, missing/restored functionality, confusing behavior, performance concern, or new-function request. Each item will be classified into the fixed 10-stage framework before any change is made.
