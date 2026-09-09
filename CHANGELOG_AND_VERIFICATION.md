# LabOS REV 1.0.49 — Change & Verification Record

## Release objective

REV 1.0.49 completes the application-wide **no-dead-end / executable-only workflow contract** and adds the usability/setup changes requested during mobile testing of REV 1.0.48.

The governing rule is now:

> **LabOS may not present an actionable recommendation or accepted change that leaves the user to manually work out the remainder. A controlled change is either carried through to a complete feasible state, or it is not applied.**

## 1. Executable-only Improvement Scan

- Staffing and equipment load-balancing proposals are shown only after a complete qualified/conflict-free reassignment has been prevalidated.
- Accepting a proposal revalidates it against current bookings, qualification/readiness and capacity.
- The real controlled booking/route assignments are changed on acceptance.
- Effectiveness is verified before the state is committed.
- If the proposal is no longer fully executable, it is withdrawn and nothing is applied.
- Legacy accepted-but-unimplemented improvement actions are withdrawn by the schema-24 migration.

## 2. Atomic planning situations and blocker resolution

Staff absence, equipment outage, lab closure and similar capacity events now use one transaction:

**proposed capacity change → complete portfolio simulation → resolve structural blockers → re-run complete simulation → Accept/Reject → atomic apply**

- A capacity constraint is not written to live state before its complete portfolio schedule is feasible and accepted.
- Planner errors now return structured blocker context including task, skill, capability, staff/equipment and readiness type.
- Competency, missing-equipment and staff-availability blockers route directly into their functional guided resolvers.
- After the blocker is resolved, the pending capacity/schedule solution is retried automatically.
- Generic “open the build and work it out” is no longer the resolution path for these blockers.

## 3. Calibration, maintenance and training scheduling

- Duration is editable directly inside the readiness-scheduling transaction.
- The selected duration updates the equipment/competency master data.
- Build collisions trigger automatic replanning of the affected build(s).
- Fixed readiness/lab-event collisions are refused rather than saved unresolved.
- A readiness reservation is committed only after residual-collision verification.

## 4. Large-quantity sample UX

### Build Sample Register
- For more than 8 samples the register is collapsed by default.
- Search is available by sample number, Lab Sample ID, formal serial and lot/status content.
- Batch/sample data matrix remains the primary action; per-sample detail is for identity or exceptional evidence.

### Build execution group
- For more than 8 pending samples the execution-group selector is collapsed by default.
- All pending samples remain selected by default.
- Opening the foldout allows search, Select all, Clear and per-sample selection.
- This changes presentation only; the sample selection remains a real execution-group input.

## 5. Sample & Serial History

- Added full-text search across sample number, Lab Sample ID, formal serial, build, product/configuration, customer, material lots, process history, operator and equipment.
- Grouping is retained (product/build/month/quarter/person/equipment/process/customer/team/purpose/release state).
- Groups are collapsible and large result sets are not expanded automatically.
- Sample tiles were reformatted into distinct identity, build/product and evidence metadata instead of concatenated text.

## 6. Characterisation clarified

The global **Characterisation** navigation item is now **Results & Capability**.

Its purpose is cross-build analysis/review only:
- distributions/capability and result status;
- traceability review;
- drill-down to the owning build.

It no longer exposes a second generic measurement-entry/CSV path. New or corrected evidence is entered through the governed route-step or end-test workflow.

## 7. Lab Setup Wizard

Administrator → Configuration now contains **Start / continue setup** with 8 guided areas:

1. Organisation, site/laboratory and audit scope
2. Customers or explicit internal-only operation
3. Products & BOM master
4. People & competencies
5. Equipment plus calibration/maintenance durations
6. Readiness evidence / clean-start mode
7. Released processes/methods
8. Go-live integrity validation

A new lab with no historical readiness evidence can choose **clean start**; LabOS then relies on its scheduling engine to place required calibration/maintenance/training before first governed use rather than forcing the wizard into a dead end.

## 8. Existing-LIMS migration

Controlled CSV import now supports:
- equipment;
- calibration certificates;
- maintenance records;
- staff;
- competencies;
- training certificates;
- products;
- customers.

Each dataset has a downloadable template. The UI states the recommended dependency order. Imports are applied to a clone, validated with LabOS invariants, audited, and committed only if valid. Evidence/certificate URLs are preserved as links. Binary documents remain in the controlled document repository and can be referenced by URL in this POC.

## 9. Governed build execution retained from REV 1.0.48

The following remains fully enforced:

**confirmed route + released process revision + approved Control Plan → execution group → recipe/setup → process/sample/CP matrix → sampling-rule evidence → completion**

This includes 100% sampling, reduced-sampling subsets, CP/process de-duplication, real execution runs, released work-instruction rendering and method-development evidence materialisation.

## 10. Schema / compatibility

- Application: **REV 1.0.49**
- Schema: **24**
- Existing schema-23 data migrates automatically.
- Existing unresolved legacy improvement actions are withdrawn so they cannot violate the executable-only contract.
- Existing REV 1.0.48 governed-execution migration is retained.

## Verification results

| Suite | Result |
|---|---:|
| Core domain/planning | 46 / 46 |
| Persistence/migration | 6 / 6 |
| Base UI regression | 23 / 23 |
| Governed execution / CP | 18 / 18 |
| REV 1.0.49 UX / setup / migration / no-dead-end | 15 / 15 |
| Realistic disruption scenarios | 10 / 10 |
| Role/build/workspace DOM stress | 1,783 / 1,783 |
| Responsive/static/package checks | 31 / 31 |
| **Total** | **1,932 / 1,932** |

New REV 1.0.49 tests explicitly exercise:
- folded/searchable large sample registers;
- folded/searchable 10-sample execution group;
- Serial History search and structured foldouts;
- analytics-only Results & Capability;
- all 8 Lab Setup areas and clean-start readiness option;
- all 8 LIMS import dataset types;
- equipment + calibration + maintenance migration with evidence links and durations;
- staff + competency + training-certificate migration with qualification association and evidence link;
- suppression of non-executable improvement proposals;
- automatic, verified staffing reassignment on acceptance;
- editable calibration duration inside the scheduling transaction;
- atomic capacity-situation preview;
- guided blocker routing and automatic retry of the pending complete solution;
- structured planner blocker payloads.

## Test-environment limitation

The environment used for this release does not permit a genuine physical-device Chromium exploratory run. DOM/state stress, responsive/static checks and mobile-oriented rendering logic passed, but production acceptance should still include real Android/iOS/desktop exploratory testing, accessibility testing and real print/PDF-output verification.
