# LabOS REV 1.0.114

Static GitHub Pages proof-of-concept for prototype laboratory operations.

## Deploy

1. Extract `ProtoLabOS_Prototype_Build_POC_v1.0.114_WEB.zip`.
2. Upload **every file from the ZIP root** to the GitHub Pages repository root, replacing the previous LabOS files.
3. Refresh the browser.
4. Confirm the header shows **REV 1.0.114**.

The runtime uses versioned JS/CSS filenames and a reset service worker so stale GitHub Pages/browser assets do not mask the update.

## REV 1.0.114 correction

The controls stage could become non-actionable for Product-Safety-relevant B/C builds. A Control Plan-specific cockpit override displayed **Control Plan approved** and returned before checking the still-pending Product Safety approval. The yellow Next Action then degraded to a generic scroll button.

REV 1.0.114 explicitly surfaces the pending Product Safety approval in both the SIGN-OFF and NEXT ACTION areas. The authorised Product Safety Representative receives a direct approval action; other roles receive a direct role switch. Once safety approval is complete, the normal explicit **Confirm controls & continue** action becomes available.

The stale wording around an earlier Control Plan approval reset is also corrected after the edited revision has already been re-approved.

## Data compatibility

IndexedDB schema remains **35**. Existing browser data is retained; no reset is required.

See `CHANGELOG_v1.0.114.md`, `QA_REPORT_v1.0.114.md`, and `VERIFICATION_v1.0.114.md`.
