# LabOS New-Chat Continuity Prompt

Copy and paste the block below into a completely new chat. Attach/provide the repository or working tree containing these canonical files and the frozen package named by `CURRENT_HANDOFF.md` where available.

```text
CONTINUE LABOS CONTROLLED REBUILD FROM REPOSITORY SOURCE OF TRUTH.

Do not rely on conversational memory or assumptions from prior chats.
The repository is authoritative.

FIRST — MAKE NO SOURCE CHANGE.

Read completely, in this exact order:

1. CURRENT_HANDOFF.md
2. CONTROLLED_REBUILD.md
3. LABOS_INVARIANTS.md
4. LABOS_ARCHITECTURE.md
5. REGRESSION_MATRIX.md
6. the latest relevant entries in DECISION_LOG.md
7. NEW_CHAT_CONTINUITY_PROMPT.md

Then physically verify, where artifacts are available:

8. every protected/frozen SHA-256 listed in CURRENT_HANDOFF.md;
9. current labos-version.json and index.html build identity;
10. the exact working-tree delta versus the frozen baseline named in CURRENT_HANDOFF.md;
11. whether temporary/debug/range-runner artifacts are present.

If this is a Git checkout, also report branch, HEAD commit and git status. If it is not a Git checkout, say so and use file/package/hash evidence instead.

RECONSTRUCT BEFORE EDITING

Report:

- the full Stage 1–10 controlled-rebuild dashboard;
- protected baselines and which hashes were physically reverified versus historically documented only;
- current open stage;
- active controlled runtime identity;
- classification of the current working tree (for example frozen build vs unlabelled candidate);
- exact production files differing from the frozen baseline;
- unresolved/reproduced regressions supported by repository evidence;
- completed regression gates that remain valid;
- stale/invalidated gates that must be rerun;
- the exact remaining regression matrix;
- the exact next safe controlled action.

Do not make any source change until this reconstruction is complete.

CONTROLLED-REBUILD RULES

- Never make ad-hoc patches.
- Classify every defect/change into Stage 1–10 before implementation.
- Correct generic architectural root causes only.
- Do not create duplicate engines or competing state/persistence paths.
- Earlier protected stages may be reopened only for a reproduced regression.
- Rerun every affected protected gate after a correction.
- Do not weaken behavioral tests to obtain PASS.
- Interrupted/timed-out tests are not PASS.
- Historical reports/checksums are immutable evidence.
- Do not assign a new controlled build identity until the required behavioral matrix is fully green.
- Do not create an RC/checkpoint until automated, structural and required manual acceptance gates pass and the user explicitly accepts the stage.
- Do not advance to the next stage without explicit user acceptance.
- Preserve future API/database/SSO/server compatibility boundaries.
- Update CURRENT_HANDOFF.md after every meaningful controlled checkpoint.
- Append decisions to DECISION_LOG.md; do not silently rewrite old decisions.
- Keep REGRESSION_MATRIX.md synchronized with the actual QA suites/results.
- Keep LABOS_ARCHITECTURE.md and LABOS_INVARIANTS.md authoritative and concise.
- Always start every controlled-rebuild response with the full 10-step dashboard.
- Always end with the exact copy-paste prompt for the next controlled step.

SPECIAL CURRENT RULE

Use the exact current state recorded in CURRENT_HANDOFF.md. Do not infer any later build, RC or stage from chat history. Preserve the handoff's exact frozen/candidate/manual-acceptance designation until the repository-defined gate changes it.

Continue only after the repository-source-of-truth reconstruction is complete.
```
