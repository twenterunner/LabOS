# LabOS REV 1.0.53 · Quick Start

1. **Set up a lab** — Administrator → Configuration → **Start / continue setup**. Work through scope, customers/internal use, products, people/competencies, equipment/readiness durations, evidence, released standards and the final integrity check. If there is no historical readiness evidence to migrate, choose the clean-start option so LabOS schedules readiness before first use.
2. **Migrate existing LIMS data** — Configuration → **Import from existing LIMS**, or use the import actions inside the setup wizard. Download the relevant template, export/map your current data to the recognised columns, validate, then import. Equipment should precede calibration/maintenance; staff and competencies should precede training certificates.
3. **Create/define a build** — Select customer, product/configuration, quantity, date and engineering purpose. Use the controlled product/BOM and customer masters where applicable.
4. **Define the route** — Open the build → **Use or adapt engineering route & methods**. Reuse released process revisions where possible; guided development is used only for genuine gaps.
5. **Approve the Control Plan** — Link formal characteristics to the relevant process step and define method, specification/reaction plan and executable sampling rule.
6. **Plan resources** — AUTO-PLAN considers equipment, staff/competency, calibration, maintenance, training, material readiness, planning situations, dependencies and priority. A structural blocker opens its guided resolver; the plan retries automatically after resolution.
7. **Execute a process step** — For large quantities the execution group is folded by default. All pending samples are selected; open the foldout only to search/change the group. Enter recipe/setup controls, start the real execution group, capture the governed matrix/CSV data, then complete when required evidence exists.
8. **Review samples** — The build Sample Register is folded for large batches and searchable. Use the batch/sample matrix as the primary capture surface; individual sample records are for identity or exceptional evidence.
9. **Find genealogy** — **Serial History** supports search across sample/Lab ID/formal serial/build/product/customer/lot/process/operator/equipment and groups results in foldouts.
10. **Monitor process capability** — **Process Capability** answers whether Control Plan characteristics remain capable and consistent across builds. It shows trend, Cpk when statistically meaningful, normality p-value, specification signals and source-build evidence. Measurement entry/correction stays in the governed route-step workflow.
11. **Resource readiness** — Schedule calibration, maintenance or training with an editable duration. LabOS automatically protects affected build schedules or refuses the unresolved slot.
12. **Improvement Scan** — Only proposals LabOS can implement end-to-end are actionable. Accept means apply + verify, not “go replan manually.”

## REV 1.0.53 — daily-use changes

### Build execution
The active build workflow now carries a second sticky row for the process-route operations. Select a route operation there. Use the single guided action on the execution card to start work, record required process/Control Plan data, and complete the execution. CSV and build-specific-field tools are inside the data matrix rather than repeated on the page.

### Test families
Open **Lab Standards & Resources → Standard Test Library → Configure test families** to maintain the controlled test-family list. Each standard test is assigned to one family.

### 5S
Open **Lab Standards & Resources → 5S Workplace Control**. Configure zones and owners, tap **Run 5S check**, score Sort / Set in order / Shine / Standardize / Sustain, and record evidence. Any score below the standard creates an owner action that remains open until guided resolution evidence is recorded. REV 1.0.53 fixes the zone-button binding that could make Run 5S check appear unresponsive.

### Action Centre
The Action Centre is personal: it shows only work assigned to the signed-in user. Managers can still assess portfolio/workflow status elsewhere; build blockers remain global even when their corrective action belongs to another person.

## REV 1.0.53 — Build Report and Lab Performance

- Open a build and choose **Build Report**. The normal screen shows decision-critical summary tables. Expand measured Control Plan data, supporting process data, sample observations/photos, statistical plots and revision history only when needed. **Print / save PDF** automatically includes the folded evidence.
- For SC, CC and all other Control Plan characteristics, use **Control Plan execution & measured data**: the summary shows coverage/result and the matrix shows the actual sample-level values required by the approved sampling plan.
- Open **Management → Lab Performance** for the management cockpit. Start with **Management attention** and the four operating pillars; expand delivery, quality/cost, capacity, process or pipeline analytics when a signal needs investigation.

## REV 1.0.53 — readiness, people and material receipt

- When a readiness blocker is resolved, LabOS immediately re-evaluates that specific condition and rerenders the Build Readiness workspace. A cleared item becomes green without refresh.
- A user-selected staff replacement is retained as a controlled planning preference. AUTO-PLAN no longer selects an unavailable person when an available associated person can do the work.
- For Engineering-supplied BOM material, **Quantity received** defaults to the still-needed amount. Enter more to retain the excess as available buffer stock; enter less to create a visible material-output limit. Sample creation is capped at the material-supported output until the shortage is removed.
- Process-data popups use viewport-safe sizing. Long Control Plan/method detail stays outside the matrix header; sample number, Lab Sample ID and formal serial are displayed on separate lines.
