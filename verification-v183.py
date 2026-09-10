from pathlib import Path
import json, subprocess, sys, re, textwrap

ROOT=Path(__file__).resolve().parent
checks=[]
def check(name, cond, detail=''):
    checks.append((name,bool(cond),detail))
    print(('PASS' if cond else 'FAIL')+f' | {name}'+(f' | {detail}' if detail else ''))
def txt(name): return (ROOT/name).read_text(encoding='utf-8')

core=txt('core.js'); app=txt('app.js'); idx=txt('index.html'); css=txt('styles.css'); sw=txt('service-worker.js'); svc=txt('services.js'); demo=txt('demo-data.js')
check('Version is REV 1.0.83', "ProtoLab.VERSION = '1.0.83-poc'" in core and 'REV 1.0.83' in idx)
check('Main assets cache-busted to 1.0.83', idx.count('?v=1.0.83') >= 5)
check('Service-worker reset identity updated', 'LabOS 1.0.83 cache reset worker' in sw)
check('Dedicated final standards sticky nav exists', 'standards-sticky-v1083' in app and 'installStandardsStickyV1083' in app)
check('Sticky standards CSS is explicit', 'position:sticky!important;top:72px!important' in css and '.standards-sticky-links-v1083' in css)
check('Sticky nav covers full requested master areas', all(x in app for x in ['Resource assurance','Equipment & scope','Methods & standards','People & competencies','Requesting teams','5S workplace','Governance']))
check('Root cause is addressed after generic navigator', "page.querySelectorAll('.section-jump-nav,.standards-tools-v1061,.standards-sticky-v1083').forEach(x=>x.remove())" in app and 'render=function(){_renderV1083Base();installV1083();installStandardsStickyV1083();};' in app)
check('Engineering-team master is executable', all(x in app for x in ['v1083EngineeringTeamsSection','v1083OpenTeamEditor','v1083SaveTeam','inactiveEngineeringTeams']))
check('New request requires controlled active team', 'Choose an active engineering team from the controlled Requesting teams master' in svc and 'engineeringTeam:v1083DefaultEngineeringTeam()' in app)
check('Sensor-domain team seed removed from fresh demo', 'const teams=[\'ADAS Sensors\'' not in demo and "state.teams=['Power Tool Platform'" in demo)
check('AUTO-PLAN transactional safety gate exists', '_autoPlanV1083Unsafe' in svc and 'PLANNING_INTEGRITY_REJECTED' in svc and 'Object.assign(state,snapshot)' in svc)
check('AUTO-PLAN resilient resource scoring exists', all(x in svc for x in ['candidateTuple','resourceLoadHours','readiness first · load aware · deterministic','interventions']))
check('Portfolio optimizer scores commitment damage and churn', all(x in app for x in ['newlyLateCommitments','totalCommitmentDelay','bookingChurn','readinessInterventions','integrityIssueCount']))
check('Plan-review UI explains optimizer decision quality', 'AUTO-PLAN DECISION QUALITY' in app and 'Why this plan won' in app and 'Compare ${candidates.length} optimizer strategies' in app)

for js in ['core.js','demo-data.js','repository.js','services.js','app.js','service-worker.js']:
    r=subprocess.run(['node','--check',str(ROOT/js)],capture_output=True,text=True)
    check(f'JavaScript syntax: {js}',r.returncode==0,(r.stderr.strip() or 'OK')[:180])

