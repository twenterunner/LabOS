# LabOS REV 1.0.165 — QA / Release Report

**Release:** `ProtoLabOS_Prototype_Build_POC_v1.0.165_WEB.zip`  
**Visible/runtime revision:** `REV 1.0.165` / `1.0.165-poc`  
**Data schema:** `38` (unchanged; no reset required)

## Requested scope implemented

1. **Prototype smart Test Development** — Prototype End Characterisation now explicitly separates **Standard Test** from **Test Development**. New/adapted tests use the same cross-domain learning estimator as Validation, combining measured Prototype development history, measured comparable Validation development history, closest released Standard Test fit and the controlled delta. Existing actual-development capture continues to feed future estimates.
2. **Validation samples / serials per Test Leg** — each Test Leg has controlled sample assignment. Standalone Validation programmes maintain a DUT/sample register with optional formal serial numbers. When Validation is linked to a Prototype Build, the Prototype sample IDs/serial numbers are reused rather than creating a duplicate population. The selected sample references propagate to activities in the leg.
3. **Requirement Coverage removed from active Validation workflow** — active flow is **Test Flow → Resource Plan → Execution → Report & Close**. Legacy requirement data remains available to historical reports/audit where already stored, but is not a workflow tab or planning gate.
4. **Validation UX aligned to Prototype shell** — the duplicate left workflow panel is removed. Validation keeps the same fixed sticky cockpit pattern as Prototype, with a cockpit spacer so the fixed header does not cover the Test Flow cards/content.
5. **Validation in Planning** — Validation uses the existing shared graphical swimlane. The common renderer now resolves Validation programme IDs when building portfolio/per-programme lane labels, dates and project context. There is still one constrained people/equipment calendar, not a Validation-only planner.
6. **Swim-lane project column formatting** — the sticky project column is widened and uses word-aware two-line wrapping instead of breaking project/build identifiers at arbitrary characters.

## Release gates

The final packaged payload is required to pass:

- JavaScript syntax (`node --check`) for every packaged JS file;
- `manifest.webmanifest` JSON parse;
- all local JS/CSS assets referenced by `index.html` exist;
- visible revision, runtime version and deployment reset marker are 1.0.165;
- focused model/UI hooks for the V1.0.165 estimator, sample genealogy, Validation designer and integrated planning are present;
- clean ZIP integrity/extraction check.

## Compatibility

- Schema remains **38**; no reset is required.
- Existing Prototype routes, tests, development history, samples, bookings, Validation programmes, activities, results, lessons, reports and audit records are retained.
- Existing Validation requirements are not deleted; they are simply no longer exposed as a separate active workflow section.
- The package remains a static-browser proof of concept using browser-local persistence.

## Executed verification

- **PASS** — `node --check` on every packaged JavaScript file.
- **PASS** — `manifest.webmanifest` parses as valid JSON.
- **PASS** — every local JS/CSS asset referenced by `index.html` exists.
- **PASS** — visible revision is `REV 1.0.165`; runtime is `1.0.165-poc`; deployment reset marker is 1.0.165.
- **PASS** — focused model fixture verified the active Validation workflow is `programme → planning → execution → report`.
- **PASS** — linked-Prototype Validation fixture reused two Prototype sample/serial records, assigned them to a Test Leg and propagated the sample references to activities in that leg.
- **PASS** — shared smart-development fixture returned an estimate using measured Prototype/Validation history through the common V1.0.165 estimator path.
- **PASS** — V1.0.165 UI/model hooks for Prototype Standard Test/Test Development selection, Validation leg samples, integrated planning and project-column formatting are present.
- A new rendered Chromium interaction pass is **not claimed** for this release because headless Chromium did not complete reliably in this execution environment; the static/model gates above are the verified release checks.
