# LabOS REV 1.0.59 · Quick Start

1. **Set up a lab** — Administrator → Configuration → **Start / continue setup**. Work through scope, customers/internal use, products, people/competencies, equipment/readiness durations, evidence, released standards and the final integrity check. If there is no historical readiness evidence to migrate, choose the clean-start option so LabOS schedules readiness before first use.
2. **Migrate existing LIMS data** — Configuration → **Import from existing LIMS**, or use the import actions inside the setup wizard. Download the relevant template, export/map your current data to the recognised columns, validate, then import. Equipment should precede calibration/maintenance; staff and competencies should precede training certificates.
3. **Create/define a build** — Select customer, product/configuration, quantity, date and engineering purpose. Use the controlled product/BOM and customer masters where applicable.
4. **Define the route** — Open the build → **Use or adapt engineering route & methods**. Reuse released process revisions where possible; guided development is used only for genuine gaps.
5. **Approve the Control Plan** — Link formal characteristics to the relevant process step and define method, specification/reaction plan and executable sampling rule.
6. **Plan resources** — AUTO-PLAN considers equipment, staff/competency, calibration, maintenance, training, material readiness, planning situations, dependencies and priority. A structural blocker opens its guided resolver; the plan retries automatically after resolution.
7. **Execute a process step** — For large quantities the execution group is folded by default. All pending samples are selected; open the foldout only to search/change the group. Enter recipe/setup controls, start the real execution group, capture the governed matrix/CSV data, then complete when required evidence exists.
8. **Review samples** — The build Sample Register is folded for large batches and searchable. Use the batch/sample matrix as the primary capture surface; individual sample records are for identity or exceptional evidence.
9. **Find genealogy** — **Serial History** supports search across sample/Lab ID/formal serial/build/product/customer/lot/process/operator/equipment and groups results in foldouts.
10. **Review measurement-system evidence** — open **Quality → MSA / Gage R&R**. Upload an existing MSA or run a guided Gage R&R; link the study to its process/test and gage, retain the study date and submit it for formal review.
11. **Resource readiness** — Schedule calibration, maintenance or training with an editable duration. LabOS automatically protects affected build schedules or refuses the unresolved slot.
12. **Improvement Scan** — Only proposals LabOS can implement end-to-end are actionable. Accept means apply + verify, not “go replan manually.”





## REV 1.0.61 — resolve engineering clarifications without hunting

When Action Centre shows a clarification blocker, press **Resolve**. The modal now displays the blocker cause, the exact field/evidence needed, the current owner and the next owner. For a programming/calibration interface blocker, enter the interface definition directly in the Resolve modal, save it, then run **Reassess feasibility now**. LabOS closes that clarification and opens the next real material, process/method or planning step.


## REV 1.0.59 — Gage R&R, 5S KPIs and blocker resolution

- **Gage R&R:** Quality → MSA / Gage R&R now separates the LabOS recommendation from the authorised reviewer's final decision. Typical automotive defaults are shown in the workflow; customer-specific requirements and intended use still govern. A recommendation can be overridden only with retained rationale.
- **5S management KPI:** Management → Lab Performance now includes 5S current condition and a selectable-period trend based only on recorded 5S audits. Drill into pillar and zone performance and open corrective actions from the same cockpit.
- **Calibration blockers:** From Audit Readiness, a calibration finding now opens a concrete path: schedule calibration → record the certificate → obtain required certificate approval → recheck. Scheduling alone does not make the finding green.
- **Audit evidence PDF:** Evidence-pack rows, certificate links, tables and print layout are mobile-safe and print as a clean evidence pack.
- **Release sign-off:** Signer actions use the exact pending approval records shown on screen, preventing the stale “Signer package is no longer available” path seen after tapping a visible signer.

## REV 1.0.58 — approval packages

Do not hunt through individual approval records. Open the sign-off package shown in the workflow or Next Action strip. LabOS shows the required signer(s), their role, what each sign-off covers, and progress. One person signs once for related items in the same decision package; genuinely independent roles remain separate signatures.


## REV 1.0.57 — key workflow changes

Use **Quality → MSA / Gage R&R** before relying on capability conclusions. Process and equipment setup now carry governed EHS / commissioning evidence; in-house calibration can define a controlled calibration procedure; calibration certificates require formal approval before readiness. Build/process blockers now open a guided resolution path. Administrators retain an explicit audited exception path where normal completion is impossible. Process execution supports approved step skips. Long workspaces expose sticky section-jump navigation, and build Lessons can be added manually or reviewed from automated proposals, including retrospectively.

