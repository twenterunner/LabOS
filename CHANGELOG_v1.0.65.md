# LabOS WEB — REV 1.0.65

This revision is a focused correction release based on user acceptance feedback from REV 1.0.64.

## Corrected workflows

- Planning bookings are now bound directly to their booking IDs when the swimlane is rendered rather than inferred from displayed text. Planned build bars support native desktop drag events and a pointer fallback. Starting a move exposes feasible equipment/person/time alternatives; dropping on or selecting an alternative applies the move and constrained downstream replan.
- Equipment-readiness administrator exceptions now target the actual equipment governance condition instead of a generic build lifecycle exception. The readiness blocker is removed for progression when the controlled exception applies, while the UI identifies the condition as **Exception active** rather than falsely displaying missing evidence as normally ready.
- Improvement acceptance/rejection/defer dialogs pre-populate a system-proposed rationale. The user remains responsible for reviewing/editing it before recording the decision.
- The global Team/My Next Action banner is retained on the Dashboard and Action Centre, but removed from ordinary working pages to reduce repeated visual noise.
- JSON backup export was repaired after role/view smoke testing identified an undefined `exportJson` handler.

## UX / information architecture

- Active request portfolio cards are substantially more compact on desktop and retain a mobile-safe stacked layout.
- Engineering Dashboard six KPI tiles operate as filters for the request list.
- Products can be assigned to and displayed by product category, with grouped and flat views.
- Build commitment health now uses green/amber/red/neutral row states plus a summary strip for ahead/buffer, tight/moved, late/materially moved, and not-planned builds.
- Resource Assurance is consolidated into **Lab Standards, Resources & Assurance**. The duplicate standalone navigation item is removed; legacy links redirect to the integrated assurance section. Calibration, maintenance and training show pull-out/return windows, affected/next-use builds and direct scheduling/review actions.
- Local subsection navigation remains sticky on the standards/resource and similar workspaces.

## 5S

- Three realistic raster bench-top reference renders are embedded directly as JPEG data URLs in the application so GitHub Pages path/cache differences cannot leave broken image placeholders. The visual baseline shows an organised bench, a cluttered/obstructed bench and visual-management/shadow-board storage.

## Verification performed for this release

- JavaScript syntax check (`node --check app.js`).
- 24/24 browser-level acceptance checks using headless Chromium, including a native dragstart/drop move with 36 feasible alternatives and a changed booking time.
- 136 role/view navigation renders across 12 demo roles with no uncaught page errors.
- Demo-state invariant validation returned 0 invariant errors.
- Embedded 5S JPEGs were decoded and validated at 1600 × 900.

The browser-level tests use an isolated in-memory test page because the execution environment blocks normal localhost/file navigation; they exercise the same HTML/CSS/JS bundle delivered in this ZIP.