# Runtime: team master, service validation, transaction rollback, resilient resource choice.
node=r'''
global.window=global;const fs=require('fs'),vm=require('vm'),R=process.argv[1];
for(const f of ['core.js','demo-data.js','services.js'])vm.runInThisContext(fs.readFileSync(R+'/'+f,'utf8'),{filename:f});
const P=global.ProtoLab;
const fresh=P.createDemoState();
const freshIntegrity=P.planningIntegrityAudit(fresh);
let blankRejected=false;try{new P.RequestService(fresh).create({title:'No team',productId:fresh.products[0].id,quantity:1,requiredDate:'2026-10-20',objective:'x'})}catch(e){blankRejected=/engineering team/i.test(e.message)}
let activeAccepted=false;try{const q=new P.RequestService(fresh).create({title:'Controlled team',productId:fresh.products[0].id,quantity:1,requiredDate:'2026-10-20',objective:'x',engineeringTeam:'Power Tool Platform'});activeAccepted=q.engineeringTeam==='Power Tool Platform'}catch(e){}

// Atomic rollback proof: planning normally removes/replaces target intent before it reaches
// a structural task check. Make the first pending task impossible and verify every state byte
// is restored after the expected failure.
const rollback=P.createDemoState(),rid='P26-1001',route=rollback.routes.find(x=>x.requestId===rid),pending=route.steps.find(x=>!(/complete|completed|done/i.test(String(x.status||'')))),proc=rollback.processes.find(x=>x.id===pending.processId),oldCap=proc.planningCapability||proc.equipmentCapability;
proc.planningCapability='IMPOSSIBLE-CAPABILITY-1083';proc.equipmentCapability='IMPOSSIBLE-CAPABILITY-1083';
const beforeRollback=JSON.stringify(rollback);let rollbackCode='';try{new P.PlannerService().autoPlan(rollback,rid)}catch(e){rollbackCode=e.code||''}
const rollbackExact=JSON.stringify(rollback)===beforeRollback;
proc.planningCapability=oldCap;proc.equipmentCapability=oldCap;

// Resilient resource choice proof. EQ-008 is calibration-expired in the demo while EQ-007 is
// ready for the same Electrical Test capability. With no competing bookings the optimizer must
// choose ready capacity rather than create avoidable calibration work.
const resilient=P.createDemoState();resilient.bookings=[];resilient.resourceCareBookings=[];const rr=resilient.requests.find(x=>x.id==='P26-1001');
rr.materialOwnership='Engineering supplied';rr.materialSupply={owner:'Test',expectedDate:P.todayISO(),reference:'TEST',receivedAt:P.todayISO()};
new P.PlannerService().autoPlan(resilient,rr.id);
const electrical=resilient.bookings.filter(b=>b.requestId===rr.id&&b.planningCapability==='Electrical Test'),electricalEq=[...new Set(electrical.map(b=>b.equipmentId))],autoEq8=resilient.resourceCareBookings.filter(x=>x.sourceRequestId===rr.id&&x.equipmentId==='EQ-008').length,resilientAudit=P.planningIntegrityAudit(resilient);

// Repeat on a clone to prove deterministic resource assignment independent of random booking IDs.
const resilient2=P.createDemoState();resilient2.bookings=[];resilient2.resourceCareBookings=[];const rr2=resilient2.requests.find(x=>x.id==='P26-1001');rr2.materialOwnership='Engineering supplied';rr2.materialSupply={owner:'Test',expectedDate:P.todayISO(),reference:'TEST',receivedAt:P.todayISO()};new P.PlannerService().autoPlan(resilient2,rr2.id);const electricalEq2=[...new Set(resilient2.bookings.filter(b=>b.requestId===rr2.id&&b.planningCapability==='Electrical Test').map(b=>b.equipmentId))];
console.log(JSON.stringify({teams:fresh.teams,userTeams:fresh.users.slice(0,2).map(x=>x.team),freshIntegrity:freshIntegrity.counts,blankRejected,activeAccepted,rollbackCode,rollbackExact,electricalEq,autoEq8,resilientIntegrity:resilientAudit.counts,electricalEq2}));
if(fresh.teams.includes('ADAS Sensors')||!fresh.teams.includes('Power Tool Platform')||!freshIntegrity.ok||!blankRejected||!activeAccepted||rollbackCode!=='ZERO_EQUIPMENT_CAPABILITY'||!rollbackExact||electricalEq.length!==1||electricalEq[0]!=='EQ-007'||autoEq8!==0||!resilientAudit.ok||JSON.stringify(electricalEq)!==JSON.stringify(electricalEq2))process.exit(2);
'''
r=subprocess.run(['node','-e',node,str(ROOT)],capture_output=True,text=True,timeout=120)
try: detail=json.loads((r.stdout.strip().splitlines() or ['{}'])[-1])
except Exception: detail={'stdout':r.stdout[-1000:],'stderr':r.stderr[-1000:]}
check('Runtime: controlled teams + atomic rollback + resilient deterministic resource choice',r.returncode==0,json.dumps(detail,separators=(',',':'))[:1800])

