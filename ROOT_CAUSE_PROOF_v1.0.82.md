# Root-cause proof — LabOS REV 1.0.82

## Symptom A — month/CW/weekend changes appeared not to work

This was a real override defect, not a browser-cache explanation.

In REV 1.0.81, `app.js` contained several definitions of the same renderer. An early renderer (around the original line 576) contained the REV 1.0.80 calendar markup (`swim-month-v1080`, `swim-cw-v1080`, weekend bands). A later assignment to `planningSwimlane` (around the original line 2937) was the function actually used at runtime. Its date header was only:

`weekday + numeric date + AM/PM`

and its lane markup did not insert weekend bands. The build-workspace renderer had the same problem: the final `workspaceMiniPlanningSwimlaneV1066` override used a compact weekday/date header and no full-lane weekend shading.

**Proof criterion:** JavaScript uses the last assignment to a function variable/name. Therefore a correct change to an earlier implementation cannot affect runtime after a later override replaces it.

**REV 1.0.82 correction:** the final active renderers themselves now emit `calendar-day-v1082` / `workspace-calendar-day-v1082`, month, ISO `CW`, weekday, date, AM/PM, and full-height weekend-band elements.

The browser regression test renders the real application scripts and confirms:
- 56 calendar cells in the 8-week portfolio view;
- first week text includes `SEP`, `CW37`, `Mon 7` through `Sun 13`, plus AM/PM;
- weekend-band elements are present through the swimlane tracks;
- all `− / Fit / +` controls are enabled;
- a planned build workspace renders the same month/CW/weekday/date structure and weekend bands;
- an **unplanned** build (matching the screenshot state) still renders a 14-day month/CW/weekday/date calendar with weekend shading when expanded.

## Symptom B — “Open material resolution” did nothing

This was also a real wiring defect.

In REV 1.0.81, the current-workflow material blocker returned:

`actionLabel: 'Open material resolution'`

but the action attribute was:

`data-workspace-tab="materials"`

The click handler for that attribute only switches the workspace to the named tab. Because the user was already looking at Materials, the action was a self-link: it could not reserve stock, create supply, receive anything, or change the blocker evidence.

The screenshot case also shows why the previous **Reserve all BOM material** action was intrinsically incapable of resolving the blocker: every required BOM line showed zero unreserved exact stock. There was simply nothing to reserve.

**REV 1.0.82 correction:** the blocker now opens `v1082MaterialResolver()`. It calculates each exact BOM line's required, reserved, available, incoming and uncovered quantities and offers only actions that can change the underlying evidence.

## Executable reproduction

The browser verification deliberately creates a screenshot-equivalent lab-supplied case with four BOM lines, each requiring 123 units and with zero exact stock:

1. Resolver opens and diagnoses a true stock shortage.
2. User supplies owner, future arrival date and controlled PO/order reference.
3. Four incoming rows of 123 units are recorded.
4. `planningReady` changes from false to true; `buildReady` deliberately stays false.
5. The Materials page exposes **Receive planned supply**.
6. Actual lots are received and automatically reserved to the exact BOM.
7. Issuing those reservations changes `buildReady` to true.

A second browser case proves the non-shortage path: when exact stock exists, **Reserve exact stock now** reserves the correct quantities and immediately makes material timing planning-ready.

No page-level JavaScript errors were observed during these UI flows.
