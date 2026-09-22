# LabOS Stage 4 Manual Browser Acceptance Checklist — TEST-1

Test **only** the exact frozen package `ProtoLabOS_Prototype_Build_POC_v1.0.185_STAGE4_GITHUB_TEST1_WEB.zip` and preserve the existing IndexedDB/site state unless a check explicitly says Reset Demo Data.

Expected visible identity: **REV 1.0.185 · S4 TEST-1**  
Expected controlled build: **STAGE4-GITHUB-TEST-1**

Record PASS/FAIL plus screenshots/notes for every item.

1. **Deployment identity / startup** — page starts cleanly, badge/footer show the exact Stage-4 TEST identity, no deployment mismatch or missing-script message.
2. **Prototype Readiness view** — open an active Prototype build and Readiness. Reopening/refreshing the view must not create unexpected requirements/approvals/bookings or otherwise change the build merely because it was viewed.
3. **Structured readiness explanation** — Readiness clearly distinguishes ready, blocker and warning conditions; blockers identify the specific resource/prerequisite rather than a generic "not ready" message.
4. **Equipment readiness** — inspect a build with an equipment blocker/warning. Calibration/maintenance/capability/status information should match the selected equipment and planned use. If an alternative equipment action is offered, applying it must update the intended task only and survive refresh with no duplicate active booking.
5. **People readiness** — inspect a staff qualification/availability/training blocker. If an alternative person action is offered, applying it must update the intended task only and survive refresh with no duplicate active booking.
6. **Validation readiness** — open an active Validation programme and confirm it receives the same style of resource/prerequisite readiness assessment as Prototype rather than a separate/blank readiness model.
7. **Sister-lab task readiness** — for task-level transferred work, confirm readiness follows the receiving execution site for that task while the programme remains owned by its original/home programme context.
8. **External execution readiness** — where an external-test request exists, Requested/not-ordered work must remain not ready for execution; after the governed order/approval state is present, the commercial-order blocker clears appropriately.
9. **Protected Planning smoke test** — perform one Green/Yellow manual replan and confirm the rationale/formal acceptance boundary still appears, the accepted move persists once, and unrelated bookings remain.
10. **Protected Network smoke test** — confirm active-site Escalation stays lab-specific and sister-lab stale-proposal Refresh/revalidation still behaves as before; no premature duplicate SiteAssignment appears.
11. **Mobile/touch** — on a narrow/mobile viewport, open Planning and trigger a Green manual option. The action must open the governed replan flow and must not be swallowed by timeline pan/view switching.
12. **General regression scan** — dashboard/workspaces/Planning/Validation/My Work should open normally; report any newly missing controls, loops, duplicate bookings/SiteAssignments, or unexplained readiness state.

### Acceptance result

- [ ] All required items PASS
- [ ] Any failures are listed with build/project/test, exact action, expected result, actual result and screenshot if possible

Do **not** call this Stage 4 accepted until the user explicitly confirms the exact candidate passed this checklist.
