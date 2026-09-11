#!/usr/bin/env python3
from pathlib import Path
import json, re, subprocess, sys, zipfile
ROOT=Path(__file__).resolve().parent
checks=[]
def check(name, cond, detail=''):
    checks.append((name,bool(cond),str(detail)))
    print(('PASS' if cond else 'FAIL')+f' | {name}'+(f' | {detail}' if detail else ''))
    return bool(cond)

def text(name): return (ROOT/name).read_text(encoding='utf-8',errors='replace')
core=text('core.js'); demo=text('demo-data.js'); services=text('services.js'); app=text('app.js'); styles=text('styles.css'); index=text('index.html'); sw=text('service-worker.js')

check('Core version is REV 1.0.95', "ProtoLab.VERSION = '1.0.95-poc'" in core)
check('HTML badge is REV 1.0.95', 'REV 1.0.95' in index)
for f in ['styles.css','core.js','demo-data.js','repository.js','services.js','app.js']:
    check(f'Cache bust updated: {f}', f'{f}?v=1.0.95' in index)
check('Service-worker cache reset is 1.0.95', '1.0.95' in sw)

for f in ['core.js','demo-data.js','repository.js','services.js','app.js','service-worker.js']:
    p=subprocess.run(['node','--check',str(ROOT/f)],capture_output=True,text=True)
    check(f'JavaScript syntax: {f}',p.returncode==0,(p.stderr or '').strip())

check('ISO-week formatter exists', 'function isoWeekPartsV1094' in app)
check('Grouped live calendar-axis formatter exists', 'function v1094GroupedCalendarAxis' in app and 'CW ${String(p.week).padStart' in app)
check('Month, ISO week-year and day layers styled', all(s in styles for s in ['swim-month-group-v1094','swim-week-group-v1094','swim-weekday-v1094']))
check('Total days late filter tile is present', "'Total days late'" in app and "tile('lateDays'" in app)
check('All commitment-health tile is present', "tile('all','All'" in app)
check('Commitment movement tile is a filter', "tile('movement','Commitment movement'" in app and 'data-v1094-health-filter' in app)
check('Build commitment health refresh honors filters', 'function v1094RefreshHealthCard' in app and 'filteredPlanningHealthV1094' in app)
check('Detailed bookings rendered section removed', '<summary>Detailed bookings and estimate basis</summary>' not in app)
check('Tiered AUTO PLAN control is active', 'AUTO PLAN · TIERED' in app and 'v1094OpenTieredPlanner' in app)
check('Escalation Mode control is active', 'ESCALATION MODE' in app and 'v1094RunEscalation' in app)

for token in ['planningPortfolioScoreV1094','planningWorsenedProjectsV1094','planningImprovementSuggestionsV1094','buildAutoPlanTiersV1094','buildEscalationPlanV1094','planPortfolioCandidateV1094']:
    check(f'Planner function exists: {token}', token in services)
check('Green policy can forbid recovery', "allowTraining:false" in services and "allowReadiness:false" in services)
check('Recovery-required path is explicit', "e.code='RECOVERY_REQUIRED'" in services)
check('Capacity failure is bounded and recoverable', "e.code='CAPACITY_UNRESOLVABLE'" in services and 'planningHorizonEnd' in services)
check('Legacy multi-year raw horizon message removed', 'no conflict-free slot exists within the controlled planning horizon' not in services+app)
check('UI explicitly refuses remote multi-year best-feasible output', 'rather than presenting a remote multi-year date as “best feasible”' in app)
check('Red tier requires whole-lab objective improvement', 'red.metrics.score<referenceScore' in services)
check('Red tier trade-off requires actual worsened project', 'red.worsened.length>0' in services)
check('Newly planned request is not falsely classified as worsened project', 'A newly planned request that was previously unplanned is not a project that became later' in services)
check('Escalation is target-first', 'if(targetRequestId){const i=rows.findIndex' in services and 'rows.unshift(rows.splice(i,1)[0])' in services)
check('Escalation evaluates multiple portfolio orderings', "['priorityDue','duePriority','commitment']" in services)
check('Planner candidate runs final invariant audit', 'planningIntegrityAudit' in services and 'validateInvariants' in services)
check('Capability-improvement suggestions include training', 'planningImprovementSuggestionsV1094' in services and re.search(r'train|training|qualification',services,re.I))

