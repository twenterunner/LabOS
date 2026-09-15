# LabOS REV 1.0.129 — Development-Time Learning QA

**Audit date:** 15 September 2026  
**Target:** `ProtoLabOS_Prototype_Build_POC_v1.0.129_WEB.zip`  
**Regression base:** REV 1.0.128  
**Accepted historical reference:** REV 1.0.98  
**Schema:** 35

## Executive result
REV 1.0.129 makes method-development engineering effort a measured, reusable learning signal rather than only a manually entered planning allowance. Process/test execution time remains separate. The release retains schema 35 and does not require Reset Demo Data.

Fresh-demo and deterministic development-learning verification passed. The current demo contains 10 Standard Tests and 40 explicitly marked demo development-history episodes (4 per test). Non-demo states receive no fabricated history.

## What is now controlled
Each development episode can retain:
- kind: process or test development;
- originating build/request, lab and product;
- exact method / Standard Test and family reference;
- development type: New method, Adaptation or Revision;
- recommended/planned engineering hours;
- measured actual engineering hours;
- start/completion dates;
- trial / iteration count;
- outcome and learning note;
- actor, source and timestamps.

Normal process/test release paths require measured actual development hours before formal release. Closed-build capture also upserts the development evidence by its stable source record so the same episode is not duplicated.

## Learning rule
Only records with positive **measured** actual hours, a completion date and a non-failed outcome influence recommendations.

Recommendation priority:
1. exact method + matching development type when there is sufficient typed evidence;
2. exact method history;
3. comparable method-family history only when exact evidence is absent;
4. controlled fallback/baseline when no measured comparable history exists.

With three or more exact records, the recommendation weights the recent median more heavily than the overall median (70% recent / 30% overall) and rounds to 0.5 h. Human override remains possible; the UI requires rationale when the estimate differs by more than 10% from a learned recommendation.

AUTO-PLAN also uses this learned recommendation as its provisional development duration when a process-development activity has not yet received an explicit human planning allowance.

## Trend / history UX
For an individual Standard Test, **Lab Standards & Resources → Standard Test → Development Time History** shows:
- next learned recommendation;
- latest measured actual;
- first-to-latest development-time movement;
- planned-vs-actual trend chart;
- completed build/date, development type, planned hours, actual hours, variance, trial count and outcome.

The same analysis is available under **Lab Performance → Test development learning**, with a Standard Test selector. A controlled manual development episode may also be recorded against a Standard Test where the development took place outside a build workflow.

## Deterministic verification
`qa_v129.mjs` completed **40 assertions** with zero failures. Coverage includes:
- version/schema preservation;
- fresh-demo invariants;
- fresh-demo planning integrity;
- development-history coverage for every Standard Test;
- exclusion of failed, estimated/unmeasured and incomplete evidence from recommendations;
- exact-method precedence over family fallback;
- family fallback when exact evidence is absent;
- recent-history weighting and confidence level;
- trend direction;
- source-record upsert / no duplicate learning event;
- process-development recommendation;
- closed-build test-development capture;
- process-release gate requiring measured development hours;
- release-time process-development history capture;
- non-demo isolation (no seeded fake history);
- AUTO-PLAN regression across all 21 open/non-final demo builds.

Planner regression result:
- 21 open/non-final builds evaluated;
- 20 produced a valid plan;
- 1 returned the deliberately seeded, structured `ZERO_EQUIPMENT_CAPABILITY` blocker for P26-1023 / Detroit high-speed vibration;
- 0 unexpected planner exceptions;
- fresh state: 0 invariant violations and 0 planning-integrity findings.

A targeted planner-learning test also created a new process-development activity with **no explicit estimate**, supplied two measured exact-method historical episodes (9.5 h and 8.5 h), and verified AUTO-PLAN used a **9.0 h** learned development allowance with the history basis visible on the booking.

## Static/package checks
- all five runtime JavaScript files: `node --check` PASS;
- index runtime references point to REV 1.0.129 assets;
- runtime badge/version: REV 1.0.129 / `1.0.129-poc`;
- manifest parse: PASS;
- final ZIP integrity: PASS at packaging.

## Qualification boundary
The deterministic model/services/runtime source and final static package are exercised here. This environment does not claim a physical Android/GitHub-Pages browser qualification; the deployed site should still receive a short physical smoke check after upload.
