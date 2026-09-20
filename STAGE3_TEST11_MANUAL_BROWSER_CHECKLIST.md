# Stage-3 GitHub Test-11 — Manual Browser Acceptance Checklist

Build: **REV 1.0.185 · S3 TEST-11**  
Checkpoint: **STAGE3-GITHUB-TEST-11**

## Persistence instruction

Deploy Test-11 over the existing GitHub Pages files and use the same carried-forward browser/site state. **Do not Reset Demo Data, clear IndexedDB, clear site data, or switch to a fresh browser profile** for this acceptance check.

## Required Test-11 checks

1. **Exact build identity after full startup**  
   Confirm the visible badge remains `REV 1.0.185 · S3 TEST-11` and the controlled build is `STAGE3-GITHUB-TEST-11`.

2. **Validation Green manual alternative actually commits**  
   Open a planned Validation activity, choose **Move / replan in swimlane**, and tap a Green alternative that differs from the current live booking. Confirm the live booking moves to the selected date/resource, the modal closes normally, and the swimlane refreshes to the new booking. Refresh the browser and verify the move persisted.

3. **Prototype Green manual alternative still commits**  
   Repeat the Green move on a Prototype booking. Confirm the same behavior and no regression in Prototype manual planning.

4. **Yellow remains controlled**  
   Tap a Yellow alternative. Merely selecting it must **not** change the live booking. The controlled confirmation/rationale step must appear. Cancel/back must leave the live booking unchanged. If you then explicitly accept the Yellow option, it must commit and persist exactly as a governed planning change.

5. **Red remains non-committable**  
   Red/blocked alternatives must remain explanatory only and must not provide a direct commit action.

6. **Progressive Validation continuation search**  
   If the initial visible range has no Green/Yellow option, confirm the bounded continuation search visibly advances beyond the initial cut, publishes a discovered Green/Yellow option while scanning when one is found, and can be cancelled.

7. **Partial sister-lab routing survives manual replan**  
   Use a Validation activity already accepted to a sister lab (or accept one through the governed request/approval flow). Manually replan that activity. Confirm the activity remains assigned to the sister lab after the move while the programme `homeSiteId` / execution ownership is not silently changed by the task-level route. Refresh/reopen and verify the single live assignment remains.

8. **Sister-lab governance and stale revalidation remain intact**  
   Confirm eligible Validation activities expose governed single-activity sister-lab routing; genuinely non-routable items explain why. Revisit a stale receiver request and confirm competing active reservations are accounted for while the request's own reservation does not self-block refresh/final acceptance.

9. **AUTO / replan regression check**  
   Run AUTO PLAN/replan after the manual moves and partial routing. Confirm accepted task-level sister-lab routing remains intact, genuinely blocked programmes remain unchanged, and feasible independent proposals remain reviewable.

10. **Persistence/reopen check**  
    Close and reopen the browser without clearing IndexedDB. Confirm the accepted Green/Yellow planning move and accepted partial network assignment are still represented once in canonical live state, with no duplicate active assignment.

## Deferred — do not score Test-11 on this item

The Planning swimlane date/timeline header, lane context and `−`, `+`, `FIT` controls becoming sticky during vertical scrolling is a **Stage-10 Tab/UI/UX requirement** and is intentionally not implemented in Test-11.

## Acceptance reporting

Report each numbered item as **PASS / FAIL / NOT TESTED**, plus any other regression, restoration request or new functionality observed. Every new item will be classified into the 10-stage framework before any code change. Stage 3 remains open until explicit acceptance.
