# LabOS REV 1.0.185 · Future Project Scope Modal Fix TEST-3

## User-observed regression
Adding a Future Potential Project still opened the legacy project form and did not reliably expose the expected Prototype/Validation copy-scope choices.

## Root cause
The work-package estimator and scoped modal had been added, but the application still contained earlier `data-new-pipeline` / `data-edit-pipeline` handlers and multiple historical `pipelineProjectModal` definitions. Depending on the live binding path, the legacy modal could remain the entry point even though the new estimator existed.

## Correction
- A dedicated TEST-3 scoped Future Project modal is capture-routed before legacy click handlers.
- Prototype scope now explicitly offers:
  - Use product default released route
  - **COPY PREVIOUS PROTOTYPE BUILD — route + referenced tests**
- Validation scope now explicitly offers:
  - Choose tests from Test Library
  - **COPY PREVIOUS VALIDATION PROGRAMME — test scope + activities**
- Both Prototype and Validation configuration areas stay visible so the copy capability is discoverable even before Validation is enabled.
- Copying is estimate-only: no live request, programme, route, activity or booking is created or changed.
- Existing work-package resource, competency, external-cost and KPI forecasting remains canonical.

## Verification
Focused automated regression:
- Future project work-package/scenario: 7/7 PASS
- Future projects/KPI: 6/6 PASS
- Scenario/external-lab restoration: 8/8 PASS
- Prototype Create Draft: 3/3 PASS
- New copy-scope routing/estimator tests: 4/4 PASS

Browser-level headless Chromium verification:
- Add Future Potential Project opens the scoped modal.
- `COPY PREVIOUS PROTOTYPE BUILD` is visible.
- Selecting it exposes the comparable Prototype dropdown with 24 existing builds plus the placeholder.
- Enabling Validation and selecting `COPY PREVIOUS VALIDATION PROGRAMME` exposes the Validation dropdown with existing programmes.
- Both copy selectors are interactive and populated.

Total focused automated checks: 28/28 PASS, plus interactive Chromium modal verification PASS.