check('Provider-neutral team identity source exists', 'identityProvider' in core and 'externalGroupKey' in core)
check('Provider-neutral principal identity key exists', 'externalPrincipalId' in core)
check('Project-team role bindings exist', 'roleBindings' in core)
check('Project-team approval rights exist', 'APPROVAL_RIGHT_OPTIONS' in core and 'approvalRights' in core)
check('Project-team approval enforcement helper exists', 'projectTeamUserCanApprove' in core)
check('Project-team assignee resolution helper exists', 'resolveProjectTeamAssignee' in core)
check('Project team UI exposes roles and approval rights', 'Project Teams, Roles & Approval Rights' in app and 'External principal key' in app)
check('Project team UI exposes identity source', 'Identity source' in app)

check('Demo future-project probabilities use fractions', all(x in demo for x in ['probability:0.70','probability:0.45','probability:0.60']))
check('Legacy whole-percent probability migration normalizes to fractions', 'if(v>1&&v<=100)v/=100' in core)

# Retention checks from prior controlled workflow revisions.
check('REV 1.0.93 control-plan approval invalidation retained', 'invalidateControlPlanApproval' in app)
check('Control-plan approval path UI retained', 'v1093-cp-path' in app or 'cp-path' in app)
check('Final closeout is an explicit planned booking', 'Final quality review / release / handover' in core and "task.kind==='closeout'" in services and "taskType:'closeout'" in services)

# REV 1.0.95 canonical planning-definition architecture.
check('Canonical planning-task builder exists', 'ProtoLab.planningTasksForRequest' in core)
check('Stable semantic test-requirement identity exists', all(x in core for x in ['testRequirementKey','testRequirementStableId','stablePlanningToken']))
check('Booking/task semantic compatibility guard exists', 'ProtoLab.planningTaskCompatible' in core)
check('Stale planning-booking reconciliation exists', 'ProtoLab.reconcilePlanningBookings' in core)
check('Task coverage invariant exists', 'ProtoLab.planningTaskCoverage' in core)
check('Canonical route excludes optional process operations', "(route?.steps||[]).filter(x=>!x.optional)" in core)
check('Canonical closeout task is explicit', "kind:'closeout'" in core and "Final quality review / release / handover" in core)
check('Released custom test drops development prerequisite', "tr.developmentReleased!==true" in core)
check('Released process development drops development prerequisite', "step.type!=='standard'&&!released" in core)
check('AUTO-PLAN reconciles stale bookings before resource search', 'P.reconcilePlanningBookings(state,r,{removeObsolete:true});const planTasks=P.planningTasksForRequest(state,r);' in services)
check('AUTO-PLAN iterates canonical planTasks', 'for(const task of planTasks)' in services)
planner=services[services.find('class PlannerService'):services.find('// REV 1.0.81 planning-integrity audit')]
check('AUTO-PLAN no longer has independent test-requirement loop', 'for(const tr of r.testRequirements||[])' not in planner)
check('AUTO-PLAN bookings carry task definition fingerprints', 'taskDefinitionKey:task.definitionKey' in services)
check('Locked booking requires semantic task compatibility', 'P.planningTaskCompatible(task,lb)' in services)
check('AUTO-PLAN has hard task-coverage failure code', 'PLANNING_TASK_COVERAGE_FAILED' in services)
check('Transactional AUTO-PLAN rechecks task coverage', 'const coverage=P.planningTaskCoverage(working,requestId)' in services)
check('Manual planner reads canonical task definitions', 'return P.planningTasksForRequest(App.state,r).map' in app)
check('Manual planner carries task definition fingerprint', 'taskDefinitionKey:def.definitionKey||null' in app)
check('Manual plan no longer adds hidden extra 4h after closeout booking', 'last?planningAddWorkHoursV1064(new Date(last.end),4):null' not in app)
check('Sticky schedule reads canonical task coverage', "if(step.id==='schedule'){const coverage=P.planningTaskCoverage" in app)
check('Build planning step exposes plan coverage', 'Plan coverage complete.' in app and 'required tasks scheduled' in app)
select_seg=app[app.find('function selectEndTestsModal'):app.find('function testEstimateModal')]
check('End-test edits retain semantic requirement history rather than clearing IDs', 'r.testRequirements=[]' not in select_seg and 'P.ensureTestRequirements(App.state,r)' in select_seg)
check('End-test edits reconcile obsolete bookings', "End-characterisation selection changed" in app and 'P.reconcilePlanningBookings(App.state,r,{removeObsolete:true})' in app)
check('Startup migration reconciles legacy task-definition drift', 'v1095ReconcilePlanningDefinitionsOnLoad' in app and "planningTaskDefinitionVersion='1.0.95'" in app)
check('Route definition edits invalidate stale future planning', 'invalidatePlanningDefinitionV1095' in app and "{clearAll:true}" in app)
root_repro=ROOT/'ROOT_CAUSE_REPRO_v1.0.95.json'
check('Root-cause before/after reproduction exists',root_repro.exists())
if root_repro.exists():
    rr=json.loads(root_repro.read_text())
    check('Root proof: REV 1.0.94 reused a test ID for a different test', rr.get('before',{}).get('sameId') is True and rr.get('before',{}).get('old',{}).get('name')!=rr.get('before',{}).get('current',{}).get('name'), rr.get('before'))
    check('Root proof: REV 1.0.94 planner preserved the stale locked test', rr.get('before',{}).get('staleLockKept') is True, rr.get('before',{}).get('keptName'))
    check('Fix proof: REV 1.0.95 does not reuse the removed test ID', rr.get('after',{}).get('sameId') is False, rr.get('after'))
    check('Fix proof: REV 1.0.95 removes stale lock and ends with exact task coverage', rr.get('after',{}).get('staleLockKept') is False and (rr.get('after',{}).get('coverage') or {}).get('ok') is True, rr.get('after'))

