from pathlib import Path
import re,json,time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
ROOT=Path(__file__).resolve().parent
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link[^>]+href="(?:styles\.css[^\"]*|manifest\.webmanifest|favicon-[^\"]*|apple-touch-icon\.png)"[^>]*>','',html)
html=re.sub(r'<script src="[^"]+"></script>','',html)
app=(ROOT/'app.js').read_text(encoding='utf-8')
hook="window.__LABOS_V1094_TEST__={planningHealthModelV1094,filteredPlanningHealthV1094,isoWeekPartsV1094,renderPlanning,planningSwimlane,renderRequestingTeamsConfigV1089,controlPlanApprovalState,render,nav,requestingTeamModalV1089,v1094OpenTieredPlanner,v1094EscalationChooser};window.__LABOS_V1095_TEST__={v1078ManualTaskDefinitions,workflowSubstepsV1066,workspaceSchedule,workspaceFlow,v1095ReconcilePlanningDefinitionsOnLoad};window.addEventListener('DOMContentLoaded',init);"
app=app.replace("window.addEventListener('DOMContentLoaded',init);",hook)
out={}
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=b.new_page(viewport={'width':1800,'height':1100}); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html); page.add_style_tag(content=(ROOT/'styles.css').read_text(encoding='utf-8'))
    for f in ['core.js','demo-data.js','repository.js','services.js']: page.add_script_tag(content=(ROOT/f).read_text(encoding='utf-8'))
    page.add_script_tag(content=app); page.evaluate("window.dispatchEvent(new Event('DOMContentLoaded'))"); page.wait_for_function("window.__PROTOLAB_READY__ === true",timeout=30000)

    # ISO week boundary proof: Friday 1 Jan 2027 belongs to ISO week 53 of 2026.
    out['isoBoundary']=page.evaluate("__LABOS_V1094_TEST__.isoWeekPartsV1094(new Date(2027,0,1))")
    out['syntheticLateDays']=page.evaluate("(()=>{const open=ProtoLabApp.state.requests.filter(r=>!['DELIVERED','CLOSED','RELEASED','ARCHIVED'].includes(r.status)); const r=open[0], old=r.forecastDate; r.forecastDate=new Date(new Date(r.requiredDate).getTime()+5*86400000).toISOString().slice(0,10); const v=__LABOS_V1094_TEST__.planningHealthModelV1094(open).totalDaysLate; r.forecastDate=old; return v})()")

    page.evaluate("ProtoLabApp.currentView='planning'; ProtoLabApp.filters.planView='portfolio'; ProtoLabApp.filters.planHealth='all'; __LABOS_V1094_TEST__.render();")
    page.wait_for_timeout(150)
    out['planningText']=page.locator('#page').inner_text()
    out['maxPipelineProbability']=page.evaluate("Math.max(0,...(ProtoLabApp.state.pipelineProjects||[]).map(x=>Number(x.probability||0)))")
    out['hasDetails']='Detailed bookings and estimate basis' in out['planningText']
    out['totalLateTile']=page.locator('[data-v1094-health-filter="lateDays"]').count()
    out['allTile']=page.locator('[data-v1094-health-filter="all"]').count()
    out['allTileValue']=page.locator('[data-v1094-health-filter="all"] .value').inner_text()
    out['modelOpenCount']=str(page.evaluate("__LABOS_V1094_TEST__.planningHealthModelV1094().all"))
    out['calendarMonths']=page.locator('.swim-month-group-v1094').all_inner_texts()
    out['calendarWeeks']=page.locator('.swim-week-group-v1094').all_inner_texts()
    out['calendarDates']=page.locator('.swim-date-v1094').all_inner_texts()[:10]
    out['calendarGroupedLayer']=page.locator('.calendar-groups-v1094').count()
    out['calendarTodayHeaders']=page.locator('.calendar-day-v1094').count()

    # Formerly-yellow information tile now has an actual filter action even when count=0.
    tile=page.locator('[data-v1094-health-filter="movement"]'); out['movementTile']=tile.count(); tile.click(); page.wait_for_timeout(50)
    out['activeFilter']=page.evaluate("ProtoLabApp.filters.planHealth")
    out['movementActiveClass']='active' in (tile.get_attribute('class') or '')
    out['healthText']=page.locator('#planning-commitment-health-v1094').inner_text()

    # Main AUTO PLAN is visibly tiered and Escalation is available.
    out['autoButtonText']=page.locator('[data-plan-portfolio]').first.inner_text()
    out['escalationButton']=page.locator('[data-v1094-escalation]').count()
    page.locator('[data-plan-portfolio]').first.click()
    try:
        page.wait_for_function("document.querySelectorAll('.planner-tier-v1094').length===3 || /safety stop/i.test(document.querySelector('#modalRoot')?.innerText||'')",timeout=20000)
    except PlaywrightTimeoutError:
        pass
    out['plannerModal']=page.locator('#modalRoot').inner_text() if page.locator('#modalRoot').count() else ''
    out['tierCards']=page.locator('.planner-tier-v1094').count()
    out['rawHorizonLeak']='no conflict-free slot exists within the controlled planning horizon' in out['plannerModal'].lower()
    out['multiYearBestLeak']=bool(re.search(r'best feasible.{0,80}\b20(?:2[89]|3\d)\b',out['plannerModal'],re.I|re.S))

    if page.locator('[data-modal-close]').count(): page.locator('[data-modal-close]').first.click(); page.wait_for_timeout(50)

    # Project-team authority surface.
    page.evaluate("ProtoLabApp.identity.switchRole('administrator'); ProtoLabApp.currentView='admin'; __LABOS_V1094_TEST__.render();")
    page.wait_for_timeout(100)
    out['teamConfig']=page.locator('#config-requesting-teams-v1089').inner_text() if page.locator('#config-requesting-teams-v1089').count() else ''
    page.locator('[data-v1089-edit-team]').first.click(); page.wait_for_timeout(80)
    out['teamModal']=page.locator('#modalRoot').inner_text()
    out['identitySourceSelect']=page.locator('#v1094IdentityProvider').count()
    out['principalKeyFields']=page.locator('[data-v1094-principal-key]').count()
    out['approvalRightBoxes']=page.locator('[data-v1094-right]').count()
    out['teamAuthority']=page.evaluate("(()=>{const state=ProtoLabApp.state,r=state.requests.find(x=>x.engineeringTeamId)||state.requests[0],t=ProtoLab.projectTeamForRequest(state,r),q=state.users.find(u=>u.role==='quality'); if(!t||!q)return {ok:false}; const old={enabled:t.roleGovernanceEnabled,bindings:JSON.parse(JSON.stringify(t.roleBindings||[]))}; t.roleGovernanceEnabled=true;t.roleBindings=[{id:'TEST',principalId:q.id,principalName:q.name,identityProvider:'sso',externalPrincipalId:'quality@example.test',roleIds:['quality'],approvalRights:['controlplan:approve']}]; const assignee=ProtoLab.resolveProjectTeamAssignee(state,r,'quality','controlplan:approve');const allowed=ProtoLab.projectTeamUserCanApprove(state,r,q.id,'quality','controlplan:approve');const other=state.users.find(u=>u.id!==q.id);const denied=!ProtoLab.projectTeamUserCanApprove(state,r,other.id,'quality','controlplan:approve');t.roleGovernanceEnabled=old.enabled;t.roleBindings=old.bindings;return {ok:assignee?.id===q.id&&allowed&&denied,assignee:assignee?.name}})()")

    # Planner engine behavior on a clean demo copy, measured outside live state.
    out['engine']=page.evaluate("""(()=>{
      const state=ProtoLab.createDemoState();
      ProtoLab.ensurePlanningModel(state); ProtoLab.ensureEnterpriseModel(state); ProtoLab.ensurePlanningCapabilityModelV1068?.(state);
      const t0=performance.now(); const pack=ProtoLab.buildAutoPlanTiersV1094(state,{}); const elapsed=Math.round((performance.now()-t0)*10)/10;
      const eligible=pack.candidates.filter(x=>x.eligible).map(x=>x.tier);
      const allCandidates=pack.candidates.map(x=>({tier:x.tier,ok:!!x.candidate?.ok,eligible:!!x.eligible,score:x.candidate?.metrics?.score??null,worsened:x.candidate?.worsened?.length||0,fail:x.candidate?.failures?.[0]?.code||null}));
      const ref=[pack.candidates.find(x=>x.tier==='green'),pack.candidates.find(x=>x.tier==='yellow')].filter(x=>x?.candidate?.ok).map(x=>x.candidate.metrics.score).sort((a,b)=>a-b)[0] ?? pack.baseline.score;
      const red=pack.candidates.find(x=>x.tier==='red');
      const redRule=!red?.eligible || (red.candidate.metrics.score < ref && red.candidate.worsened.length>0);
      const forecasts=(pack.recommended?.candidate?.state?.requests||[]).map(r=>r.forecastDate).filter(Boolean);
      const maxYear=forecasts.length?Math.max(...forecasts.map(x=>Number(String(x).slice(0,4)))):null;
      return {elapsed,eligible,recommended:pack.recommended?.tier||null,allCandidates,redRule,maxYear,suggestions:(pack.suggestions||[]).length,baseline:pack.baseline};
    })()""")

    # Adversarial horizon guard: a long lab closure must stop safely rather than inventing a remote year.
    out['horizonGuard']=page.evaluate("""(()=>{
      const state=ProtoLab.createDemoState(); ProtoLab.ensurePlanningModel(state); ProtoLab.ensureEnterpriseModel(state); ProtoLab.ensurePlanningCapabilityModelV1068?.(state);
      const target=(state.requests||[]).find(r=>!['DELIVERED','CLOSED','RELEASED','ARCHIVED'].includes(r.status));
      const before=JSON.stringify(state.bookings||[]), today=ProtoLab.todayISO(), start=today+'T00:00:00.000Z', d=new Date(today+'T00:00:00.000Z'); d.setUTCDate(d.getUTCDate()+900);
      state.settings=state.settings||{}; state.settings.planningHorizonDays=45; state.settings.planningRecoveryDays=30;
      state.planningEvents=state.planningEvents||[]; state.planningEvents.push({id:'STRESS-CLOSURE',active:true,type:'Lab closure',scope:'lab',start,end:d.toISOString(),reason:'Adversarial horizon guard',owner:'Verification'});
      const pack=ProtoLab.buildAutoPlanTiersV1094(state,{targetRequestId:target.id});
      const errors=pack.candidates.flatMap(x=>x.candidate?.failures||[]).map(x=>({code:x.code,error:x.error,horizon:x.details?.horizonEnd||null}));
      const raw=errors.map(x=>x.error||'').join(' | ').toLowerCase(); const forecasts=(state.requests||[]).map(r=>r.forecastDate).filter(Boolean);
      return {recommended:pack.recommended?.tier||null,eligible:pack.candidates.filter(x=>x.eligible).map(x=>x.tier),errors,rawLeak:raw.includes('no conflict-free slot exists within the controlled planning horizon'),maxYear:forecasts.length?Math.max(...forecasts.map(x=>Number(String(x).slice(0,4)))):null,liveBookingsUnchanged:before===JSON.stringify(state.bookings||[])};
    })()""")

    # Escalation must be target-first, valid and expose downstream impact rather than silently moving work.
    out['escalationEngine']=page.evaluate("""(()=>{
      const state=ProtoLab.createDemoState(); ProtoLab.ensurePlanningModel(state); ProtoLab.ensureEnterpriseModel(state); ProtoLab.ensurePlanningCapabilityModelV1068?.(state);
      const target=(state.requests||[]).filter(r=>!['DELIVERED','CLOSED','RELEASED','ARCHIVED'].includes(r.status)).sort((a,b)=>String(a.requiredDate||'9999').localeCompare(String(b.requiredDate||'9999')))[0];
      const t0=performance.now(); const result=ProtoLab.buildEscalationPlanV1094(state,target.id); const elapsed=Math.round((performance.now()-t0)*10)/10;
      if(!result.ok)return {ok:false,elapsed,reason:result.reason,targetId:target.id};
      const inv=ProtoLab.validateInvariants(result.candidate.state); const audit=ProtoLab.planningIntegrityAudit(result.candidate.state); return {ok:true,elapsed,targetId:target.id,targetBefore:result.targetBefore,targetAfter:result.targetAfter,worsened:result.worsened.length,alternatives:result.alternatives,invariants:inv.length,collisions:(audit.collisions||[]).length,readiness:(audit.readiness||[]).length};
    })()""")

    # REV 1.0.95 canonical planning-task model: sticky, manual planner and AUTO-PLAN must agree exactly.
    out['canonicalAlignment']=page.evaluate("""(()=>{
      const state=ProtoLab.createDemoState();ProtoLab.ensurePlanningModel(state);ProtoLab.ensureEnterpriseModel(state);const r=state.requests.find(x=>!['CLOSED','DELIVERED','RELEASED','ARCHIVED'].includes(x.status));
      const old=ProtoLabApp.state;ProtoLabApp.state=state;let result;try{const canonical=ProtoLab.planningTasksForRequest(state,r),manual=__LABOS_V1095_TEST__.v1078ManualTaskDefinitions(r),sticky=__LABOS_V1095_TEST__.workflowSubstepsV1066(r,{id:'schedule'}),flow=__LABOS_V1095_TEST__.workspaceFlow(r);result={canonical:canonical.map(x=>({id:x.id,name:x.name,kind:x.kind})),manual:manual.map(x=>({id:x.id,name:x.name,kind:x.kind})),sticky:sticky.map(x=>x.label),manualIdsEqual:JSON.stringify(canonical.map(x=>x.id))===JSON.stringify(manual.map(x=>x.id)),stickyNamesEqual:canonical.every((t,i)=>sticky[i]?.label?.startsWith(t.name+' · ')),flowTestsPresent:(r.testRequirements||[]).every(t=>flow.includes(t.name)),hasFinal:canonical.at(-1)?.kind==='closeout',testNames:(r.testRequirements||[]).map(x=>x.name)}}finally{ProtoLabApp.state=old}return result;
    })()""")

    out['testIdentity']=page.evaluate("""(()=>{const s=ProtoLab.createDemoState(),r=s.requests.find(x=>!['CLOSED','DELIVERED','RELEASED'].includes(x.status));r.characterisation=['No-load speed','Operating current'];r.testRequirements=[];ProtoLab.ensureTestRequirements(s,r);const before=r.testRequirements.map(x=>({id:x.id,name:x.name}));r.characterisation=['Operating current','Thermal rise'];ProtoLab.ensureTestRequirements(s,r);const after=r.testRequirements.map(x=>({id:x.id,name:x.name}));return {before,after,retainedId:before.find(x=>x.name==='Operating current')?.id===after.find(x=>x.name==='Operating current')?.id,removedIdReused:after.some(x=>x.id===before.find(x=>x.name==='No-load speed')?.id),unique:new Set(after.map(x=>x.id)).size===after.length};})()""")

    out['staleLockGuard']=page.evaluate("""(()=>{const s=ProtoLab.createDemoState();ProtoLab.ensurePlanningModel(s);ProtoLab.ensureEnterpriseModel(s);const r=s.requests.find(x=>!['CLOSED','DELIVERED','RELEASED'].includes(x.status)),route=s.routes.find(x=>x.requestId===r.id);route.steps=[];route.confirmed=true;r.characterisation=['No-load speed'];r.testRequirements=[];ProtoLab.ensureTestRequirements(s,r);const old={...r.testRequirements[0]};r.characterisation=['Operating current'];ProtoLab.ensureTestRequirements(s,r);const cur=r.testRequirements[0],test=s.standardTests.find(t=>t.id===cur.standardTestId),cap=ProtoLab.planningCapabilityForTest(test),skill=test.competency,eq=s.equipment.find(e=>(ProtoLab.equipmentPlanningCapability?ProtoLab.equipmentPlanningCapability(e):e.capability)===cap&&(!ProtoLab.equipmentOperationalForPlanning||ProtoLab.equipmentOperationalForPlanning(e))),staff=s.staff.find(st=>st.available!==false&&((st.competencies||[]).includes(skill)||(s.trainingCertificates||[]).some(c=>c.staffId===st.id&&c.skillId===skill)));let d=new Date();d.setDate(d.getDate()+20);d.setHours(10,0,0,0);while([0,6].includes(d.getDay()))d.setDate(d.getDate()+1);s.bookings=[];s.resourceCareBookings=[];s.planningEvents=[];s.bookings.push({id:'STALE-LOCK',requestId:r.id,stepId:old.id,stepName:'Test · No-load speed',equipmentId:eq?.id||null,staffId:staff?.id||null,skillId:skill,planningCapability:cap,start:d.toISOString(),end:new Date(d.getTime()+2*3600000).toISOString(),durationHours:2,locked:true,status:'Planned',taskType:'test'});let error=null;try{new ProtoLab.PlannerService().autoPlan(s,r.id)}catch(e){error={code:e.code,message:e.message}}const live=s.requests.find(x=>x.id===r.id),coverage=ProtoLab.planningTaskCoverage(s,live),booked=(s.bookings||[]).filter(b=>b.requestId===r.id&&!ProtoLab.isHistoricalPlanningBooking(b));return {sameId:old.id===cur.id,staleKept:booked.some(b=>b.id==='STALE-LOCK'),error,coverage:{ok:coverage.ok,missing:coverage.missing.length,mismatched:coverage.mismatched.length,orphan:coverage.orphan.length},currentTest:cur.name,bookedTests:booked.filter(b=>b.taskType==='test').map(b=>b.stepName)};})()""")

    out['autoPlanCoverage']=page.evaluate("""(()=>{const s=ProtoLab.createDemoState();ProtoLab.ensurePlanningModel(s);ProtoLab.ensureEnterpriseModel(s);s.bookings=[];s.resourceCareBookings=[];s.planningEvents=[];const r=s.requests.find(x=>!['CLOSED','DELIVERED','RELEASED','ARCHIVED'].includes(x.status));let err=null;try{new ProtoLab.PlannerService().autoPlan(s,r.id)}catch(e){err={code:e.code,message:e.message}}const live=s.requests.find(x=>x.id===r.id),tasks=ProtoLab.planningTasksForRequest(s,live),coverage=ProtoLab.planningTaskCoverage(s,live),rows=(s.bookings||[]).filter(b=>b.requestId===r.id&&!ProtoLab.isHistoricalPlanningBooking(b));const testTasks=tasks.filter(x=>x.kind==='test');return {err,ok:coverage.ok,expected:tasks.length,booked:rows.length,idsEqual:JSON.stringify(tasks.map(x=>x.id).sort())===JSON.stringify(rows.map(x=>x.stepId).sort()),allDefinitionKeys:rows.every(x=>!!x.taskDefinitionKey),testIdsEqual:JSON.stringify(testTasks.map(x=>x.id).sort())===JSON.stringify(rows.filter(x=>x.taskType==='test').map(x=>x.stepId).sort()),hasCloseout:rows.some(x=>x.taskType==='closeout'&&x.stepId===`FINAL-${r.id}`)};})()""")

    out['coverageSabotage']=page.evaluate("""(()=>{const s=ProtoLab.createDemoState();ProtoLab.ensurePlanningModel(s);ProtoLab.ensureEnterpriseModel(s);s.bookings=[];s.resourceCareBookings=[];s.planningEvents=[];const r=s.requests.find(x=>!['CLOSED','DELIVERED','RELEASED','ARCHIVED'].includes(x.status));new ProtoLab.PlannerService().autoPlan(s,r.id);const before=ProtoLab.planningTaskCoverage(s,r);const victim=(s.bookings||[]).find(b=>b.requestId===r.id&&b.taskType==='test');s.bookings=s.bookings.filter(b=>b.id!==victim.id);const after=ProtoLab.planningTaskCoverage(s,r);return {before:before.ok,after:after.ok,missing:after.missing.map(x=>x.id),victim:victim.stepId};})()""")

    out['developmentDefinition']=page.evaluate("""(()=>{const s=ProtoLab.createDemoState(),r=s.requests.find(x=>!['CLOSED','DELIVERED','RELEASED'].includes(x.status));const route=s.routes.find(x=>x.requestId===r.id);route.steps=[];r.characterisation=['Custom impossible test ZZ'];r.testRequirements=[];ProtoLab.ensureTestRequirements(s,r);const before=ProtoLab.planningTasksForRequest(s,r).map(x=>({id:x.id,kind:x.kind,subkind:x.subkind||null})),tr=r.testRequirements[0];tr.developmentReleased=true;tr.status='Released developed method';const after=ProtoLab.planningTasksForRequest(s,r).map(x=>({id:x.id,kind:x.kind,subkind:x.subkind||null}));return {before,after,hadDevelopment:before.some(x=>x.subkind==='test-development'),releasedDropsDevelopment:!after.some(x=>x.subkind==='test-development')&&after.some(x=>x.id===r.testRequirements[0].id&&x.kind==='test')};})()""")

    out['optionalDefinition']=page.evaluate("""(()=>{const s=ProtoLab.createDemoState(),r=s.requests.find(x=>!['CLOSED','DELIVERED','RELEASED'].includes(x.status)),route=s.routes.find(x=>x.requestId===r.id),opt=route.steps[0];opt.optional=true;opt.status='Planned';delete opt.completedAt;const tasks=ProtoLab.planningTasksForRequest(s,r);return {found:true,optionalId:opt.id,inCanonical:tasks.some(t=>t.id===opt.id),requiredRouteCount:route.steps.filter(x=>!x.optional&&!x.completedAt&&!/complete|completed|done|skipped/i.test(String(x.status||''))).length,processTaskCount:tasks.filter(x=>x.kind==='process').length};})()""")

    out['uiCoverage']=page.evaluate("""(()=>{const state=ProtoLab.createDemoState();ProtoLab.ensurePlanningModel(state);ProtoLab.ensureEnterpriseModel(state);state.bookings=[];state.resourceCareBookings=[];state.planningEvents=[];const r=state.requests.find(x=>!['CLOSED','DELIVERED','RELEASED','ARCHIVED'].includes(x.status));new ProtoLab.PlannerService().autoPlan(state,r.id);const live=state.requests.find(x=>x.id===r.id),old=ProtoLabApp.state;ProtoLabApp.state=state;let html,sticky;try{html=__LABOS_V1095_TEST__.workspaceSchedule(live);sticky=__LABOS_V1095_TEST__.workflowSubstepsV1066(live,{id:'schedule'})}finally{ProtoLabApp.state=old}const tasks=ProtoLab.planningTasksForRequest(state,live);return {completeText:html.includes('Plan coverage complete.'),coverageText:html.includes(`${tasks.length}/${tasks.length} required tasks scheduled`),stickyAllDone:sticky.length===tasks.length&&sticky.every(x=>x.done),stickyMatches:tasks.every((t,i)=>sticky[i]?.label?.startsWith(t.name+' · '))};})()""")

    out['pageErrors']=errors
    b.close()

