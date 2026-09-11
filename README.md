# LabOS REV 1.0.98 — GitHub Pages deployment

This ZIP is deliberately a **flat GitHub Pages deployment package**.

## Deploy

1. Extract the ZIP.
2. Upload the **contents of the extracted folder** to the root of the GitHub Pages repository. `index.html` must be at repository root.
3. Commit the files and allow GitHub Pages to publish.
4. Open the site. The header must show **REV 1.0.98** and the dashboard should render immediately.

The release uses revision-specific runtime filenames, so old REV 1.0.96 JS/CSS files can remain in the repository without being used. They may be deleted later.

If deployment is incomplete, the app now shows the exact missing runtime file instead of presenting a blank page.

See `ROOT_CAUSE_PROOF_v1.0.98.md` and `VERIFICATION_v1.0.98.md`.
