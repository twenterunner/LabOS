# LabOS REV 1.0.52 — concise Build Report and best-in-class Lab Performance cockpit

## Purpose

REV 1.0.52 addresses two usability problems: the Prototype Build Report had become long and repetitive, while the Management KPI page exposed many charts without a sufficiently clear LIMS operating model. This revision applies progressive disclosure: decision-critical information stays visible; supporting detail remains available in foldouts and is automatically included when the Build Report is printed/saved as PDF.

## Prototype Build Report redesign

The report is now organised as a controlled evidence dossier rather than a sequence of repeated cards.

- Build definition is a compact table rather than a field-card wall.
- Process execution is one route execution table; the duplicate process-flow visual was removed from the report.
- Structured process-step data moves to a foldout.
- The former separate **Control Plan** and **Control implementation & evidence traceability** sections are consolidated into **Control Plan execution & measured data**.
- Every governed CP characteristic — SC, CC, product-safety or unclassified — shows specification, sampling rule, actual evidence coverage and result.
- A sample × characteristic matrix contains the actual latest measured values, pass/action status and sampling applicability.
- Control methods and reaction plans remain available in a foldout rather than occupying the main report surface.
- End-of-build tests have a concise summary plus a sample × test measured-value matrix in a foldout.
- Classified-characteristic statistics use a compact summary table. Distribution/normality plots and interpretation detail are foldouts.
- Material lots and sample genealogy are proper tables. Large builds therefore no longer produce one prose line per serial number.
- Sample-specific structured evidence is a matrix, chunked into manageable column groups; observations and photographs are separate foldouts.
- Quality shows exceptions only; FPY/yield/rework values are not repeated after the report disposition section.
- Revision history, lessons and other secondary evidence are folded by default.
- The historical measurement appendix excludes the current governed CP/end-test records already shown in their owning sections; it contains historical/superseded and genuinely supplemental evidence only.
- Print/PDF CSS automatically expands report foldouts, so concise on-screen presentation never removes audit evidence from the generated document.

## Lab Performance redesign

The Management KPI page is renamed **Lab Performance** and now begins with the questions a laboratory manager actually needs to answer.

### Management Attention

Only current exception signals are surfaced prominently. Signals link to the functional workspace that owns the resolution — Prototype Requests, Quality Workbench, Resource Assurance or Planning.

### Four operating pillars

1. **Delivery & Flow** — on-time delivery to original commitment, throughput, active WIP/overdue work and median request-to-delivery lead time.
2. **Quality** — first-pass yield, scrap, rework and open release holds/quality cases.
3. **Readiness & Compliance** — calibration compliance, maintenance compliance, valid training/competency evidence and scheduled readiness work.
4. **Capacity & Cost** — current utilization, forecast peak/bottleneck, cost per prototype and actual-vs-estimate variance.

Supporting analytics are no longer permanently expanded. Delivery/replan root cause, quality/cost trends, capacity/bottlenecks, process performance, future project pipeline and KPI definitions are separate foldouts.

## Progressive-disclosure UX rule

REV 1.0.52 reinforces the application-wide rule used increasingly across LabOS: show the current decision/action and critical evidence first; put rationale, history, statistical detail, large registers and supporting evidence behind explicit foldouts. This keeps the UI usable without deleting traceability.

## Verification

Current retained automated acceptance: **1,940 passed / 0 failed**.

| Suite | Result |
| --- | ---: |
| Core domain/planner | 46 / 46 |
| Persistence/migration | 6 / 6 |
| UI interaction regression | 23 / 23 |
| Guided workflow / no-dead-end regression | 15 / 15 |
| 5S + Process Capability retained regression | 8 / 8 |
| Governed execution / Control Plan | 18 / 18 |
| REV 1.0.52 Build Report + Lab Performance | 14 / 14 |
| Planning/disruption scenarios | 10 / 10 |
| Role/build/workspace render stress | 1,783 / 1,783 |
| Static/mobile/package checks | 17 / 17 |

The focused REV 1.0.52 tests explicitly render a complete Build Report, verify actual CP values in the report matrix, verify CP-result de-duplication, exercise the matrix-based sample register/evidence presentation, render Lab Performance, verify all four operating pillars and functional drill-down links, and verify that closed report foldouts expand for print.

A genuine physical-device exploratory browser pass remains recommended before production deployment.
