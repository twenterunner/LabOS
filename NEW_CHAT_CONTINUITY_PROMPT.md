# LabOS New-Chat Continuity Prompt — Stage 4 Manual Acceptance

```text
CONTINUE LABOS CONTROLLED REBUILD FROM THE CANONICAL REPOSITORY SOURCE OF TRUTH — STAGE 4 OF 10 — MANUAL BROWSER ACCEPTANCE OF THE EXACT STAGE4 TEST-1 CANDIDATE.

Do not rely on conversational memory.
Do not start Stage 5.
Do not create a Stage-4 RC or protected checkpoint unless I explicitly accept Stage 4 after manual testing.
Do not make ad-hoc patches.
Keep Stage-10 sticky Planning timeline/date/lane/−/+ /FIT deferred.

START WITH THE FULL 10-STEP DASHBOARD.

Expected position:
Stage 1 — COMPLETE / PROTECTED
Stage 2 — COMPLETE / PROTECTED
Stage 3 — COMPLETE / PROTECTED
Stage 4 — OPEN / browser acceptance candidate only / NOT PROTECTED
Stage 5–10 — NOT STARTED

READ FIRST:
1. CURRENT_HANDOFF.md
2. CONTROLLED_REBUILD.md
3. LABOS_INVARIANTS.md
4. LABOS_ARCHITECTURE.md
5. REGRESSION_MATRIX.md
6. latest DECISION_LOG.md entries
7. STAGE4_READINESS_ENTRY_AUDIT.md
8. STAGE4_RED_GATE_EVIDENCE.md
9. STAGE4_IMPLEMENTATION_REGRESSION_EVIDENCE_REPORT.md
10. STAGE4_MANUAL_BROWSER_CHECKLIST.md
11. STAGE3_ACCEPTANCE_REPORT_v1.0.185_RC1.md

Verify the exact frozen Stage-4 TEST candidate named in CURRENT_HANDOFF.md against its SHA-256 sidecar before interpreting browser results.

The automated position before manual acceptance is:
- protected Stage 1–3 matrix: 380/380 PASS;
- Stage-4 architecture/purity: 12/12 PASS;
- Stage-4 governed boundary: 3/3 PASS;
- Stage-4 persisted-state: 4/4 PASS;
- Stage-4 Chromium/mobile: 9/9 PASS;
- Stage-4 build identification: 11/11 PASS;
- production JS parse: 11/11 PASS.

My next input should be the manual checklist result against the exact frozen package.

If I report any FAIL:
- classify it into Stage 1–10;
- reproduce it against the exact candidate;
- reopen an earlier protected stage only when the regression is reproduced;
- fix the generic architectural cause;
- rerun every affected protected gate;
- freeze a new Stage-4 TEST candidate, never overwrite historical evidence.

If I explicitly report all required manual checks PASS and accept Stage 4:
- perform the formal Stage-4 acceptance gate;
- verify exact package/hash/manifest and continuity evidence;
- create the protected Stage-4 RC/checkpoint only then;
- update continuity to Stage 4 COMPLETE / PROTECTED;
- do NOT implement Stage 5 in the same acceptance step.

Always end with the exact copy-paste prompt for the next controlled step.
```
