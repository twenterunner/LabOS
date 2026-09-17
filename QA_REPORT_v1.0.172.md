# LabOS REV 1.0.172 — Validation Test Flow + photographic evidence QA

**Release:** `ProtoLabOS_Prototype_Build_POC_v1.0.172_WEB.zip`  
**Visible/runtime revision:** `REV 1.0.172` / `1.0.172-poc`  
**Schema:** `38` — no reset required

## Scope implemented

REV 1.0.172 extends the controlled Validation reporting path in two areas:

1. **Test-flow evidence in the Validation Report.** The report now snapshots and renders the released Validation Test Flow: independent Test Legs, sequential activities, DUT/sample splits, nested branches and merge/rejoin points. The diagram is derived from the same `validationFlowV164` structure used by programme construction; it is not a manually redrawn report-only flow.
2. **Photographic evidence per Validation test.** Validation result entry now accepts up to 8 photos per test. On supported mobile browsers the user can invoke the camera or choose existing images. Images are resized to max 1600 px and JPEG-compressed before browser-local persistence. Each photo retains caption/observation, uploader/time, optional DUT/sample link and an explicit `Include in Validation Report` decision.

Completed tests remain reopenable with **Result / photos**, so controlled photographs can be added or reviewed after the original Pass/Fail entry.

## Controlled evidence behaviour

- Photo binaries are stored in the common `validationEvidence` collection as `type: Test photo` records.
- Validation results retain `photoEvidenceIds`; the photo is therefore tied to programme + test and optionally exact DUT/sample/serial.
- Replacing metadata or adding/removing photos creates/references controlled evidence rather than silently altering a report-only image.
- The Validation evidence fingerprint now includes both the Test Flow structure and referenced photographic evidence. Changing either after an approved report invalidates approval and requires controlled re-review.
- Persisted report revisions retain the Test Flow and photo evidence IDs/metadata, while image base64 is kept once in the controlled Validation evidence store to avoid multiplying image payloads into every historical report revision.

## Report presentation

The full Validation Test Report now adds a dedicated **Validation Test Flow** section after product/sample identity. Each Test Leg shows the released sequence, result state and assigned DUT count; splits render branch allocations and merge/rejoin points. Report section numbering is recalculated after insertion.

Included photos render beneath the exact Validation test to which they belong, with caption, observation, optional DUT/serial identity, uploader and timestamp. Print/PDF CSS keeps photo cards and flow nodes together where possible.

## Executable model regression

A Node-executed populated LabOS demo state was used to exercise the final core runtime:

- runtime version: `1.0.172-poc`;
- Validation programme model seeded successfully;
- controlled Test Flow present with multiple Test Legs;
- photo evidence linked to a Validation result;
- generated Validation Report contained the Test Flow snapshot and included photo evidence;
- changing photo metadata changed the Validation evidence fingerprint;
- persisted report revision retained Test Flow and photo metadata while not duplicating the image binary.

Result: **PASS**.

## Static release gates

- `node --check` passes for every packaged JavaScript file.
- `manifest.webmanifest` and `labos-version.json` parse as valid JSON.
- all local assets referenced from `index.html` exist.
- `index.html`, runtime constant, visible badge, version handshake, manifest start URL, update page and service-worker fallback identify REV 1.0.172.
- source-level checks confirm the camera/file inputs, per-photo report-inclusion control, DUT/sample selector, Test Flow report renderer and report photo gallery are in the packaged application.

## Browser-environment limitation

A headless Chromium navigation smoke was attempted against a local HTTP server. Chromium did not complete before the environment timeout, so this QA report does **not** claim a rendered browser-interaction pass. The executable core/data regression and final packaged static/runtime checks are reported separately above.
