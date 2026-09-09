## REV 1.0.45 · Governed execution, matrix data capture & closed-loop improvements

This revision hardens the v1.0.44 acceptance baseline. Release and lifecycle rules are now service-enforced; Control Plan approval requires an explicit review request; JSON import is invariant-validated before persistence; request/route IDs are collision-safe; missing Administrator and Closeout workspaces are restored. Build execution supports multi-sample execution groups and a clear setup-vs-sample data matrix with bulk fill. Readiness blockers open a contextual resolver. Critical-characteristic distributions use a fitted normal curve with a 50-bin histogram for larger datasets or individual sample scatter for smaller prototype datasets, plus an Anderson–Darling normality p-value. Accepting an improvement starts a controlled implementation workflow and does not mark it complete until effectiveness is verified.

## REV 1.0.44 · Batch-first capture, capability reporting & Audit Readiness

- Process setup/common parameters default to batch-level capture; per-sample values remain available only where needed.
- Build Report typography is hardened for mobile and print; Control Plan tables scroll on screen and fit print/PDF.
- Critical/safety capability plots use histogram + fitted normal curve + LSL/USL/target/mean + Cpk/Cpu/Cpl + anomaly rug.
- PFMEA remains in LabOS as underlying process-risk evidence, but no longer dominates the Guided Build Workflow or main Build Report.
- New Audit Readiness view evaluates current evidence against IATF 16949-oriented or ISO/IEC 17025-oriented readiness rules, highlights potential major/minor gaps, computes a readiness score and generates a laboratory scope from equipment metadata.

This is a static demonstration and an audit-preparation aid, not certification software or an auditor judgement.


### REV 1.0.44 operational decision controls
- Daily Operations Check signals can be Accepted, Rejected or Deferred directly from Dashboard. Every decision records actor, timestamp, rationale, owner and target/review date in audit history. Accepted improvements become tracked actions; rejected/deferred items are suppressed until their configured review date.
- Guided Control Plan blockers now expose a direct **Complete Control Plan definition** resolver for incomplete special/safety characteristics, so a build cannot dead-end behind a generic "action required" label.
