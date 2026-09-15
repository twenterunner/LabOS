# Verification — REV 1.0.131

## Executed checks

- **JavaScript syntax:** PASS — `node --check` on `labos-app-1.0.131.js` and `labos-services-1.0.131.js`.
- **Runtime asset references:** PASS — every local script/style/manifest/icon referenced by `index.html` exists in the package.
- **Revision synchronization:** PASS — application runtime reports `1.0.131-poc` and the header badge renders `REV 1.0.131`.
- **Browser boot harness:** PASS — the complete REV 1.0.131 script set was loaded in headless Chromium and reached the `ready` boot phase with 24 demo requests.
- **Added whole-lab closure over live work:** PASS — a forced 23 Oct Twente closure affected P26-1007 and P26-1008; both were automatically moved to feasible plans (forecasts 5 Nov and 19 Nov in the deterministic demo state), no booking remained inside the closure, and unrelated existing portfolio problems were not pulled into the transaction.
- **Planning-situation isolation:** PASS — the best-feasible proposal touched only builds whose accepted booking footprint was made impossible by the new situation; unrelated builds were not cleared or replanned merely because another portfolio item had a pre-existing blocker.
- **Calibration collision:** PASS — scheduling calibration of EQ-008 directly over live P26-1007 work was accepted; P26-1007 was automatically replanned, the calibration remained reserved, and no residual equipment overlap remained.
- **Build-change gate ownership:** PASS — injected pending Process-route and Control-Plan change approvals made the corresponding earlier `processrisk` and `controls` workflow steps incomplete rather than allowing them to remain green until Build Readiness.
- **Executable approval route:** PASS — the blocker opened `Build-specific change sign-off · P26-1002`, displayed both required signers, and a sign-off button changed one controlled approval from Pending to Approved in the browser harness.

## Behaviour verified

1. A vacation, staff absence, lab closure, equipment outage or other accepted capacity situation is an **operating fact**, not a prerequisite resolution task. LabOS calculates the least-disruptive feasible replan around it.
2. If an affected build cannot be completely placed, the situation can still be accepted. The build is left explicitly **unplanned / at risk** with its stale future forecast removed rather than preserving a contradictory partial schedule.
3. Scheduled calibration, maintenance and training follow the same best-feasible policy for build conflicts. A true hard reservation-to-reservation or reservation-to-lab-event collision remains invalid because both constraints cannot physically occupy the same capacity.
4. Build-specific reused-document changes are owned by their actual definition/control step and resolve through the consolidated sign-off package.
