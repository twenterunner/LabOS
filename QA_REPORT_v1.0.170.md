# LabOS REV 1.0.170 — Validation report launch repair + controlled reporting QA

**Release:** `ProtoLabOS_Prototype_Build_POC_v1.0.170_WEB.zip`  
**Visible/runtime revision:** `REV 1.0.170` / `1.0.170-poc`  
**Schema:** 38 — no reset required

## Scope implemented

REV 1.0.170 retains the REV 1.0.169 controlled Prototype/Validation reporting upgrade and fixes the non-responsive **Open Validation Report** paths. Reports-page report buttons now launch the exact programme report directly instead of routing through the Validation workspace/tab state first. The in-programme **Preview full report** action uses the same direct launcher.

### Validation result traceability
- Result entry visibly identifies part number/product revision, Validation programme, test, controlled method revision, Test Leg and exact DUT/sample/serial population before the operator records evidence.
- Results are stored per DUT/sample with formal serial, measured/categorical value, Pass/Fail and evidence reference, plus a common controlled test record and deviation/disposition context.
- The stored result snapshots part number/product revision, method revision and acceptance criteria so later master-data changes do not silently rewrite historical evidence.
- Evidence changes after report approval invalidate the approval and require re-review.
- Failed results remain reported as failures; final report approval is possible only when execution is complete and the controlled technical-record/disposition readiness checks are satisfied.

### Validation controlled report
The report now provides:
- controlled document status/revision/approval and evidence fingerprint;
- part number, product revision, programme/project, execution lab and sample source;
- controlled DUT/sample register with formal serials;
- test completion and DUT disposition graphics;
- DUT × test traceability matrix;
- method identity/revision and explicit acceptance criteria for every test;
- sample-linked result/evidence tables, operator/time and execution resource evidence;
- numeric DUT trend graphs with target/LSL/USL overlays when controlled numeric limits exist;
- equipment identity, live readiness and calibration-certificate evidence;
- personnel qualification/competency evidence when assigned;
- source/specification requirement traceability where retained;
- audit-event count and controlled approval record.

### Prototype report
- Build definition/report identity now makes part number, project/programme and customer explicit.
- Prototype technical-record readiness is surfaced in the report.
- Sample-level numeric end-test plots are appended to the controlled report.
- Capability indices are suppressed for fewer than 30 numeric observations; small prototype sets remain descriptive rather than presenting a misleading capability claim.

## IATF-alignment boundary
These changes are evidence/control aids aligned to the kinds of laboratory traceability, measurement-resource, competence, technical-record and controlled external-laboratory evidence expected in an automotive QMS. They are not a certification claim. Customer-specific requirements, the organization's approved laboratory scope/methods, competence rules, measurement-system/calibration controls, external-laboratory acceptance/accreditation and the implemented QMS remain authoritative.

## REV 1.0.170 report-button regression
- Reports-page **Open Validation Report** buttons now render `data-v170-open-validation-report=<programmeId>` rather than `data-open-validation + data-validation-tab=report`.
- The direct launcher validates the programme ID, sets the Validation report context and calls the controlled REV 1.0.169 report preview directly.
- **Preview full report** inside a Validation programme uses the same direct path.
- Static regression confirms no visible report button still depends on the old workspace-tab route.

## Executable/static QA
- `node --check`: PASS for every packaged JavaScript file.
- `manifest.webmanifest` and `labos-version.json`: valid JSON.
- `index.html` references only REV 1.0.170 runtime/style files and every referenced local runtime asset exists.
- Core executable fixture: PASS. A seeded standalone Validation programme was given 10 formal serials and sample-linked result rows for all 4 tests. The generated report retained part number `PWT-SND-18`, 10 DUTs, 4/4 test result records and 10 sample references per test; all critical technical-record checks passed.
- Static implementation checks: PASS for per-DUT result matrix, part-number snapshot, DUT × test matrix, controlled acceptance criteria, report approval invalidation, calibration/competence evidence, numeric limit/target overlays and Prototype small-sample capability suppression.
- ZIP clean-extraction/integrity gate: PASS — package extracted cleanly, all packaged JavaScript rechecked, and ZIP CRC/integrity test reported no errors.

## Browser-test environment note
A fresh Chromium navigation acceptance run could not be executed in this environment because browser navigation to local/file/data test URLs is blocked by an administrator policy. The system Chromium executable itself is available and DOM-only `set_content` works, but policy blocks the navigation origin needed by this IndexedDB application. This report therefore does **not** claim a fresh end-to-end rendered browser pass for REV 1.0.170. The release is syntax checked, executable-core tested, statically verified and clean-package checked.
