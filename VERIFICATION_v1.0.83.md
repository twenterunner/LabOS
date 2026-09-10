# LabOS REV 1.0.83 — verification record

## Passed locally

- `node --check` completed successfully for `core.js`, `demo-data.js`, `repository.js`, `services.js`, `app.js`, and `service-worker.js`.
- The prior release’s material and planning runtime regression remained green:
  - fresh demo planning-integrity audit is clean;
  - exact stock, incoming supply, physical receipt, reservation, and issue retain their distinct evidence states.
- The active renderer still contains the 1.0.82 calendar and material-resolver safeguards.

## Interface acceptance checks

- Every interactive control has a visible keyboard focus state.
- An open dialog closes with `Escape`.
- `Tab` and `Shift+Tab` cycle within an open dialog.
- Closing a dialog returns keyboard focus to its initiating control when it still exists.
- Dialogs fit mobile safe areas and reduce motion when the user requests it.

## Regression-suite note

`verification-v182.py` is deliberately version-pinned to REV 1.0.82 and therefore reports its three identity assertions as failures after this release’s intentional REV 1.0.83 cache/version update. Its historical REV81 source fixture is not present in this delivery folder, and its Chromium harness is unavailable in this local runtime. These are verification-environment constraints, not product failures.
