# LabOS Stage 3 — TEST-12 Manual Browser Acceptance Checklist

Controlled build: **STAGE3-GITHUB-TEST-12**  
Visible identity: **REV 1.0.185 · S3 TEST-12**

Deploy over the existing site and preserve IndexedDB/site data. Do **not** Reset Demo Data, clear IndexedDB/site data, or use a fresh profile for this gate.

## 1. Build identity
Confirm after full startup that the visible badge remains `REV 1.0.185 · S3 TEST-12` and the controlled build is `STAGE3-GITHUB-TEST-12`.

## 2. Prototype Green manual replan
Open a planned Prototype booking, choose **Move / replan in swimlane**, select a Green alternative different from the current date, provide the required manual-replan reason, and commit. Confirm the intended booking actually moves, the selected resource/date is used, the swimlane refreshes, and browser refresh preserves the move.

## 3. Prototype Yellow manual replan
Select a Yellow Prototype alternative. Confirm selecting it alone causes no persistence. Complete the required reason/governance step and commit. Confirm exactly the intended booking changes and the committed result survives refresh/reopen.

## 4. Validation Green manual replan
Repeat a Green move for a planned Validation activity. Confirm it commits through the same effective manual-planning experience and survives refresh/reopen.

## 5. Validation Yellow controlled confirmation
Select a Yellow Validation alternative. Confirm selection alone does not change the plan, cancel/back leaves the original booking unchanged, and explicit Yellow acceptance commits the selected controlled change and survives refresh/reopen.

## 6. Pan-versus-button interaction
On touch/mobile and desktop, tap Green/Yellow action controls without dragging. Confirm the command activates reliably. Also confirm blank timeline space can still be horizontally panned/dragged.

## 7. Cross-domain capacity integrity
Where a Prototype and Validation activity compete for the same equipment/person, confirm the manual alternatives do not offer a Green/Yellow candidate that overlaps an already-booked cross-domain resource. In particular, the previously reproduced `P26-1009 / 2026-09-30 / DE-U03` conflict must not be offered as a selectable alternative while `V26-0209` occupies that capacity.

## 8. Partial sister-lab routing survives manual replanning
For an accepted task/activity-level sister-lab assignment, manually replan it. Confirm the task remains routed to the accepted remote lab, programme ownership (`homeSiteId` / `executionSiteId`) is not silently changed to the remote task site, and refresh/reopen retains one live assignment.

## 9. Red and cancellation governance
Confirm Red/blocked alternatives remain explanatory/non-committable. Confirm cancel/back from Green/Yellow governance leaves the original booking unchanged.

## 10. AUTO / network regression
After manual moves, run AUTO/replan and exercise sister-lab review. Confirm accepted routing remains intact, blocked work remains protected, feasible proposals remain reviewable, and the previously passing Stage-3 network/stale-reservation behavior still behaves normally.

## Acceptance rule
Any Stage-1, Stage-2 or Stage-3 regression keeps Stage 3 open. Classify the finding into the 10-stage framework and correct only the generic architectural cause. Do not start Stage 4 or create the protected Stage-3 checkpoint until every Stage-3 acceptance item passes and the user explicitly accepts Stage 3.
