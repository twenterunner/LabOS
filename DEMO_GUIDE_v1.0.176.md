# LabOS REV 1.0.176 — Management Demo Guide

This guide is for the seeded **demo dataset only**. The evidence photographs are synthetic LabOS demo images so the evidence/report workflow can be demonstrated without presenting them as real product photographs.

## Recommended 10–15 minute walkthrough

1. **Dashboard / My Work** — show role-aware work, current actions, blockers and the yellow next-action language.
2. **Requests** — show the common front door for Prototype and Validation requests and the flow-down from engineering intent to controlled work.
3. **Planning** — show one constrained portfolio across Prototype + Validation, the All / Prototype / Validation filter, site/lab selection, people/equipment constraints and network/sister-lab options.
4. **P26-1101 → Build Report** — 40-part clean normal distribution; show histogram, normality result, specification/mean context, sample genealogy and photo evidence.
5. **P26-1102 → Build Report** — normal process core with one deliberate statistical flier while the measurement remains inside the engineering specification; use this to distinguish an anomaly signal from a product nonconformance.
6. **P26-1103 → Build Report** — bimodal non-normal population with no isolated IQR flier; use this to explain why distribution shape matters, not only outlier rules.
7. **P26-1104 → Build / Quality** — skewed non-normal population with a deliberate high flier outside specification; show the controlled nonconformance/release hold and the fact that LabOS does not hide the failed point.
8. **P26-1015** — complete Prototype dossier: Control Plan, serial genealogy, execution evidence, photographs, closed deviation and approved Build Report.
9. **V26-0103** — linked Prototype→Validation digital thread: inherited DUT/serial identities, Test Legs, per-test sample allocation, results, test photographs and Validation Report. Show the explicit Prototype dependency timing/replan audit history.
10. **V26-0104** — sister-lab Validation: standalone DUT register, Validation Test Flow, shared constrained planning at the sister lab, results/photos and controlled report.
11. **Resource Assurance / Planning** — use `P26-1018` for engineering-supplied material timing, `P26-1019` for calibration recovery, and `P26-1023` for a specialist test that can be routed to the Stuttgart sister lab.
12. **Reports / Lessons Learned / Audit** — show controlled reports, product lessons learned, audit trail and retained evidence provenance.

## Statistical showcase expectations

| Project | Population | Expected report signal | Purpose |
|---|---:|---|---|
| P26-1101 | 40 | Normality p ≈ 0.784; no IQR outliers; all in spec | Clean normal reference |
| P26-1102 | 40 | Deliberate 6.2 V flier; IQR outlier; no spec failure; normality test becomes sensitive to the flier | Outlier ≠ automatically nonconforming product |
| P26-1103 | 40 | Bimodal; normality p ≈ 0.0176; no IQR outliers | Non-normality can exist without a single obvious flier |
| P26-1104 | 40 | Strongly non-normal; one high IQR outlier; one out-of-spec result; quality hold | Statistical + quality-control workflow |

## Additional demo scenarios already in the dataset

| Project | Showcase |
|---|---|
| P26-1002 | Material shortage and replenishment/reservation path |
| P26-1003 | Calibration readiness inside the planning window |
| P26-1004 | Product-safety / Control Plan approval path |
| P26-1005 | Lab closure and constrained recovery/network comparison |
| P26-1006 | Staff absence |
| P26-1007 | Equipment outage with future feasible recovery |
| P26-1010 | Skill-training / competency readiness |
| P26-1011 | Released-route reuse with controlled build-specific delta |
| P26-1013 | Equipment maintenance readiness |
| P26-1014 | Shared-equipment congestion |
| P26-1015 | Complete dossier + sister-lab-capable test + photos/deviation/report |
| P26-1018 | Engineering-supplied material delay / earliest start boundary |
| P26-1019 | Calibration recovery |
| P26-1020 | Staff absence with alternate-person/training path |
| P26-1021 | Optical-equipment outage |
| P26-1022 | Priority vs constrained capacity |
| P26-1023 | Specialist single-test sister-lab capability |
| P26-1024 | Long-horizon production-intent workload |

