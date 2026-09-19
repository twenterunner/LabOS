# Stage 3 Build Identification — Test 9

Product revision remains `1.0.185`.

Controlled checkpoint: `STAGE3-GITHUB-TEST-9`

Visible browser badge: `REV 1.0.185 · S3 TEST-9`

Startup message: `Starting LabOS REV 1.0.185 · STAGE 3 TEST-9…`

All production JavaScript and CSS startup URLs carry `?build=STAGE3-GITHUB-TEST-9`. The Stage-2 planning worker is also loaded with the same controlled-build key through `window.__LABOS_EXPECTED_BUILD__`/`globalThis.__LABOS_EXPECTED_BUILD__`.

`qa/stage3-build-identification-tests.js`: **11/11 PASS**.