# Chromium test: actual final DOM, sticky behavior, team-management flow, wizard defaults,
# legacy-team migration and optimizer explanation. Instrument only a temporary in-memory copy
# of app.js to expose local functions for verification; shipped app remains unchanged.
browser_script=ROOT/'_verification_v183_browser.py'
browser_script.write_text(r'''
from pathlib import Path
import re,json,sys
from playwright.sync_api import sync_playwright
ROOT=Path(sys.argv[1])
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link[^>]+href="(?:styles\\.css[^\"]*|manifest\\.webmanifest|favicon-[^\"]*|apple-touch-icon\\.png)"[^>]*>','',html)
html=re.sub(r'<script src="[^"]+"></script>','',html)
app=(ROOT/'app.js').read_text(encoding='utf-8')
hook="window.__LABOS_V1083_TEST__={v1083MigrateEngineeringTeamsOnLoad,v1076SmartPlanProposal,v1083OptimizerQualityCard};window.addEventListener('DOMContentLoaded',init);"
app=app.replace("window.addEventListener('DOMContentLoaded',init);",hook)
out={}
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1600,'height':900})
    errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
    page.set_content(html);page.add_style_tag(content=(ROOT/'styles.css').read_text(encoding='utf-8'))
    for f in ['core.js','demo-data.js','repository.js','services.js']:
        page.add_script_tag(content=(ROOT/f).read_text(encoding='utf-8'))
    page.add_script_tag(content=app);page.evaluate("window.dispatchEvent(new Event('DOMContentLoaded'))");page.wait_for_function("window.__PROTOLAB_READY__ === true",timeout=30000)

    # Sticky Lab Standards & Resources navigation must be the final active menu, not the
    # older generic section navigator that used to delete/replace it.
    page.locator('#mainNav [data-nav="process-library"]').click();page.wait_for_timeout(150)
    nav=page.locator('.standards-sticky-v1083');out['stickyCount']=nav.count();out['genericCount']=page.locator('.section-jump-nav').count();out['position']=nav.evaluate("e=>getComputedStyle(e).position")
    out['labels']=nav.locator('[data-v1083-std-jump]').all_inner_texts();out['teamSection']=page.locator('#std-teams').count();out['equipmentSection']=page.locator('#std-equipment').count()
    page.evaluate('window.scrollTo(0,1200)');page.wait_for_timeout(100);out['stickyTopAfterScroll']=round(nav.bounding_box()['y'],1)

    # Admin can control requesting teams. Add a team, then deactivate it without destroying history.
    page.locator('#roleSelect').select_option('administrator');page.wait_for_timeout(100);page.locator('#mainNav [data-nav="process-library"]').click();page.wait_for_timeout(100)
    page.locator('[data-v1083-add-team]').first.click();page.locator('#v1083TeamName').fill('Industrial Design');page.locator('[data-v1083-save-team]').click();page.wait_for_timeout(150)
    out['addedTeam']=page.evaluate("ProtoLabApp.state.teams.includes('Industrial Design')")
    page.locator('[data-v1083-edit-team="Industrial Design"]').click();page.locator('#v1083TeamActive').uncheck();page.locator('[data-v1083-save-team]').click();page.wait_for_timeout(150)
    out['inactiveTeam']=page.evaluate("ProtoLabApp.state.settings.inactiveEngineeringTeams.includes('Industrial Design')")

    # Lab/admin creates on behalf of Engineering: no silent first-team default.
    page.locator('#mainNav [data-nav="dashboard"]').click();page.wait_for_timeout(80);page.locator('[data-new-request]').first.click();page.wait_for_timeout(80)
    out['adminWizardDefault']=page.locator('#wTeam').input_value();page.locator('[data-modal-close]').first.click();page.wait_for_timeout(50)

    # Engineering requester inherits their controlled team. Inactive teams are not selectable.
    page.locator('#roleSelect').select_option('engineering_requester');page.wait_for_timeout(100);page.locator('#mainNav [data-nav="dashboard"]').click();page.wait_for_timeout(80);page.locator('[data-new-request]').first.click();page.wait_for_timeout(80)
    out['engineeringDefault']=page.locator('#wTeam').input_value();out['wizardOptions']=page.locator('#wTeam option').all_inner_texts();page.locator('[data-modal-close]').first.click()

    # Migration of an existing REV82-style demo state.
    out['migration']=page.evaluate("""(()=>{const s=ProtoLabApp.state;s.teams=['ADAS Sensors','Powertrain Electronics','Thermal Systems','Chassis Controls','Electrification','Advanced Engineering'];s.users.find(x=>x.id==='U01').team='ADAS Sensors';delete s.settings.engineeringTeamsModelVersion;const r=__LABOS_V1083_TEST__.v1083MigrateEngineeringTeamsOnLoad();return {changed:r.changed,teams:s.teams,u01:s.users.find(x=>x.id==='U01').team,legacy:s.teams.includes('ADAS Sensors')};})()""")

    # Smart-plan metadata is independently inspectable and the decision card reports hard-integrity outcome.
    out['optimizer']=page.evaluate("""(()=>{const m=__LABOS_V1083_TEST__.v1076SmartPlanProposal('P26-1001');return {strategy:m.strategy,quality:m.quality,candidates:m.candidates,card:__LABOS_V1083_TEST__.v1083OptimizerQualityCard(m)};})()""")
    out['pageErrors']=errors
    browser.close()
print(json.dumps(out,separators=(',',':')))
need={'Resource assurance','Equipment & scope','Methods & standards','People & competencies','Requesting teams','5S workplace','Governance'}
assert out['stickyCount']==1 and out['genericCount']==0 and out['position']=='sticky' and need.issubset(set(out['labels']))
assert 68 <= out['stickyTopAfterScroll'] <= 76 and out['teamSection']==1 and out['equipmentSection']==1
assert out['addedTeam'] and out['inactiveTeam'] and out['adminWizardDefault']==''
assert out['engineeringDefault']=='Power Tool Platform' and 'Industrial Design' not in out['wizardOptions'] and not any('ADAS Sensors' in x for x in out['wizardOptions'])
assert out['migration']['changed'] and not out['migration']['legacy'] and out['migration']['u01']=='Power Tool Platform'
q=out['optimizer']['quality'];assert out['optimizer']['strategy'] and q['integrityIssueCount']==0 and len(out['optimizer']['candidates'])>=2 and 'Why this plan won' in out['optimizer']['card'] and '0 integrity conflicts' in out['optimizer']['card']
assert not out['pageErrors']
''',encoding='utf-8')
r=subprocess.run([sys.executable,str(browser_script),str(ROOT)],capture_output=True,text=True,timeout=180)
try: bdetail=json.loads((r.stdout.strip().splitlines() or ['{}'])[-1])
except Exception: bdetail={'stdout':r.stdout[-1800:],'stderr':r.stderr[-1800:]}
check('Chromium UI: sticky standards + team master + wizard + optimizer quality',r.returncode==0,json.dumps(bdetail,separators=(',',':'))[:2600])
try: browser_script.unlink()
except Exception: pass

failed=[x for x in checks if not x[1]]
result='\n'.join(('PASS' if ok else 'FAIL')+f' | {name}'+(f' | {detail}' if detail else '') for name,ok,detail in checks)+f"\n\nSUMMARY | {len(checks)-len(failed)}/{len(checks)} passed | {len(failed)} failed\n"
(ROOT/'VERIFICATION_RESULTS_v1.0.83.txt').write_text(result,encoding='utf-8')
print(f'\nSUMMARY | {len(checks)-len(failed)}/{len(checks)} passed | {len(failed)} failed')
sys.exit(1 if failed else 0)
