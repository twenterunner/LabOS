# LabOS REV 1.0.156 — QA Report

**Release:** LabOS REV 1.0.156  
**Schema:** 38  
**Baseline:** released REV 1.0.155 package  
**Scope:** shared Prototype + Validation Programme Logic canvas, customer-defined Validation legs/sequences/dependencies/DUT flow, and explicit requirement-to-verification mapping.

## Release decision

**PASS — release candidate accepted for the static-browser PoC.**

REV 1.0.156 consolidates the principal programme-design interaction so Prototype routes and Validation programmes use the same Programme Logic canvas format and a common graph adapter, while preserving domain-specific controls. Validation customer specifications can now carry controlled programme structure rather than only a flat requirement list.

Schema remains **38**. No reset or schema migration is required.

## Shared Programme Logic canvas

PASS:

- Prototype and Validation use the same `v156CanvasShell` interaction format.
- The common `programmeGraphAdapterV156` provides the Prototype graph representation; Validation continues to use the controlled Validation graph model through the same canvas interaction pattern.
- Prototype route/process semantics remain authoritative; visual block movement changes only stored canvas coordinates and does not silently change controlled route order.
- Validation visual placement remains separate from controlled dependencies.
- Auto layout, zoom/Fit, dependency lines and mobile-safe controls remain available.
- Browser acceptance rendered a representative Prototype programme with **10 nodes / 9 dependencies** and correct SOURCE / PROCESS semantics.

## Customer-defined Validation structure

The REV 1.0.156 customer template now carries:

- requirement ID and customer clause/page;
- requirement text and acceptance criteria;
- DV/PV and mandatory flag;
- customer test leg;
- sequence;
- predecessor requirement(s);
- parallel group;
- DUT quantity and DUT continuation rule;
- destructive flag;
- verification type;
- customer method/reference;
- category, criticality and notes.

PASS — controlled CSV template import retained leg, sequence, predecessor and DUT-population fields and generated the visual programme structure.

Acceptance fixture:

- Environmental durability: **6 DUTs**, sequential requirements 6.4.1 → 6.4.2;
- Mechanical durability: **4 separate DUTs**, sequential requirements 6.5.1 → 6.5.2;
- generated structure: **Split → two independent customer legs → Merge**;
- expected programme DUT population synchronised to **10**;
- controlled Split allocations: **6 + 4 = 10**;
- graph integrity: **PASS**, zero graph issues/cycles.

A released Standard Test reused at more than one customer sequence position is represented as separate execution occurrences. The controlled method identity is reused, but separate customer legs/sequence positions are not collapsed into one execution node.

## Requirement relationships and mapping

PASS:

- `+ Requirement` exposes customer clause/page, leg, sequence, predecessor(s), parallel group, DUT quantity/continuation, destructive use, verification type and customer method/reference.
- Requirement cards show predecessor/successor context and the current mapping decision.
- **Show full chain** resolves the connected customer-requirement sequence and selects the associated programme nodes.
- **Map / review method** exposes controlled options:
  - Reuse as-is;
  - Adapt existing method;
  - Combine multiple released tests;
  - Develop new test;
  - Other verification.
- Candidate mappings expose controlled-history evidence; matching remains an engineering proposal rather than automatic approval.
- Combine creates distinct controlled test occurrences linked to the requirement.
- Other verification creates an explicit verification node instead of pretending a laboratory test exists.

## Customer PDF / Word / Excel / CSV workflow

The existing REV 1.0.155 local extraction paths are retained and integrated with the REV 1.0.156 structure fields:

- CSV and controlled template;
- XLSX;
- DOCX;
- text-layer PDF;
- pasted customer text.

The in-app **Customer PDF example** demonstrates `CUSTOMER_DV_Specification_RevC.pdf` flowing from customer clauses into Environmental and Mechanical test legs, method mapping, automatic Split/parallel-leg/Merge canvas generation, shared planning, execution, RTM/report and lessons.