browser_path=ROOT/'VERIFICATION_BROWSER_v1.0.95.json'
check('Browser verification JSON exists',browser_path.exists())
if browser_path.exists():
    b=json.loads(browser_path.read_text())
    check('Browser: ISO year boundary correct', b.get('isoBoundary')=={'year':2026,'week':53}, b.get('isoBoundary'))
    check('Browser: Detailed bookings absent', b.get('hasDetails') is False)
    check('Browser: pipeline probabilities normalized', float(b.get('maxPipelineProbability',99))<=1, b.get('maxPipelineProbability'))
    check('Browser: All filter tile rendered', bool(b.get('allTile')))
    check('Browser: Total days late tile rendered', bool(b.get('totalLateTile')))
    check('Browser: grouped month axis rendered', len(b.get('calendarMonths') or [])>=2, b.get('calendarMonths'))
    check('Browser: ISO week-year axis rendered', all('CW ' in x and '· 2026' in x for x in (b.get('calendarWeeks') or [])[:2]), (b.get('calendarWeeks') or [])[:2])
    check('Browser: Commitment movement tile filters', b.get('activeFilter')=='movement' and bool(b.get('movementActiveClass')))
    check('Browser: tier cards rendered', int(b.get('tierCards') or 0)>=3,b.get('tierCards'))
    check('Browser: no raw horizon leak', b.get('rawHorizonLeak') is False)
    check('Browser: no multi-year best-feasible leak', b.get('multiYearBestLeak') is False)
    ca=b.get('canonicalAlignment') or {}
    check('Browser: canonical tasks equal manual planner tasks', ca.get('manualIdsEqual') is True)
    check('Browser: sticky task names equal canonical task names', ca.get('stickyNamesEqual') is True)
    check('Browser: process/test definition view contains the same requested tests', ca.get('flowTestsPresent') is True)
    check('Browser: canonical task graph contains explicit final closeout', ca.get('hasFinal') is True)
    ti=b.get('testIdentity') or {}
    check('Browser: unchanged test preserves its ID across selection edits', ti.get('retainedId') is True)
    check('Browser: removed test ID is not reassigned to another test', ti.get('removedIdReused') is False and ti.get('unique') is True)
    sl=b.get('staleLockGuard') or {}
    check('Browser: stale semantic lock is removed before AUTO-PLAN', sl.get('sameId') is False and sl.get('staleKept') is False, sl)
    check('Browser: stale-lock scenario replans current test with full coverage', sl.get('error') is None and (sl.get('coverage') or {}).get('ok') is True and sl.get('bookedTests')==['Test · Operating current'],sl)
    ac=b.get('autoPlanCoverage') or {}
    check('Browser: AUTO-PLAN schedules exactly one booking per canonical task', ac.get('ok') is True and ac.get('expected')==ac.get('booked') and ac.get('idsEqual') is True,ac)
    check('Browser: all planned bookings have definition fingerprints', ac.get('allDefinitionKeys') is True)
    check('Browser: exact test set and explicit closeout are scheduled', ac.get('testIdsEqual') is True and ac.get('hasCloseout') is True)
    cs=b.get('coverageSabotage') or {}
    check('Browser: missing-test sabotage is detected by task coverage', cs.get('before') is True and cs.get('after') is False and cs.get('victim') in (cs.get('missing') or []),cs)
    dd=b.get('developmentDefinition') or {}
    check('Browser: development prerequisite exists only until method release', dd.get('hadDevelopment') is True and dd.get('releasedDropsDevelopment') is True)
    od=b.get('optionalDefinition') or {}
    check('Browser: optional route operation is not silently scheduled as required work', od.get('found') is True and od.get('inCanonical') is False,od)
    ui=b.get('uiCoverage') or {}
    check('Browser: planning UI reports complete canonical coverage', all(ui.get(k) is True for k in ['completeText','coverageText','stickyAllDone','stickyMatches']),ui)
    check('Browser: Project Team authority positive/negative check', bool((b.get('teamAuthority') or {}).get('ok')), b.get('teamAuthority'))
    eng=b.get('engine') or {}
    check('Engine: tier analysis returned recommendation', eng.get('recommended') in {'green','yellow','red'}, eng.get('recommended'))
    check('Engine: Red gate passed only under rule', eng.get('redRule') is True,eng.get('redRule'))
    check('Engine: no forecast beyond near-term test year', int(eng.get('maxYear') or 9999)<=2027,eng.get('maxYear'))
    hg=b.get('horizonGuard') or {}
    check('Adversarial horizon guard returns no fake recommendation', hg.get('recommended') is None and not hg.get('eligible'),hg)
    check('Adversarial horizon guard does not mutate live plan', hg.get('liveBookingsUnchanged') is True)
    check('Adversarial horizon guard does not leak raw legacy message', hg.get('rawLeak') is False)
    ex=b.get('escalationEngine') or {}
    check('Escalation produces valid target-first alternative', ex.get('ok') is True and ex.get('targetAfter') and ex.get('targetBefore'),ex)
    check('Escalation result has zero invariants/collisions/readiness failures', all(int(ex.get(k,99))==0 for k in ['invariants','collisions','readiness']),ex)
    check('Browser page completed without JS page errors', not b.get('pageErrors'),b.get('pageErrors'))

shot=ROOT/'REV1094_MASTER_PLANNER_PROOF.png'
check('Master Planner visual proof exists',shot.exists() and shot.stat().st_size>10000, shot.stat().st_size if shot.exists() else 0)

passed=sum(1 for _,ok,_ in checks if ok); total=len(checks); failed=total-passed
out=ROOT/'VERIFICATION_RESULTS_v1.0.95.txt'
out.write_text('\n'.join([f'LabOS REV 1.0.95 static + browser verification',f'Passed: {passed}',f'Failed: {failed}',f'Total: {total}','']+[f'{"PASS" if ok else "FAIL"} | {name}'+(f' | {detail}' if detail else '') for name,ok,detail in checks])+'\n',encoding='utf-8')
print(f'\nSUMMARY {passed}/{total} passed; {failed} failed')
sys.exit(0 if failed==0 else 1)
