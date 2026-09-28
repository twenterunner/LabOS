# Stage-3 Prototype Build Site Visibility Correction

**Build:** `STAGE3-BUILD-SITE-VISIBILITY-FIX-TEST1`  
**Product revision:** `REV 1.0.185`

## Reproduced issue

Prototype build Planning swimlanes rendered the task name plus equipment/person but did not render the booking execution site. A governed single-task sister-lab request could therefore be invisible in the build workspace. Pending requests were also not distinguished from accepted LIVE routing.

## Narrow correction

The existing canonical bookings and Stage-3 governance remain unchanged. The build-level Planning renderer now:

- displays the current booking lab code on every planned task lane and bar;
- marks an accepted task-level remote booking as `SISTER LAB` when its booking site differs from the programme execution site;
- displays a pending task request as `current-site · → target-site · awaiting receiver` without changing the LIVE site;
- preserves the rule that a Request/UnderReview network record is non-mutating until receiving-lab acceptance.

Example:

- pending: `DE-ST · → NL-TW · awaiting receiver`;
- accepted: `NL-TW · SISTER LAB`;
- unchanged successor: `DE-ST`.

## Regression evidence

- Stage-3 build-site visibility: **3/3 PASS**
- Stage-3 My Work network inbox: **4/4 PASS**
- Stage-2 predecessor anchoring: **2/2 PASS**
- JavaScript parse: **PASS**

The Stage-3 network architecture, acceptance boundary, SiteAssignment semantics and Stage-2 planning kernel are unchanged.