Source extraction and method matching remain proposals requiring engineering review. Image-only/scanned PDF OCR is not fabricated by the static PoC.

## Development learning and Standard Test lifecycle

REV 1.0.156 preserves the REV 1.0.155 controlled lifecycle:

- reuse released Standard Tests / prior released Validation methods first;
- adaptation creates schedulable development before verification;
- genuine gaps create new-method development;
- original estimate, latest estimate and measured actual hours are retained;
- Validation actuals use the same development-history learning mechanism as Prototype;
- successfully released developed methods can be nominated and approved into the common Standard Test Library;
- lessons and report drafts refresh from controlled evidence without auto-approving them.

## Twente Validation KPI/demo preservation

PASS — the REV 1.0.155 Twente Validation history remains populated.

Last-90-days `LAB-NL` acceptance observed:

- programmes: **8**;
- completed programmes: **8**;
- tests: **25**;
- requirements: **28**.

The common KPI definition layer remains **42 definitions**. Demo values are demonstration data, not claimed production performance.

## Planning regression

PASS — representative programme `V26-0032` through the canonical shared Validation planner:

- feasible: yes;
- forecast: **22 Sep 2026**;
- generated bookings: **6**;
- planning failures: **0**.

All **19** seeded Validation programme graphs passed graph-integrity checks in the release state.

## Prototype regression retained

PASS:

- REV 1.0.142 workflow liveness: **22 builds**, 0 failures;
- REV 1.0.142 fault reconciliation;
- REV 1.0.142 stage idempotence: **22/22**;
- REV 1.0.143 workflow audit: **22 builds**, 0 failures;
- REV 1.0.144 Control Plan / material gate self-test;
- REV 1.0.145 load-balance/self-healing self-test;
- REV 1.0.146 Control Plan / Action Centre workflow self-test;
- REV 1.0.148 canonical resource semantics: Optical Inspection capability PASS, no direct-logic leaks in the retained hook;
- global `validateInvariants`: **0 issues**.

## Desktop / mobile browser acceptance

Desktop PASS:

- shared Prototype canvas rendered;
- customer template imported;
- customer legs/sequences retained;
- 10-DUT controlled split generated;
- Validation graph integrity passed;
- requirement mapping decisions present;
- Combine / Develop new / Other verification controls visible;
- customer PDF example visible;
- no page/console errors.

Mobile PASS at **390 × 844**:

- Validation Programme Logic canvas visible;
- canvas height in acceptance: approximately **574 px**;
- canvas appears before the long palette/reuse panel;
- graph nodes visible;
- mobile Add Step control present;
- no page/console errors.

## Static release checks

PASS:

- every release JavaScript file passes `node --check`;
- manifest parses;
- all local `index.html` references resolve;
- runtime is `1.0.156-poc` and visible badge is `REV 1.0.156`;
- current runtime/style filenames are `1.0.156`;
- no prior runtime file is required by `index.html`;
- service worker is the REV 1.0.156 deployment-reset worker.
- final ZIP integrity (`unzip -t`) passes with no compressed-data errors.
- final ZIP extracts cleanly; every extracted JavaScript file passes `node --check` and all local index references resolve.
- release payload contains no REV 1.0.155 runtime file.

## Packaging note

The final ZIP was built from the browser-tested REV 1.0.156 working tree and then cleanly extracted for syntax/reference/integrity checks. A second full browser import suite against the extracted directory exceeded the execution time window, so this report does not claim an additional post-ZIP browser run; the desktop/mobile browser suites above were run against the same release files immediately before packaging.

## Scope boundary

LabOS remains a static-browser proof of concept with browser-local persistence. A production multi-user system still requires governed backend storage, enterprise authentication/authorization enforcement, server-side audit/transaction guarantees, controlled evidence storage, concurrency handling and managed document extraction. PDF/DOCX/XLSX matching in this static PoC remains local deterministic assistance and engineering review is mandatory.
