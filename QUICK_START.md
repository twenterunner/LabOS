# ProtoLab OS — Quick Start

## 1. Start with the role switcher

Use **Demo role** in the top-right corner. Try these roles first:

- **Engineering Requester** — create a simple prototype request.
- **Prototype Lab Coordinator / Planner** — triage, plan and resolve readiness issues.
- **Process Engineer** — inspect process fit and development workflows.
- **Prototype Technician** — execute the digital traveller.
- **Quality Engineer** — review Control Plans and deviations.
- **Lab Manager** — review management KPIs and controlled overrides.
- **Auditor / Read-only** — navigate evidence without operational actions.

## 2. Open seeded request scenarios

Go to **Prototype Requests**. Useful demo cases include:

- `P26-0042` — straightforward build using released processes.
- `P26-0043` — laser-weld geometry needing process development.
- `P26-0044` — process adaptation / Control Plan revision.
- `P26-0045` — missing material delaying the build.
- `P26-0046` — equipment conflict scenario.
- `P26-0047` — technician substitution scenario.
- `P26-0048` — calibration conflict.
- `P26-0049` — special characteristic missing a suitable control.
- `P26-0050` — characterisation failure / quality hold.
- `P26-0051` — controlled deviation accepted.
- `P26-0052` — rework followed by reinspection.
- `P26-0053` — product-safety approval pending.
- `P26-0054` — engineering configuration change after submission.
- `P26-0055` — delivered and traceable build.

## 3. Follow the guided request checklist

Every request now uses **one vertical, tappable checklist** instead of a horizontal module menu. Follow it from top to bottom. Each row shows:

- completion / action-required state
- responsible owner and role
- the exact next action
- a tap target that opens the controlled detail for that step

The checklist walks through request definition → triage → materials → process route/development → PFMEA/risk → Control Plan → equipment/competency → readiness → execution → characterisation → quality → release → delivery → records/lessons.

For the demo, when the next action belongs to another role, the detail view can offer a **Demo: switch to …** shortcut.

## 4. Test a blocker

Open `P26-0049`, then tap **Create & independently approve Control Plan** in the guided checklist. The readiness review explains:

- what is missing
- why it matters
- who owns resolution
- action required
- evidence required
- what happens next

## 5. Test AUTO-PLAN

As **Prototype Lab Coordinator / Planner**, open a request, tap the relevant **Lab triage, feasibility & forecast** or **Define visual process route** checklist item, then choose **AUTO-PLAN**. The local planner assigns valid equipment and qualified available staff and updates the forecast.

## 6. Test controlled execution

Switch to **Prototype Technician**, open a build in progress and tap **Serialise & execute digital traveller**. Mandatory evidence is required. New/modified unreleased processes and invalid calibrated equipment are guarded.

## 7. Test quality disposition

Switch to **Quality Engineer**, open `P26-0050` and tap **Disposition exceptions & complete quality review**. Open the disposition workflow. A release hold cannot be cleared until mandatory verification is complete.

## 8. Generate a report

Open a mature request → **Documents** → **Generate build report**, or use the global **Reports** page. Draft reports are clearly marked:

`AUTO-GENERATED · NOT APPROVED`

Use the browser print dialog to save a PDF if desired.

## 9. Export/import/reset data

Switch to **Administrator** → **Configuration & data**.

- Export JSON for a local backup.
- Import a compatible export.
- Reset Demo Data to restore the seeded demonstration state.
