# LabOS REV 1.0.113 — targeted QA report

## Reported failure reproduced from UI evidence

The reported state was a Product-Safety-relevant build in **Reuse approved controls; review build-specific changes** with:

- Control Plan already approved;
- Product Safety still the current workflow owner;
- workflow not complete;
- yellow Next Action rendered as a generic **Continue · … ↓** button;
- pressing it did not clear or expose the actual pending approval.

Code-path review confirmed the defect: the REV 1.0.93 Control Plan cockpit override returned **Control Plan approved** as soon as `cp.status === 'Approved'`, bypassing the base approval-dock logic that would otherwise inspect pending Product Safety approvals. Because the controls technical-ready check correctly remained false until Product Safety approval, the Next Action fell back to the generic scroll behavior.

## Corrected behavior

The final controls-stage decision order is now:

1. resolve/approve Control Plan definition and independent approval when required;
2. if Product Safety is applicable and pending, expose the exact Product Safety action;
3. after Product Safety approval, expose **Confirm controls & continue** when controls are technically ready;
4. only then allow the workflow to progress to Resource plan & committed timing.

For the Product Safety action:

- Product Safety Representative / Administrator: **Approve Product Safety →**;
- other roles: **Switch to <assigned representative> →**.

No controls-stage path should now fall back to a generic scroll action while a known Product Safety approval is pending.

## Targeted checks

- JavaScript syntax for every runtime JS file: PASS.
- Manifest JSON parse: PASS.
- All six versioned runtime assets referenced by `index.html` exist: PASS.
- Header/runtime references updated to REV 1.0.113: PASS.
- Product Safety pending action is intercepted before Control-Plan-approved early return: PASS (source-path verification).
- NEXT ACTION exposes Product Safety approval/switch rather than generic scroll: PASS (source-path verification).
- SIGN-OFF exposes Product Safety approval/switch rather than false all-clear: PASS (source-path verification).
- After safety ceases to be pending, code falls back to the existing `Confirm controls & continue` readiness path: PASS (control-flow verification).
- Historic Control Plan approval-reset warning is not presented as still outstanding after current revision is already Approved: PASS (render-path verification).
- IndexedDB schema unchanged: PASS — 35.

## Qualification note

This environment blocks Chromium navigation to local/file URLs with an administrator policy, so a new full browser-click execution could not be completed here. The defect was nevertheless isolated in the exact production UI code path and the corrected path was syntax/source/control-flow verified. Physical Android/browser confirmation remains recommended after deployment.
