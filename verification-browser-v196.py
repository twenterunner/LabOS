from pathlib import Path
import re,json,time
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
ROOT=Path(__file__).resolve().parent
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link[^>]+href="(?:styles\.css[^\"]*|manifest\.webmanifest|favicon-[^\"]*|apple-touch-icon\.png)"[^>]*>','',html)
html=re.sub(r'<script src="[^"]+"></script>','',html)
app=(ROOT/'app.js').read_text(encoding='utf-8')
hook="window.__LABOS_V1096_TEST__={render,planningSwimlane,workspaceMiniPlanningSwimlaneV1066,workspaceSchedule,workspaceFlow,workflowSubstepsV1066,v1078ManualTaskDefinitions,isoWeekPartsV1094,v1096FitRange,v1096TimelineRange,v1096TimelineAxis,filteredPlanningHealthV1094,planningHealthModelV1094,v1096GuidedBlockerModal,v1094OpenTieredPlanner,v1094EscalationChooser};window.addEventListener('DOMContentLoaded',init);"
app=app.replace("window.addEventListener('DOMContentLoaded',init);",hook)
out={}
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=b.new_page(viewport={'width':1900,'height':1100}); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html); page.add_style_tag(content=(ROOT/'styles.css').read_text(encoding='utf-8'))
    for f in ['core.js','demo-data.js','repository.js','services.js']: page.add_script_tag(content=(ROOT/f).read_text(encoding='utf-8'))
    page.add_script_tag(content=app); page.evaluate("window.dispatchEvent(new Event('DOMContentLoaded'))"); page.wait_for_function("window.__PROTOLAB_READY__ === true",timeout=30000)

    # Main planner universal timeline.
    page.evaluate("ProtoLabApp.currentView='planning'; ProtoLabApp.filters.planView='portfolio'; ProtoLabApp.filters.planHealth='all'; __LABOS_V1096_TEST__.render();")
    page.wait_for_timeout(180)
    out['timelineMainCount']=page.locator('.planning-visual-main .universal-timeline-v1096').count()
    out['horizonInput']=page.locator('#planWeeks').count()
    out['legacyGenericZoom']=page.locator('.swim-zoom-v1078').count()
    out['legacyStickyZoom']=page.locator('.workspace-plan-zoom-v1069').count()
    out['toolbarButtons']=page.locator('.planning-visual-main .timeline-toolbar-v1096 button').all_inner_texts()
    out['toolbarLayout']=page.evaluate("(()=>{const t=document.querySelector('.planning-visual-main .timeline-toolbar-v1096'),bs=[...t.querySelectorAll('button')].map(x=>x.getBoundingClientRect());return {justify:getComputedStyle(t).justifyContent,left:t.getBoundingClientRect().left,buttons:bs.map(x=>x.left)}})()")
    out['fullWidth']=page.evaluate("(()=>{const s=document.querySelector('.planning-visual-main .timeline-scroll-v1096'),b=document.querySelector('.planning-visual-main .timeline-board-v1096'),p=s.parentElement;return {scrollClient:s.clientWidth,scrollWidth:s.scrollWidth,boardClient:b.clientWidth,boardWidth:b.getBoundingClientRect().width,parent:p.getBoundingClientRect().width,overflow:getComputedStyle(s).overflowX}})()")
    main=page.locator('.planning-visual-main .universal-timeline-v1096').first
    out['fitInitial']=main.get_attribute('data-range-start')==main.get_attribute('data-fit-start') and main.get_attribute('data-range-end')==main.get_attribute('data-fit-end')
    def days_visible():
        return page.evaluate("(()=>{const x=document.querySelector('.planning-visual-main .universal-timeline-v1096');return (+new Date(x.dataset.rangeEnd)-+new Date(x.dataset.rangeStart))/86400000})()")
    d0=days_visible(); page.locator('.planning-visual-main [data-v1096-timeline-zoom="in"]').click(); page.wait_for_timeout(100); d1=days_visible()
    page.locator('.planning-visual-main [data-v1096-timeline-zoom="in"]').click(); page.wait_for_timeout(100); d2=days_visible()
    page.locator('.planning-visual-main [data-v1096-timeline-zoom="out"]').click(); page.wait_for_timeout(100); d3=days_visible()
    page.locator('.planning-visual-main [data-v1096-timeline-zoom="fit"]').click(); page.wait_for_timeout(100); df=days_visible()
    out['zoomSemantics']={'fit':d0,'minus1':d1,'minus2':d2,'plus':d3,'fitRestored':df}
    # Zoom in until daily formatting is intentionally visible, then inspect grouped header.
    while days_visible()>28.2:
        page.locator('.planning-visual-main [data-v1096-timeline-zoom="in"]').click(); page.wait_for_timeout(60)
    out['calendarMonths']=page.locator('.planning-visual-main .timeline-month-cell-v1096').all_inner_texts()
    out['calendarWeeks']=page.locator('.planning-visual-main .timeline-week-cell-v1096').all_inner_texts()
    out['calendarDayCount']=page.locator('.planning-visual-main .timeline-day-cell-v1096').count()
    out['calendarDaySamples']=page.locator('.planning-visual-main .timeline-day-cell-v1096').all_inner_texts()[:5]
    out['calendarAxisRows']=page.locator('.planning-visual-main .timeline-month-row-v1096').count()+page.locator('.planning-visual-main .timeline-week-row-v1096').count()+page.locator('.planning-visual-main .timeline-day-row-v1096').count()
    out['widthAtDetailedZoom']=page.evaluate("(()=>{const s=document.querySelector('.planning-visual-main .timeline-scroll-v1096'),b=document.querySelector('.planning-visual-main .timeline-board-v1096');return {c:s.clientWidth,sw:s.scrollWidth,b:b.clientWidth,bw:b.scrollWidth}})()")
    page.locator('.planning-visual-main').screenshot(path=str(ROOT/'REV1096_UNIVERSAL_TIMELINE_PROOF.png'))
    out['isoBoundary']=page.evaluate("__LABOS_V1096_TEST__.isoWeekPartsV1094(new Date(2027,0,1))")

    # All six tiles are true swimlane population filters, not just card filters.
    filter_results={}
    for key in ['all','onTime','late','lateDays','movement','unplanned']:
        loc=page.locator(f'[data-v1094-health-filter="{key}"]')
        if loc.count()==0:
            filter_results[key]={'tile':False}; continue
        loc.click(); page.wait_for_timeout(90)
        actual=page.locator('.planning-visual-main [data-swim-request]:not([data-swim-request=""])').count()
        expected=page.evaluate(f"__LABOS_V1096_TEST__.filteredPlanningHealthV1094(null,'{key}').length")
        filter_results[key]={'tile':True,'active':page.evaluate('ProtoLabApp.filters.planHealth'),'actual':actual,'expected':expected}
    out['filters']=filter_results

    # An active committed build with no valid bookings must remain visible as unresolved.
    out['unplannedCommittedVisible']=page.evaluate("""(()=>{const old=ProtoLab.deepClone(ProtoLabApp.state),r=ProtoLabApp.state.requests.find(x=>!['DELIVERED','CLOSED','RELEASED','ARCHIVED'].includes(x.status));ProtoLabApp.state.bookings=(ProtoLabApp.state.bookings||[]).filter(b=>b.requestId!==r.id);r.currentCommitmentDate=r.currentCommitmentDate||r.requiredDate;r.forecastDate=null;r.triage=r.triage||{};r.triage.planQuality='Needs replanning';ProtoLabApp.filters.planHealth='all';__LABOS_V1096_TEST__.render();const lane=document.querySelector(`[data-swim-request="${r.id}"]`),txt=lane?.nextElementSibling?.innerText||'';const result={id:r.id,visible:!!lane,unresolved:/Schedule unresolved/i.test(txt)||/Needs replanning/i.test(lane?.innerText||'')};ProtoLabApp.state=old;ProtoLabApp.filters.planHealth='all';__LABOS_V1096_TEST__.render();return result})()""")
    page.wait_for_timeout(80)

    # Build-specific page and sticky cockpit use the exact same universal timeline contract.
    out['otherTimelineContexts']=page.evaluate("""(()=>{const r=ProtoLabApp.state.requests.find(x=>!['DELIVERED','CLOSED','RELEASED','ARCHIVED'].includes(x.status));const a=document.createElement('div'),b=document.createElement('div');a.innerHTML=__LABOS_V1096_TEST__.workspaceSchedule(r);b.innerHTML=__LABOS_V1096_TEST__.workspaceMiniPlanningSwimlaneV1066(r);const result={id:r.id,buildUniversal:a.querySelectorAll('.universal-timeline-v1096').length,stickyUniversal:b.querySelectorAll('.universal-timeline-v1096').length,buildToolbar:[...a.querySelectorAll('.timeline-toolbar-v1096 button')].map(x=>x.textContent.trim()),stickyToolbar:[...b.querySelectorAll('.timeline-toolbar-v1096 button')].map(x=>x.textContent.trim()),oldStickyZoom:b.querySelectorAll('.workspace-plan-zoom-v1069').length,horizon:a.querySelectorAll('#planWeeks').length+b.querySelectorAll('#planWeeks').length};return result})()""")

    # Canonical planning definition remains one across auto/manual/process UI.
    out['canonicalAlignment']=page.evaluate("""(()=>{const state=ProtoLab.createDemoState();ProtoLab.ensurePlanningModel(state);ProtoLab.ensureEnterpriseModel(state);const r=state.requests.find(x=>!['CLOSED','DELIVERED','RELEASED','ARCHIVED'].includes(x.status));const old=ProtoLabApp.state;ProtoLabApp.state=state;let result;try{const canonical=ProtoLab.planningTasksForRequest(state,r),manual=__LABOS_V1096_TEST__.v1078ManualTaskDefinitions(r),sticky=__LABOS_V1096_TEST__.workflowSubstepsV1066(r,{id:'schedule'}),flow=__LABOS_V1096_TEST__.workspaceFlow(r);result={manualIdsEqual:JSON.stringify(canonical.map(x=>x.id))===JSON.stringify(manual.map(x=>x.id)),stickyNamesEqual:canonical.every((t,i)=>sticky[i]?.label?.startsWith(t.name+' · ')),flowTestsPresent:(r.testRequirements||[]).every(t=>flow.includes(t.name)),hasFinal:canonical.at(-1)?.kind==='closeout',count:canonical.length}}finally{ProtoLabApp.state=old}return result})()""")

    # AUTO PLAN: complete selectable tiers only; blocked partial protected candidate stays diagnostic, never selectable.
    out['autoEngine']=page.evaluate("""(()=>{const s=ProtoLab.createDemoState();ProtoLab.ensurePlanningModel(s);ProtoLab.ensureEnterpriseModel(s);ProtoLab.ensurePlanningCapabilityModelV1068?.(s);const t0=performance.now(),pack=ProtoLab.buildAutoPlanTiersV1096(s,{}),elapsed=Math.round((performance.now()-t0)*10)/10;const rows=pack.candidates.map(x=>({tier:x.tier,eligible:x.eligible,ok:!!x.candidate?.ok,complete:!!x.candidate?.complete,blocked:x.candidate?.blockedCount||0,score:x.candidate?.metrics?.score??null,worsened:x.candidate?.worsened?.length||0})),red=rows.find(x=>x.tier==='red'),protectedScores=rows.filter(x=>['green','yellow'].includes(x.tier)&&x.complete).map(x=>x.score),ref=protectedScores.length?Math.min(...protectedScores):pack.baseline.score;return {elapsed,recommended:pack.recommended?.tier||null,rows,eligible:rows.filter(x=>x.eligible).map(x=>x.tier),allSelectableComplete:rows.filter(x=>x.eligible).every(x=>x.complete),redRule:!red.eligible||(red.score<ref&&red.worsened>0),blockers:pack.allBlockers?.length||0}})()""")

    # Protected failure isolation: one impossible manual window cannot abort feasible sibling builds.
    out['failureIsolation']=page.evaluate("""(()=>{const s=ProtoLab.createDemoState();ProtoLab.ensurePlanningModel(s);ProtoLab.ensureEnterpriseModel(s);ProtoLab.ensurePlanningCapabilityModelV1068?.(s);const open=s.requests.filter(r=>!['DELIVERED','CLOSED','RELEASED','ARCHIVED'].includes(r.status));const victim=open[0],task=ProtoLab.planningTasksForRequest(s,victim)[0];let d=new Date();while(d.getDay()!==6)d.setDate(d.getDate()+1);victim.planningConstraintsV1096={byTask:{[task.id]:{date:d.toISOString().slice(0,10),period:'AM'}},source:'verification'};const c=ProtoLab.PlanningEngineV1096.planPortfolioCandidate(s,{mode:'protected',allowTraining:true,allowReadiness:true,orderMode:'priorityDue',requestIds:open.slice(0,4).map(x=>x.id)});return {ok:c.ok,partial:c.partial,blocked:c.blockedCount,planned:c.plannedCount,selected:c.selectedCount,victimBlocked:c.blockers.some(x=>x.requestId===victim.id),liveUnchanged:(s.bookings||[]).every(b=>!b.manualConstraintV1096)}})()""")

    # Manual planning routes constraints through the same PlannerService kernel and integrity gate.
    out['manualUnified']=page.evaluate("""(()=>{const s=ProtoLab.createDemoState();ProtoLab.ensurePlanningModel(s);ProtoLab.ensureEnterpriseModel(s);s.bookings=[];s.resourceCareBookings=[];s.planningEvents=[];const r=s.requests.find(x=>!['DELIVERED','CLOSED','RELEASED','ARCHIVED'].includes(x.status));const a=ProtoLab.PlanningEngineV1096.planRequest(s,r.id,{allowTraining:true,allowReadiness:true});if(!a.ok)return {ok:false,stage:'auto',failure:a.failure};const b=(a.state.bookings||[]).find(x=>x.requestId===r.id&&!ProtoLab.isHistoricalPlanningBooking(x));const dt=new Date(b.start),sel=[{stepId:b.stepId,date:b.start.slice(0,10),period:dt.getHours()>=13?'PM':'AM',equipmentId:b.equipmentId||null,staffId:b.staffId||null}],m=ProtoLab.PlanningEngineV1096.manualPlan(s,r.id,sel);if(!m.ok)return {ok:false,stage:'manual',failure:m.failure,errors:m.errors};const cov=ProtoLab.planningTaskCoverage(m.next,r.id),audit=ProtoLab.planningIntegrityAudit(m.next);return {ok:true,constraints:m.constraints,coverage:cov.ok,manualMarked:m.created.some(x=>x.stepId===b.stepId&&x.manualConstraintV1096&&x.locked),collisions:(audit.collisions||[]).length,readiness:(audit.readiness||[]).length,quality:m.next.requests.find(x=>x.id===r.id)?.triage?.planQuality}})()""")

    # Escalation must actually produce a target-first plan and valid recovered portfolio in a feasible case.
    out['escalation']=page.evaluate("""(()=>{const s=ProtoLab.createDemoState();ProtoLab.ensurePlanningModel(s);ProtoLab.ensureEnterpriseModel(s);ProtoLab.ensurePlanningCapabilityModelV1068?.(s);const target=s.requests.filter(r=>!['DELIVERED','CLOSED','RELEASED','ARCHIVED'].includes(r.status)).sort((a,b)=>String(a.requiredDate||'9999').localeCompare(String(b.requiredDate||'9999')))[0],t0=performance.now(),x=ProtoLab.buildEscalationPlanV1096(s,target.id),elapsed=Math.round((performance.now()-t0)*10)/10;if(!x.ok)return {ok:false,elapsed,reason:x.reason,target:target.id};const inv=ProtoLab.validateInvariants(x.candidate.state),audit=ProtoLab.planningIntegrityAudit(x.candidate.state);return {ok:true,elapsed,target:target.id,before:x.targetBefore,after:x.targetAfter,worsened:x.worsened.length,alternatives:x.alternatives,invariants:inv.length,collisions:(audit.collisions||[]).length,readiness:(audit.readiness||[]).length}})()""")

    # Horizon guard: extreme closure returns controlled recovery, never a remote fake best date, and never mutates live plan.
    out['horizonGuard']=page.evaluate("""(()=>{const s=ProtoLab.createDemoState();ProtoLab.ensurePlanningModel(s);ProtoLab.ensureEnterpriseModel(s);ProtoLab.ensurePlanningCapabilityModelV1068?.(s);const target=s.requests.find(r=>!['DELIVERED','CLOSED','RELEASED','ARCHIVED'].includes(r.status)),before=JSON.stringify(s.bookings||[]),today=ProtoLab.todayISO(),d=new Date(today+'T00:00:00.000Z');d.setUTCDate(d.getUTCDate()+900);s.settings=s.settings||{};s.settings.planningHorizonDays=45;s.settings.planningRecoveryDays=30;s.planningEvents=s.planningEvents||[];s.planningEvents.push({id:'V196-CLOSE',active:true,type:'Lab closure',scope:'lab',start:today+'T00:00:00.000Z',end:d.toISOString(),reason:'Adversarial closure'});const p=ProtoLab.buildAutoPlanTiersV1096(s,{targetRequestId:target.id}),errs=p.candidates.flatMap(x=>x.candidate?.failures||[]),raw=errs.map(x=>x.error||'').join(' ').toLowerCase();return {recommended:p.recommended?.tier||null,eligible:p.candidates.filter(x=>x.eligible).map(x=>x.tier),codes:errs.map(x=>x.code),rawRemote:raw.includes('no conflict-free slot exists within the controlled planning horizon')||/best feasible.{0,40}20(?:2[89]|3\\d)/.test(raw),unchanged:before===JSON.stringify(s.bookings||[])}})()""")

    # Guided blocker must expose an executable workflow, not just Close.
    out['guidedRecovery']=page.evaluate("""(()=>{const s=ProtoLabApp.state,r=s.requests.find(x=>!['DELIVERED','CLOSED','RELEASED','ARCHIVED'].includes(x.status)),f={requestId:r.id,code:'CAPACITY_UNRESOLVABLE',error:'Verification blocker',details:{taskName:'Programming / Flashing',capability:'Programming',horizonEnd:new Date(Date.now()+30*86400000).toISOString(),requestedDate:r.requiredDate}};__LABOS_V1096_TEST__.v1096GuidedBlockerModal(r.id,{...f,diagnosis:ProtoLab.planningFailureDiagnosisV1096(s,f)});return r.id})()""")
    page.wait_for_timeout(60)
    recovery_text=page.locator('#modalRoot').inner_text()
    out['guidedRecoveryText']=recovery_text
    out['guidedRecoveryActions']=page.locator('#modalRoot button').all_inner_texts()
    if page.locator('[data-modal-close]').count(): page.locator('[data-modal-close]').first.click()

    # Live AUTO-PLAN modal must have reviewable or guided actions, never three inert tiers and Close only.
    page.evaluate("ProtoLabApp.currentView='planning'; ProtoLabApp.filters.planView='portfolio'; ProtoLabApp.filters.planHealth='all'; __LABOS_V1096_TEST__.render();")
    page.wait_for_timeout(70); page.locator('[data-plan-portfolio]').first.click()
    try: page.wait_for_function("document.querySelectorAll('.planner-tier-v1094').length===3",timeout=20000)
    except PlaywrightTimeoutError: pass
    out['autoModalTierCount']=page.locator('.planner-tier-v1094').count()
    out['autoModalActions']=page.locator('#modalRoot button').all_inner_texts()
    out['autoModalText']=page.locator('#modalRoot').inner_text()
    if page.locator('[data-modal-close]').count(): page.locator('[data-modal-close]').first.click()

    out['pageErrors']=errors
    b.close()