## Pitch-oriented capability map

- **One digital thread from request to evidence:** engineering request → process/test definition → samples/serials → planning → execution → quality → report → lessons learned.
- **Prototype + Validation on one platform:** shared shell, resources, planning vocabulary, audit history and reporting framework rather than two disconnected applications.
- **Guided workflow:** role-aware actions, sticky next-step cockpit, blockers with resolution paths and controlled approvals.
- **Reusable standards with controlled development:** released Process and Standard Test libraries; new/adapted method development only when needed; historical actuals feed future development estimates.
- **Exact sample/serial genealogy:** physical samples are defined first and then follow Prototype or Validation flows; Validation can inherit DUTs directly from a linked Prototype.
- **Visual Validation Test Flow:** sequential and parallel Test Legs, splits/merges and sample allocation with the same flow included in the Validation Report.
- **Controlled evidence capture:** numeric/text/categorical results, evidence references and photos tied to the exact test and optionally the exact DUT/serial.
- **Shared constrained planning:** equipment, staff/competence, calibration, maintenance, closures, availability, priorities and site capacity are considered together; planning supports local recovery, sister labs and external alternatives.
- **Multi-lab operation:** active-site filtering, independent lab resources and sister-lab routing without losing ownership/traceability.
- **Prototype→Validation timing dependency:** a Prototype delay updates the linked Validation DUT boundary and can trigger constrained replanning; success/failure and before/after timing are explicitly audited.
- **Resource Assurance:** calibration, maintenance and competency/training readiness, individual or 30/60/90-day call-ups, schedule change/cancel and retained evidence.
- **Control Plan / quality governance:** controlled characteristics, measurement evidence, deviations/nonconformances, release holds, dispositions and sign-off paths.
- **Engineering-grade reports:** Prototype Build Reports and Validation Reports include part/programme identity, serial traceability, acceptance criteria, technical records, graphs/distributions, photographic evidence and controlled report status.
- **Statistical interpretation:** larger Prototype datasets demonstrate histograms, specification context, normality and outlier signals. Small datasets remain descriptive rather than claiming unsupported capability.
- **Lessons learned / prevention:** completed work creates reusable learning; similar future work surfaces relevant prevention controls and historical development performance.
- **KPI framework:** shared management KPI infrastructure with Prototype and Validation-specific metrics, period/lab/domain filtering and management graphs. (The formal KPI definitions are broader than the six showcase projects.)
- **Auditability:** common audit trail records decisions and controlled changes; REV 1.0.176 adds explicit linked-Prototype dependency/replan success/failure history rather than only overwriting the current state.
- **Mobile-ready static POC:** deployable to GitHub Pages with IndexedDB persistence, JSON import/export and no end-user npm/backend requirement for the prototype.

## Important scope statement for the pitch

LabOS is still a **static-browser proof of concept**, not a production multi-user LIMS. Production deployment would require governed backend storage, real authentication/authorization, concurrency/transactions, server-side immutable audit/evidence controls, backup/retention and validated integrations. The demo shows the operating model and UX value rather than claiming production-system compliance by itself.

## Validation report showcase in REV 1.0.176

For the strongest report demo, open `V26-0103` or `V26-0104` and choose **Preview full report**. Point out:

1. the overall visual Test Flow and separate Test Legs;
2. the controlled DUT/serial register;
3. one technical dossier per test;
4. test description + method/revision + setup/procedure;
5. acceptance criteria and conformity decision rule;
6. the prominent Test setup photograph and any additional evidence photographs;
7. DUT-level measurements/observations and numeric plot where applicable;
8. test conditions, uncertainty/validity statement where applicable, and explicit conclusion;
9. report approval/readiness and evidence fingerprint.

The demo photographs and uncertainty text are synthetic and clearly intended only to demonstrate the controlled evidence workflow.
