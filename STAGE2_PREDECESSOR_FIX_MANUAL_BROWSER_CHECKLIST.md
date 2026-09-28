# LabOS Stage-2 Predecessor Fix — Manual Browser Checklist

Candidate: `STAGE2-PREDECESSOR-FIX-TEST1`  
Visible badge: `REV 1.0.185 · S2 PREDECESSOR FIX TEST-1`

1. Open a Validation programme containing a sequential chain of at least four tests: `A → B → C → D`.
2. Note A and B start, end, equipment, person and site.
3. Manually replan C to a later Green/Yellow feasible date and accept with rationale.
4. PASS if A and B remain exactly unchanged.
5. PASS if C moves to the accepted date.
6. PASS if D may move automatically but remains dependency-valid after C.
7. Try a C date before B can finish. PASS if the option is infeasible/rejected and A/B do not move.
8. Reload. PASS if A/B did not become permanent user locks solely because C was replanned.
9. Confirm the complete Validation sequence still has exactly one active booking per canonical activity.

Do not mark this correction as a protected RC until these checks pass in the browser.
