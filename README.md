# LabOS REV 1.0.101 — startup hotfix

REV 1.0.101 repairs the REV 1.0.100 startup regression while preserving the REV 1.0.100 multi-lab/planning changes and the REV 1.0.98 protected functional baseline.

## Deploy to GitHub Pages
1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.101_WEB.zip`.
2. Upload **all files from the ZIP root** to the repository root, replacing files with the same names where applicable.
3. Do not upload the ZIP itself as the website.
4. Refresh the GitHub Pages site. If Android Chrome still has the old page open, close that tab and reopen the site once.
5. Confirm the header shows **REV 1.0.101**.

The package deliberately uses new REV 1.0.101 runtime filenames and the deployment-reset worker clears legacy LabOS caches, preventing the broken REV 1.0.100 JavaScript asset from being reused.

## What was fixed
REV 1.0.100 referenced `enablePlanningDragV1065` at top level but the function body had accidentally been removed. That caused an immediate `ReferenceError` before LabOS could initialize. REV 1.0.101 restores that implementation plus the adjacent compatibility block removed in the same edit. See `HOTFIX_ROOT_CAUSE_v1.0.101.md`.

## What remains from REV 1.0.100
- Demo work is distributed across all internal labs.
- Several demo projects span multiple months.
- Selected Twente demo builds are intentionally late so sister-lab recovery can be exercised.
- Planning waterfall controls include **← · − · Fit · + · →**.
- Required-delivery red lines and commitment health use one exact 17:00 deadline definition and the exact final canonical booking end.
- Sister-lab planning remains site-isolated and controlled.

## Verification
`VERIFICATION_v1.0.101.md` and `VERIFICATION_HOTFIX_v1.0.101.json` contain the targeted hotfix evidence. `VERIFICATION_BASELINE_v1.0.100.json` is retained as the prior data/planning verification evidence; it is intentionally not presented as proof of browser startup because that earlier verification did not evaluate top-level runtime references.
