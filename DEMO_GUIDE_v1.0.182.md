# LabOS REV 1.0.182 — Management Demo Guide

## Planning architecture proof

For the Planning portion of the demo, start on **Planning** and explain that Prototype and Validation now query the same `PlanningEngine`. Use the six top tiles to show that the actual lane population changes. Open **Compare sister lab** on any programme with an internal-lab alternative, then **Optimize recovery** to compare the accepted baseline with complete feasible scenarios. Click a live booking bar to open the same Green / Yellow / Red manual slot finder for either Prototype or Validation. Finally switch the selected lab and open **Audit Readiness** to show that the evidence population follows the same lab context.

The demo project IDs below are presentation examples only. The planning engine contains no project-ID-specific rules.

## Best 12–15 minute route

Open **Help → Management Demo**. REV 1.0.182 contains 16 prepared showcase records. The strongest new end-to-end example is **V26-0205**.

### 1. V26-0205 — complex completed cordless power-tool Design Validation

**18 V Brushless Cordless Drill/Driver · comprehensive B-sample Design Validation**

- Product: 18 V Brushless Cordless Drill/Driver
- Part number: PT-D18-7420 · Rev C
- 24 controlled serialised DUTs
- 4 Test Legs
- 31 controlled Validation tests
- 2 explicit split / branch / merge structures
- 31/31 test descriptions
- 31/31 controlled acceptance criteria
- 31/31 DUT-linked result sets
- 31/31 setup photographs
- 31/31 conformity decision rules
- 31/31 technical conclusions
- closed programme with **FINAL · APPROVED** Validation Report

The Test Flow is intentionally substantial:

1. **Baseline electrical & metrology** — 10 sequential tests on the common DUT population.
2. **Environmental durability** — common entry, then a 12/12 DUT split into a thermal/electrical branch and a drive-train durability branch, followed by a controlled merge/rejoin and common post-exposure checks.
3. **Mechanical / ingress robustness** — common entry, then an 8/8 DUT split into a mechanical-vibration/shock/connector branch and an ingress/humidity/leak branch, followed by merge/rejoin.
4. **Final correlation & release** — final common checks and disposition.

Open **Preview full report**. The report uses the actual controlled Test Flow model and recursively renders the Test Legs, SPLIT points, branch paths and MERGE / REJOIN points. It is not a separately drawn report diagram.

Each test dossier contains realistic engineering content: test purpose, controlled method/revision, setup/procedure, acceptance criteria, conformity decision rule, conditions/environment, equipment/calibration, operator/competence, DUT/serial-level measurements, setup photograph and technical conclusion. Numeric tests also carry controlled target/specification data where defined.

## 2. Engine-driven Prototype Lessons Learned

Open **P26-1201** first. This is a closed historical Prototype build. The demo record contains source evidence only: a real controlled harness deviation, root cause/prevention evidence, measured development actuals and a replan.

LabOS then runs the normal closeout-learning engine. It creates **AUTO-LESSON-P-P26-1201** with `createdBy = LabOS automatic learning`. The V177 demo installer does **not** seed that lesson text as a lesson row.

Then open **P26-1202**. This is the next similar Prototype. The normal similarity/prevention engine surfaces the P26-1201 prevention automatically before work proceeds.

### Prototype development-learning proof

The demo contains three completed measured development episodes for the same related process-development family. Their actual hours are retained as historical evidence and the normal `developmentRecommendationV129` engine is re-run after each point:

- after P26-1201: measured 22 h → recommendation 22 h
- after P26-1203: measured 18 h → recommendation 20 h
- after P26-1204: measured 12 h → recommendation 18 h

The recommendation changes because the measured history changes; the displayed recommendations are not fixed demo labels.

## 3. Engine-driven Validation Lessons Learned and Test Development

Open **V26-0201**. It is a closed historical Validation containing a controlled failed result, root-cause/prevention evidence and a measured **24 h** test-development actual for the powered thermal-cycle method variant.

Closing evidence is processed by the normal Validation learning engine and produces **AUTO-LESSON-V-V26-0201**. The lesson is generated from execution evidence; it is not inserted as a pre-written lesson.

The method-development learning sequence is then:

- after V26-0201: measured 24 h → recommendation about 23 h
- after V26-0202: measured 16 h → recommendation about 18 h
- after V26-0205: measured 12 h → recommendation **17.5 h**

Open **V26-0206**. Its powered thermal-cycle method variant is created through the normal Validation Test Development path and receives a **17.5 h / 2.2 day, Medium-confidence** learned estimate from the shared cross-domain estimator. The displayed basis identifies the measured Prototype + Validation history used.

The exact recommendation can continue to move as further real completed development records are added.

## 4. Other useful showcase projects

- **P26-1101** — 40-part normal distribution, no statistical flier.
- **P26-1102** — 40-part normal process core plus one statistical flier inside specification.
- **P26-1103** — 40-part bimodal/non-normal population without isolated flier.
- **P26-1104** — skewed non-normal population, flier, out-of-spec result and controlled hold.
- **V26-0103** — Prototype-linked Validation genealogy and automatic Prototype-delay/replan audit history.
- **V26-0104** — sister-lab Validation with controlled DUT register and report photos.
- **P26-1015** — complete Prototype dossier, execution evidence, photographs, deviation and approved Build Report.
- **P26-1018** — material availability constrains planning.
- **P26-1019** — calibration recovery before planned work.
- **P26-1023** — single specialist test routed to sister lab.

## Pitch message

LabOS is not only a database of test results. The story to demonstrate is the closed digital loop:

**request → controlled flow → exact samples/serials → constrained planning → execution evidence → quality disposition → controlled report → automatically captured prevention → better next-plan / development estimate.**

The Management Demo deliberately exposes the generated lesson IDs and measured-actual-to-recommendation trajectory so the learning claim can be demonstrated from the application's normal engines rather than presented as a static marketing statement.


## Planning interaction additions in REV 1.0.182

For the management demo, open **Planning** and demonstrate that each of the six headline KPI tiles filters the projects in the swim lanes. Use **− / + / FIT** above the timeline and drag the blank timeline area left/right with the mouse. Each project/programme label now includes **Optimize recovery** and **Compare sister lab**, so recovery can be demonstrated directly from the plan rather than via a separate section.

The **Validation** portfolio now has the same search/filter pattern as Prototype Builds, which makes V26-0205 and the learning examples quick to find during the pitch.

## REV 1.0.182 planning / governance demo

For the planning regression demonstration use **Overall** Planning first. The six top tiles now filter the actual lane population; switch All / Prototype / Validation above the timeline, then drag the empty timeline horizontally. Click a live booking bar to show Green / Yellow / Red manual alternatives. **Optimize recovery** deliberately stays local; **Compare sister labs** independently evaluates each internal laboratory and creates a formal transfer request rather than moving LIVE work. Switch to the receiving lab to demonstrate Accept & revalidate / Reject.

For workflow governance, use an Engineering-supplied build with a future material date to show that the date is planning information only—the Materials step is not green until the material is actually received/issued. Then use a build with a technically ready route to show the explicit **Process & Methods** confirmation before downstream controlled workflow proceeds.

For management pages, change the selected laboratory in the global header and open **Audit** and **KPI**. Both now follow that same lab context. KPI time-series panels are line plots; Pareto charts are retained only for ranked categorical causes/bottlenecks.