## REV 1.0.55 — menu and capability workflow

- Use **Requests** as the shared front door. **Prototype** is operational today; **Validation** and **Failure Analysis** are visible as future workstreams so the framework can grow without changing the platform architecture later.
- **Validation** shows the intended requirement → validation plan → test legs/DUTs → constrained plan → execution → results → requirement verification thread, plus controlled test-method development for genuine gaps.
- **Failure Analysis** shows the intended failure intake → triage/containment → evidence/hypothesis → analysis → root cause → corrective action → verification/retest → learning thread.
- Use **Quality → MSA / Gage R&R** for controlled measurement-system evidence.
- If Build Readiness says **Processes released**, the check now resolves the exact process revision recorded on each route step. A later library draft does not invalidate the older released revision. A genuine mismatch names the affected route step and revision.

## REV 1.0.54 — hard setup, learning and commitment decisions

- In **Lab Setup**, a green tick means the setup area was explicitly reviewed and completed. Data merely existing in the database is not enough. **Save & continue** is blocked until the minimum information for the current area is present, and later setup steps stay locked. Missing calibration/maintenance durations can be filled directly in the Equipment setup step.
- In a build, later guided workflow steps remain locked until the current required step is genuinely complete.
- At **Engineering handover & close → Lessons & Learning**, LabOS automatically proposes evidence-based lessons from quality/yield exceptions, timing churn, material shortages, process-time overruns, failed Control Plan measurements and method development. Accept or reject every proposal with a required rationale. Accepted lessons become retained learning and appear in the Build Report.
- In **Visual Resource Planning**, **Commitment decisions** means the latest feasible forecast differs from the date currently promised. Tap the metric, review current commitment → proposed forecast and reason, then explicitly keep or change the commitment.
- In the Build Report, **11 of 12 operations** means execution evidence exists for 11 of the 12 required route operations for that sample. **Not linked to current BOM** means a historical/migrated material issue is retained for traceability but does not satisfy any requirement in the build's current BOM.

## REV 1.0.54 — daily-use changes

### Build execution
The active build workflow now carries a second sticky row for the process-route operations. Select a route operation there. Use the single guided action on the execution card to start work, record required process/Control Plan data, and complete the execution. CSV and build-specific-field tools are inside the data matrix rather than repeated on the page.

### Test families
Open **Lab Standards & Resources → Standard Test Library → Configure test families** to maintain the controlled test-family list. Each standard test is assigned to one family.

### 5S
Open **Lab Standards & Resources → 5S Workplace Control**. Configure zones and owners, tap **Run 5S check**, score Sort / Set in order / Shine / Standardize / Sustain, and record evidence. Any score below the standard creates an owner action that remains open until guided resolution evidence is recorded. REV 1.0.54 fixes the zone-button binding that could make Run 5S check appear unresponsive.

### Action Centre
The Action Centre is personal: it shows only work assigned to the signed-in user. Managers can still assess portfolio/workflow status elsewhere; build blockers remain global even when their corrective action belongs to another person.

## REV 1.0.54 — Build Report and Lab Performance

- Open a build and choose **Build Report**. The normal screen shows decision-critical summary tables. Expand measured Control Plan data, supporting process data, sample observations/photos, statistical plots and revision history only when needed. **Print / save PDF** automatically includes the folded evidence.
- For SC, CC and all other Control Plan characteristics, use **Control Plan execution & measured data**: the summary shows coverage/result and the matrix shows the actual sample-level values required by the approved sampling plan.
- Open **Management → Lab Performance** for the management cockpit. Start with **Management attention** and the five operating pillars; expand delivery, quality/cost, capacity, process or pipeline analytics when a signal needs investigation.

## REV 1.0.54 — readiness, people and material receipt

- When a readiness blocker is resolved, LabOS immediately re-evaluates that specific condition and rerenders the Build Readiness workspace. A cleared item becomes green without refresh.
- A user-selected staff replacement is retained as a controlled planning preference. AUTO-PLAN no longer selects an unavailable person when an available associated person can do the work.
- For Engineering-supplied BOM material, **Quantity received** defaults to the still-needed amount. Enter more to retain the excess as available buffer stock; enter less to create a visible material-output limit. Sample creation is capped at the material-supported output until the shortage is removed.
- Process-data popups use viewport-safe sizing. Long Control Plan/method detail stays outside the matrix header; sample number, Lab Sample ID and formal serial are displayed on separate lines.
