# Stage 3 GitHub Manual Test Checklist — TEST-7

**Do not Reset Demo Data. Do not clear site data or IndexedDB.** Use the existing carried-forward browser state that exposed the earlier Validation issue.

Expected visible build: `REV 1.0.185 · S3 TEST-7`
Expected controlled checkpoint: `STAGE3-GITHUB-TEST-7`

1. Confirm the visible mobile revision badge says `S3 TEST-7`.
2. Run AUTO PLAN. Review at least two displayed optimization scenarios, especially two sharing the same displayed tier/class. Each `Review` action must open that exact scenario and must not show `That scenario is not reviewable.`
3. Tap a planned Validation activity in existing persisted state. Confirm Green/Yellow manual alternatives work through `Move / replan in swimlane`.
4. Confirm the same Validation activity shows `Route only this test/activity to a sister lab` when independently routable.
5. Confirm Prototype planned-item/manual/sister-lab behavior remains unchanged.
6. Accept a Validation partial sister-lab transfer, then run AUTO/replan. The accepted remote assignment must remain the single live assignment.
7. Refresh/close/reopen the page without clearing IndexedDB and repeat Validation manual/sister-lab checks.
8. Report any other missing/restored/new functionality; it will be classified into the 10-stage framework before changes.