(ROOT/'VERIFICATION_BROWSER_v1.0.95.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
print(json.dumps(out,indent=2))
assert out['isoBoundary']=={'year':2026,'week':53}
assert out['syntheticLateDays']>=5
assert not out['hasDetails']
assert out['maxPipelineProbability']<=1 and '7000%' not in out['planningText']
assert out['totalLateTile']==1 and out['allTile']==1
assert out['allTileValue']==out['modelOpenCount']
assert out['calendarGroupedLayer']==1 and out['calendarTodayHeaders']>0
assert out['calendarMonths'] and all(re.match(r'^[A-Z]{3}(?: 20\d{2})?$',x) for x in out['calendarMonths']) and any(re.search(r'\b20\d{2}\b',x) for x in out['calendarMonths'])
assert all(re.match(r'^CW \d{2} · 20\d{2}$',x) for x in out['calendarWeeks'])
assert all(re.match(r'^\d{2}$',x) for x in out['calendarDates'])
assert out['movementTile']==1 and out['activeFilter']=='movement' and out['movementActiveClass']
assert 'AUTO PLAN' in out['autoButtonText'].upper() and out['escalationButton']==1
assert out['tierCards']==3
assert not out['rawHorizonLeak'] and not out['multiYearBestLeak']
assert 'Project Teams, Roles & Approval Rights' in out['teamConfig']
assert out['identitySourceSelect']==1 and out['principalKeyFields']>0 and out['approvalRightBoxes']>0
assert 'External principal key' in out['teamModal'] and 'approval rights' in out['teamModal'].lower()
assert out['teamAuthority']['ok']
assert out['engine']['redRule']
assert out['engine']['recommended'] in ('green','yellow','red')
assert out['engine']['maxYear'] is None or out['engine']['maxYear'] <= 2027
assert out['horizonGuard']['recommended'] is None and not out['horizonGuard']['eligible']
assert not out['horizonGuard']['rawLeak'] and out['horizonGuard']['liveBookingsUnchanged']
assert all(x['code'] in ('CAPACITY_UNRESOLVABLE','READINESS_SLOT_UNRESOLVABLE','RECOVERY_REQUIRED') for x in out['horizonGuard']['errors'])
assert out['escalationEngine']['ok']
assert out['escalationEngine']['invariants']==0 and out['escalationEngine']['collisions']==0 and out['escalationEngine']['readiness']==0
assert out['canonicalAlignment']['manualIdsEqual'] and out['canonicalAlignment']['stickyNamesEqual'] and out['canonicalAlignment']['flowTestsPresent'] and out['canonicalAlignment']['hasFinal']
assert out['testIdentity']['retainedId'] and not out['testIdentity']['removedIdReused'] and out['testIdentity']['unique']
assert not out['staleLockGuard']['sameId'] and not out['staleLockGuard']['staleKept'] and out['staleLockGuard']['error'] is None and out['staleLockGuard']['coverage']['ok'] and out['staleLockGuard']['bookedTests']==['Test · Operating current']
assert out['autoPlanCoverage']['err'] is None and out['autoPlanCoverage']['ok'] and out['autoPlanCoverage']['expected']==out['autoPlanCoverage']['booked'] and out['autoPlanCoverage']['idsEqual'] and out['autoPlanCoverage']['allDefinitionKeys'] and out['autoPlanCoverage']['testIdsEqual'] and out['autoPlanCoverage']['hasCloseout']
assert out['coverageSabotage']['before'] and not out['coverageSabotage']['after'] and out['coverageSabotage']['victim'] in out['coverageSabotage']['missing']
assert out['developmentDefinition']['hadDevelopment'] and out['developmentDefinition']['releasedDropsDevelopment']
assert (not out['optionalDefinition']['found']) or (not out['optionalDefinition']['inCanonical'])
assert out['uiCoverage']['completeText'] and out['uiCoverage']['coverageText'] and out['uiCoverage']['stickyAllDone'] and out['uiCoverage']['stickyMatches']
assert not out['pageErrors']
