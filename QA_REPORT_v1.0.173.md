# LabOS REV 1.0.173 — Dependency-audit + Management Demo QA Report

**Release:** `ProtoLabOS_Prototype_Build_POC_v1.0.173_WEB.zip`  
**Runtime:** `ProtoLab.VERSION = 1.0.173-poc`  
**Schema:** `38` (unchanged; no Reset Demo Data required)

## Release scope

REV 1.0.173 combines two changes:

1. **Prototype-linked Validation dependency audit hardening** — linked timing movements, successful automatic constrained replans and failed/recovery replans now retain explicit before/after audit history.
2. **Management-demo portfolio** — the demo dataset gains deliberate large-sample statistical Prototype builds plus presentation-ready Prototype/Validation photographic evidence and a Help-page showcase launcher.

## Prototype statistical showcase

All four statistical builds contain **40 physical samples**, **40 controlled numeric Output-voltage measurements**, formal sample identities and **6 representative controlled photographs** per build. Forty observations intentionally triggers the report histogram/distribution path.

| Project | Intended pattern | Normality p (AD approximation) | IQR outliers | Spec failures | Status |
|---|---|---:|---:|---:|---|
| `P26-1101` | Normal · no flier | 0.784083 | 0 | 0 | CLOSED |
| `P26-1102` | Normal process core + one flier | 0.0323673 | 1 (`6.2 V`) | 0 | CLOSED |
| `P26-1103` | Bimodal / non-normal · no isolated flier | 0.0175546 | 0 | 0 | CLOSED |
| `P26-1104` | Skewed / non-normal + high flier | 0.00000176789 | 1 (`6.1 V`) | 1 | RELEASE APPROVAL / quality hold |

`P26-1102` deliberately demonstrates that a statistical flier can remain **inside the engineering specification**. The flier makes the full 40-point normality test sensitive/non-normal at α=0.05; the report should therefore not misleadingly label the entire observed set as clean normal data.

`P26-1104` includes a controlled nonconformance and release hold so the management demo can move from a statistical signal into the quality-governance workflow.

## Validation showcase

- `V26-0103` — linked Prototype → Validation genealogy. Seeded with **6 inherited Prototype DUT/sample identities**, **4 completed Validation tests**, sample-linked results, **4 controlled test photographs**, a 4-leg report Test Flow, and explicit seeded Prototype-dependency / automatic-replan audit evidence.
- `V26-0104` — sister-lab Validation. Seeded with **10 standalone Validation DUT identities**, **4 completed tests**, **4 report photographs**, a 4-leg Test Flow and a committed constrained plan executing at `LAB-US`. In the executable fixture the programme has **5 active Validation bookings** at `LAB-US`.

Photo evidence is synthetic and visibly marked **LABOS DEMO EVIDENCE**. It exists only to demonstrate controlled photo capture, sample/test linkage and report presentation; it is not presented as real product photography.

## Management Demo launcher

Help → **Management Demo · REV 1.0.173 → Showcase projects** exposes 11 direct presentation records:

`P26-1101`, `P26-1102`, `P26-1103`, `P26-1104`, `V26-0103`, `V26-0104`, `P26-1004`, `P26-1015`, `P26-1018`, `P26-1019`, `P26-1023`.

A separate `DEMO_GUIDE_v1.0.173.md` is included with a recommended 10–15 minute walkthrough and pitch-oriented capability map.

## Existing-demo upgrade / idempotence

A real REV 1.0.172 demo state was exported and then upgraded through `ensureDemoShowcaseV173()`:

- Prototype requests: **24 → 28** (the four new statistical builds only);
- first upgrade: `changed = true`, six records prepared/enriched (4 Prototype + 2 Validation);
- second upgrade call: `changed = false`, reason `already-current`;
- `demoShowcaseV173 = 1.0.173`;
- global `validateInvariants`: **0 issues**.

The boot reconciliation path calls `ensureDemoShowcaseV173()` for existing browser-local demo data, so Reset Demo Data is not required.

## Prototype-linked Validation audit regression

### Successful movement / replan

Executable fixture PASS:

- linked Prototype timing movement updates the Validation DUT-availability boundary;
- writes **Prototype dependency timing changed** with old/new boundary, previous Validation forecast and booking count;
- when an accepted Validation plan exists, automatic constrained replanning runs from the new boundary;
- writes **Prototype-linked Validation auto-replan completed** with before/after forecast and booking evidence;
- dependency history is retained in `validationDependencyHistoryV173` rather than only overwriting `prototypeImpact`;
- planning audit wording distinguishes replanning from first planning.

### Injected no-feasible-slot failure

Executable fault-injection PASS:

- automatic replan failure does **not** delete/overwrite the prior committed plan;
- writes **Prototype-linked Validation auto-replan failed**;
- records the failure reason and recovery-required state;
- creates a **High** severity `Recover Prototype-linked Validation plan` action.

## Static / executable gates

PASS:

- `node --check` for every packaged `labos-*.js` file;
- demo showcase seed test;
- statistical-distribution assertions for all four 40-part builds;
- REV 1.0.172 → REV 1.0.173 additive migration/idempotence test;
- linked dependency successful-replan regression;
- injected replan-failure/recovery regression;
- `validateInvariants` = **0** for the final demo fixture;
- `labos-version.json` parses and reports `1.0.173` / `1.0.173-poc`;
- manifest start URL and index asset references use REV `1.0.173`.

## Browser-rendering limitation

A fresh headless Chromium navigation was attempted during development but the execution environment did not complete page navigation (zygote/DBus/headless timeout). This QA report therefore **does not claim a fresh rendered-browser interaction pass** for REV 1.0.173. The release is backed by the static and executable-model gates above; a final phone/laptop smoke after GitHub Pages deployment remains appropriate before the presentation.

## POC boundary

LabOS remains a static-browser proof of concept using local IndexedDB persistence. A production multi-user deployment still needs governed backend storage, real authentication/authorization, concurrency/transaction controls, immutable/server-side audit and evidence controls, backup/retention and validated integrations. Demo data and demo photographs are illustrative only.
