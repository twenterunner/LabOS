# LabOS REV 1.0.174 — Management Demo hub / resilient showcase upgrade QA

**Release:** `ProtoLabOS_Prototype_Build_POC_v1.0.174_WEB.zip`  
**Runtime:** `ProtoLab.VERSION = 1.0.174-poc`

## Fix implemented

REV 1.0.173 seeded the Management Demo records but rendered the launcher only when `demoShowcaseProjectsV173` already existed, and appended it at the bottom of Help. REV 1.0.174 changes that behavior:

- **Management Demo · Showcase projects** is a permanent card at the **top of Help**.
- The card is rendered even when showcase data has not yet initialized.
- Existing/evolved demo browser data is recognized using both the canonical demo marker and known seed signatures.
- On startup and every Help visit, `ensureDemoShowcaseV174()` reconciles the additive showcase dataset.
- A visible **Prepare / Refresh / repair showcase** action can explicitly repair the demo data without Reset Demo Data.
- The launcher reports **N/11 ready** and identifies any missing showcase IDs instead of silently disappearing.
- Direct **Open Prototype** / **Open Validation** actions remain available for every prepared showcase project.
- The bundled management demo guide is linked directly from the Help card.

## Showcase records

`P26-1101`, `P26-1102`, `P26-1103`, `P26-1104`, `V26-0103`, `V26-0104`, `P26-1004`, `P26-1015`, `P26-1018`, `P26-1019`, `P26-1023`.

## Release gates

- JavaScript syntax: PASS.
- Runtime/index/manifest/version filenames aligned to REV 1.0.174: PASS.
- `labos-version.json` reports `1.0.174` / `1.0.174-poc`: PASS.
- Management Demo Help hub static contract: PASS.
- V174 reconciliation function and explicit repair action present: PASS.
- Executable demo-model fixture: fresh demo = **11/11 ready**; deliberately damaged old showcase marker repaired to **11/11 ready** with no Reset Demo Data: PASS.
- ZIP extraction/integrity: PASS.

## Browser test note

The release is syntax/static/model checked. A fresh Chromium HTTP navigation smoke was attempted, but Chromium did not complete navigation within the execution timeout in this environment; this report therefore does **not** claim a rendered-browser pass. A final phone/desktop smoke after deployment remains appropriate.
