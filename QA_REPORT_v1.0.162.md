# LabOS REV 1.0.162 — Unified Visual Programme Builder QA Report

**Release:** `ProtoLabOS_Prototype_Build_POC_v1.0.162_WEB.zip`  
**Implementation baseline:** REV 1.0.161, whose common runtime/shared Programme Logic architecture was retained  
**Schema:** 38 (unchanged)  
**Runtime:** `ProtoLab.VERSION = 1.0.162-poc`

## 1. Release objective

REV 1.0.162 replaces the previous lane-oriented editor with one reusable visual Programme Builder for both Prototype Build and Validation Programme construction. Prototype and Validation use the same builder shell, interaction handlers, structured programme model, history engine, validation engine and canvas rendering. Domain adapters supply process/test/requirement-specific behavior; there is no second Validation canvas engine.

The construction canvas describes **what** must happen. The existing constrained LabOS planning/resource model continues to determine **when and where** it can happen.

## 2. Implemented builder contract

The shared builder provides:

- left activity/test/process library;
- central structured programme canvas;
- right selected-activity properties;
- top toolbar with Undo, Redo, Zoom −, Zoom +, Fit, Auto-layout, Search/Jump, continuous programme health, Check feasibility and Save;
- insertion drop zones and empty-canvas first-step affordance;
- drag/drop reorder, inter-leg movement and parallel-leg creation;
- split/merge reconstruction without requiring manual connector drawing;
- named/collapsible legs, leg movement and controlled leg deletion;
- multi-select, duplicate, delete, copy/paste and context actions;
- visual DUT/sample allocation with fixed quantity, percentage, same-DUT continuation, destructive-test and retained-sample semantics;
- Validation requirement drag/drop with closest released Standard Test ranking and controlled test-development fallback;
- activity/test replacement while retaining compatible trace links and showing coverage impact;
- reusable Prototype and Validation subflow templates;
- Structure / Requirements / Resources / Planning / Execution overlays without changing programme geometry;
- minimap only for larger programmes;
- mobile fallback movement controls so precision drag/drop is not mandatory;
- Draft / Under Review / Released / Superseded state visibility and controlled structural revision handling.

## 3. Persistence and migration

PASS.

- Existing Prototype routes migrate into `programmeStructuresV162` while retaining native route-step IDs.
- Existing Validation legs/activities migrate while retaining programme, leg, activity, requirement and predecessor identities.
- The shared structure synchronises back into the existing native Prototype/Validation records used by planning and execution.
- Repository load now normalises the V162 programme model; first canvas render is not required to trigger migration.
- Existing booking, execution, results, audit and requirement records are not reset.
- Schema remains 38; no data reset is required.
- A synchronization regression was specifically fixed so a just-dropped visual activity cannot be overwritten by legacy/native migration during the same save cycle.

## 4. Core model / fault-injection suite

**55 / 55 checks PASS.**

The suite covers:

- runtime version and schema;
- migration/invariants for all populated Prototype and Validation programmes;
- visual add → native sync → ensure/reload-shaped persistence;
- exact acceptance-style flow: Start → Preparation → three-way Thermal Cycling / Vibration / Salt Spray → merge → Functional Test → Final Inspection;
- 30 DUT allocation as 10 / 10 / 10;
- two-way, three-way and nested split structures;
- split and merge dependency reconstruction;
- DUT/sample over-allocation protection;
- destructive-branch downstream-reuse protection;
- same-DUT continuation;
- retained quantity semantics;
- move between legs;
- delete/duplicate/reorder model operations;
- requirement ranking and test-development insertion/linking;
- sister-lab and external activities;
- dependency-loop rejection;
- orphan/floating-activity invariant checking;
- Validation controlled revision handling;
- Prototype controlled revision handling;
- persistence-shaped deep-clone round trip;
- large-structure stress fixture with **125 activities / 22 lanes**.

The large-structure core operations completed in **4 ms** in the final rerun environment. This timing is an implementation smoke measurement, not a cross-device performance guarantee.

## 5. Rendered browser interaction suite

A fresh application payload was injected into a real headless Chromium DOM because the execution environment blocks ordinary localhost/file navigation. The actual production HTML/CSS/JS payload was executed, not a mock of the builder.

Application boot: PASS.

- `window.__PROTOLAB_READY__ = true`
- no fatal boot state;
- boot phase = `ready`;
- runtime = `1.0.162-poc`;
- V162 builder test hook present.

**24 / 24 rendered interaction checks PASS**, including:

- shared Validation builder visible;
- library / canvas / properties layout;
- toolbar controls;
- state badge;
- all five overlays;
- draggable requirements;
- real browser `DragEvent` library → insertion drop adds exactly one activity;
- native Validation activity synchronization after the drop;
- Undo of the structural change;
- Redo of the structural change;
- inline insertion points;
- searchable quick-add;
- real drag/drop creates a new parallel leg;
- allocation control on a parallel leg;
- controlled leg-delete control;
- selected-activity property panel;
- concise context menu including parallel and replace actions;
- Released-programme structural edit opens controlled revision rationale instead of silently mutating the release;
- mobile builder rendering at a 390 × 844 layout viewport;
- visible mobile movement fallback controls;
- 110-activity / 21-lane rendered stress fixture;
- minimap present for the large fixture;
- final Validation programme invariant remains valid.

Large rendered fixture: **110 activities / 21 lanes**, render-string generation **4.6 ms** in the final interaction run; minimap active. This is a local smoke metric, not a browser/device SLA.

## 6. Acceptance criterion

PASS at model/interaction level.

The builder supports creation of:

Start → Preparation → split into Thermal Cycling / Vibration / Salt Spray → merge → Functional Test → Final Inspection,

with visual DUT allocation across the three branches, no manual graph connector creation and no floating activities. The dedicated core fixture validates a 30-DUT 10/10/10 allocation.

## 7. Regression boundaries retained

REV 1.0.162 deliberately keeps the existing shared LabOS planning/execution layers rather than creating builder-specific scheduling logic. The new model synchronises into the same native Prototype route steps and Validation activities used by the existing constrained planner, resource assurance, execution, reports, lessons, archive and KPI layers.

The release does not claim production multi-user concurrency or server-side audit guarantees. LabOS remains a static-browser POC using browser-local persistence; a production deployment still requires governed backend storage, authorization, controlled evidence storage, concurrency/transaction handling and server-side audit enforcement.

## 8. Static/package release gates

The final package is required to pass all of the following immediately before delivery:

- JavaScript `node --check` for every packaged `.js` file;
- `manifest.webmanifest` JSON parse;
- local `src`/`href` asset resolution from `index.html`;
- visible revision = **REV 1.0.162**;
- runtime version = **1.0.162-poc**;
- schema = **38**;
- current runtime/style filenames = **1.0.162**;
- service-worker deployment reset marker = **1.0.162**;
- no standalone Validation runtime;
- final ZIP extraction and `unzip -t` integrity;
- JavaScript syntax recheck on the extracted ZIP payload.

The final release gate result is appended after packaging.

## 9. Final package verification

**PASS.** The release payload passed JavaScript syntax, manifest parsing, index/CSS local-asset resolution, revision/schema/runtime assertions, clean ZIP extraction, `unzip -t` integrity, and JavaScript syntax recheck on the exact extracted ZIP payload. The delivered ZIP contains only deployable runtime/documentation/assets plus this current QA report; development test harnesses are excluded.
