# Stage-3 GitHub Test-10 — Manual Browser Checklist

Build: **REV 1.0.185 · S3 TEST-10**  
Checkpoint: **STAGE3-GITHUB-TEST-10**

## Important persistence instruction

Use the same carried-forward browser/site state that exposed the Test-9 problems. **Do not Reset Demo Data, clear IndexedDB, clear site data, or use a fresh browser profile** for this acceptance check.

## Focused checks

1. **Exact build identity**  
   After startup completes, confirm the visible badge remains `REV 1.0.185 · S3 TEST-10` and the controlled build is `STAGE3-GITHUB-TEST-10`.

2. **Validation manual continuation search**  
   Tap a Validation activity and choose **Move / replan in swimlane**. If the visible width has no Green/Yellow option, the continuation search must visibly advance beyond `0/60 days checked`. If a Yellow/Green option is discovered, it should appear while the bounded search is still progressing rather than only after all 60 days finish. Cancel must stop the active scan.

3. **Validation sister-lab action / explanation**  
   Eligible Validation tests/development activities should expose **Route only this test/activity to a sister lab**. If an item is genuinely ambiguous/helper/non-routable, LabOS should explain the controlled reason rather than silently hiding the function.

4. **Stale receiver revalidation with competing reservations**  
   Revisit an older sister-lab request whose capacity assumptions changed. The revalidation preview must already account for competing `SoftHeld` / `Reserved` / `Committed` requests. It should either find a conflict-free alternative or explain the competing reservation before you press refresh. Pressing **Refresh for fresh decision** should not unexpectedly discover a collision that the preview claimed was feasible.

5. **Own reservation does not self-block**  
   For a request that already owns a receiver hold/reservation, governed refresh/final acceptance should ignore only that request's own reservation while still respecting every competing reservation.

6. **Prototype regression / AUTO**  
   Confirm Prototype manual replan and single-task sister-lab routing still behave normally. AUTO PLAN should retain the Test-9 behavior: materially faster than the old ~20 s path, with genuine blocked programmes left unchanged while useful independently feasible proposals remain reviewable.

7. **Persistence after acceptance**  
   Accept a partial transfer, run AUTO/replan, then refresh or fully close/reopen the browser without clearing IndexedDB. The accepted remote assignment must remain the single live assignment.

## Deferred — do not score Test-10 on this item

The swimlane date/timeline header plus `−`, `+`, and `FIT` controls being sticky during vertical scrolling is recorded for **Stage 10 UI/UX** and is intentionally not implemented in Test-10.