(ROOT/'VERIFICATION_BROWSER_v1.0.96.json').write_text(json.dumps(out,indent=2),encoding='utf-8')
print(json.dumps(out,indent=2))
# Timeline/UI contract
assert out['timelineMainCount']==1 and out['horizonInput']==0
assert out['legacyGenericZoom']==0 and out['legacyStickyZoom']==0
assert out['toolbarButtons']==['−','Fit','+']
assert out['toolbarLayout']['justify'] in ('flex-start','normal') and out['toolbarLayout']['buttons']==sorted(out['toolbarLayout']['buttons'])
assert out['fullWidth']['scrollWidth']<=out['fullWidth']['scrollClient']+2 and out['fullWidth']['boardWidth']<=out['fullWidth']['parent']+2
assert out['fitInitial']
assert out['zoomSemantics']['minus1']<out['zoomSemantics']['fit'] and out['zoomSemantics']['minus2']<out['zoomSemantics']['minus1'] and out['zoomSemantics']['plus']>out['zoomSemantics']['minus2'] and abs(out['zoomSemantics']['fitRestored']-out['zoomSemantics']['fit'])<.01
assert out['calendarMonths'] and all(re.match(r'^[A-Z]{3} 20\d{2}$',x) for x in out['calendarMonths'])
assert out['calendarWeeks'] and all(re.match(r'^CW \d{2} · 20\d{2}$',x) for x in out['calendarWeeks'])
assert out['calendarDayCount']>0 and out['calendarAxisRows']==3
assert out['widthAtDetailedZoom']['sw']<=out['widthAtDetailedZoom']['c']+2 and out['widthAtDetailedZoom']['bw']<=out['widthAtDetailedZoom']['b']+2
assert out['isoBoundary']=={'year':2026,'week':53}
assert all(v.get('tile') and v.get('active')==k and v.get('actual')==v.get('expected') for k,v in out['filters'].items())
assert out['unplannedCommittedVisible']['visible'] and out['unplannedCommittedVisible']['unresolved']
assert out['otherTimelineContexts']['buildUniversal']==1 and out['otherTimelineContexts']['stickyUniversal']==1 and out['otherTimelineContexts']['buildToolbar']==['−','Fit','+'] and out['otherTimelineContexts']['stickyToolbar']==['−','Fit','+'] and out['otherTimelineContexts']['oldStickyZoom']==0 and out['otherTimelineContexts']['horizon']==0
# One engine + integrity
assert all(out['canonicalAlignment'][k] for k in ['manualIdsEqual','stickyNamesEqual','flowTestsPresent','hasFinal'])
assert out['autoEngine']['recommended'] in ('green','yellow','red') and out['autoEngine']['allSelectableComplete'] and out['autoEngine']['redRule'] and out['autoEngine']['elapsed']<8000
assert out['failureIsolation']['ok'] and out['failureIsolation']['partial'] and out['failureIsolation']['blocked']>=1 and out['failureIsolation']['planned']>=1 and out['failureIsolation']['victimBlocked'] and out['failureIsolation']['liveUnchanged']
assert out['manualUnified']['ok'] and out['manualUnified']['coverage'] and out['manualUnified']['manualMarked'] and out['manualUnified']['collisions']==0 and out['manualUnified']['readiness']==0 and 'unified solver' in out['manualUnified']['quality'].lower()
assert out['escalation']['ok'] and out['escalation']['invariants']==0 and out['escalation']['collisions']==0 and out['escalation']['readiness']==0 and out['escalation']['elapsed']<8000
assert out['horizonGuard']['recommended'] is None and not out['horizonGuard']['eligible'] and not out['horizonGuard']['rawRemote'] and out['horizonGuard']['unchanged']
assert 'Root cause isolated' in out['guidedRecoveryText'] and 'Same solver recalculates end-to-end' in out['guidedRecoveryText'] and 'Manual plan · same solver' in out['guidedRecoveryActions'] and 'Escalation mode' in out['guidedRecoveryActions'] and len(out['guidedRecoveryActions'])>2
assert out['autoModalTierCount']==3 and any(('Review' in x or 'Resolve blocker' in x or 'guided' in x.lower()) for x in out['autoModalActions'])
assert not out['pageErrors']
