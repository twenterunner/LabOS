# LabOS Controlled Rebuild

This document defines the mandatory controlled-rebuild process. It applies across all LabOS engineering work until superseded by an explicitly accepted repository decision.

## 1. Fixed 10-stage sequence

1. **Data & State Integrity**
2. **Planning Engine**
3. **Network / Sister-Lab Capability**
4. **Readiness Engine**
5. **Workflow Engine**
6. **Execution & Evidence Engine**
7. **Reporting Engine**
8. **Lessons Learned Engine**
9. **KPI Engine**
10. **Tab / UI / UX Review**

Stages are worked in this order. A later stage may not begin implicitly.

## 2. Mandatory response/dashboard contract

Every controlled-rebuild response must:

1. start with the full 10-step dashboard;
2. identify the current open stage and any earlier-stage regression reopened by the current gate;
3. classify every requested change/defect into one of the 10 stages before implementation;
4. end with the exact copy-paste prompt for the next controlled step.

## 3. No ad-hoc patches

A defect is handled as:

**observation → stage classification → reproduction → architectural owner → generic root-cause correction → regression protection → affected protected gates → acceptance**.

Forbidden approaches include:

- UI-only fixes that bypass canonical domain/state services;
- duplicate planners/schedulers or competing persistence paths;
- direct state mutation used to bypass a governed transaction;
- one-off data fixes embedded into ordinary read/render paths;
- weakening tests to obtain a PASS;
- changes outside the owning stage merely because they are convenient.

## 4. Protected-baseline semantics

When a stage is accepted, its architecture and acceptance evidence become protected.

A protected earlier stage may be reopened only when a regression is reproduced against the current candidate. Reopening a protected stage does not restart unrelated design work; only the reproduced generic cause is corrected, with regression coverage added and affected protected gates rerun.

Historical reports/packages/checksums are immutable evidence. Do not rewrite an older Test-N report to describe a newer build.

## 5. Stage entry criteria

Before implementation in a stage:

- prior required stages are accepted/protected;
- the current repository handoff identifies the stage as open;
- architecture/invariants for protected stages have been read;
- relevant baselines/hashes are verified where physically available;
- the requested change is classified into the stage framework;
- existing legacy/duplicate paths in the owning area are audited before adding new architecture.

## 6. Stage implementation criteria

During a stage:

- preserve one canonical architecture per responsibility;
- prefer delegation/consolidation over introducing parallel implementations;
- preserve compatibility with future API/database/SSO/server deployment boundaries;
- keep state, persistence, planning and network mutations behind their canonical service/transaction boundaries;
- add tests that protect behavior and architecture, not incidental implementation shape;
- use deterministic fixtures and deterministic range execution for expensive suites.

## 7. Automated regression gate

A stage candidate cannot advance to a manual browser gate until:

- all stage-owned tests pass;
- all affected protected earlier-stage tests pass;
- required real-state/persisted-state tests pass;
- required static/structural assertions pass;
- syntax/reference/build integrity checks pass;
- interrupted or timed-out runs have been rerun to an explicit completed result.

A test may be updated only when its old assertion encodes a superseded implementation detail and the replacement asserts the stronger accepted architectural requirement. Behavioral protection may not be weakened merely to make a suite pass.

## 8. Manual browser gate

A GitHub/manual-test package is not an RC and does not complete a stage.

The manual gate must use the exact frozen package/checksum and, when the test requires persisted continuity, preserve existing IndexedDB/site data. Browser findings are classified into Stages 1–10 before changes are made.

If a Stage-1/2/3 regression is found while Stage 3 is open, Stage 3 remains open until the regression is reproduced, corrected architecturally and protected by rerun gates.

## 9. RC / protected checkpoint creation

An RC/protected checkpoint is created only when:

1. automated/structural gates are fully green;
2. required manual browser acceptance is fully green;
3. the user explicitly accepts the current stage;
4. repository continuity documents are updated to the exact frozen state;
5. package SHA-256 and package manifest are verified;
6. no unresolved blocker remains in the current or protected earlier stages.

Do not create a protected checkpoint merely because a test package exists.

## 10. Explicit user acceptance and stage advancement

The next stage does not begin until the user explicitly accepts the current stage. Automated success alone is insufficient.

## 11. Repository continuity governance

Repository files, not chat history, are the engineering continuity authority.

Required root documents:

- `CURRENT_HANDOFF.md`
- `CONTROLLED_REBUILD.md`
- `LABOS_INVARIANTS.md`
- `LABOS_ARCHITECTURE.md`
- `REGRESSION_MATRIX.md`
- `DECISION_LOG.md`
- `NEW_CHAT_CONTINUITY_PROMPT.md`

`CURRENT_HANDOFF.md` is updated at every meaningful controlled checkpoint and before every package handoff. `DECISION_LOG.md` is append-only. `REGRESSION_MATRIX.md` must track the actual protected suites and their current validity.

## 12. Stage-10 deferral

The Planning swimlane date/timeline header, lane context and `−`, `+`, `FIT` controls are deferred to Stage 10. The eventual requirement is sticky vertical behavior while staying horizontally synchronized with the swimlane and clear of the global header.

Do not implement this as an ad-hoc earlier-stage UI enhancement unless an earlier-stage architecture cannot function correctly without it.
