from pathlib import Path
import subprocess, sys, tempfile, json
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
core=(root/'core.js').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
index=(root/'index.html').read_text(encoding='utf-8')
checks=[]
def check(name, cond):
    checks.append((name,bool(cond))); print(('PASS' if cond else 'FAIL')+': '+name)

check('core version 1.0.76', "ProtoLab.VERSION = '1.0.76-poc'" in core)
check('header version 1.0.76', 'REV 1.0.76' in index)
check('cache busting 1.0.76', index.count('?v=1.0.76') >= 6)
check('smart target-first reoptimization implementation', 'v1076SmartPlanProposal' in app and 'v1076TargetFirstPortfolio' in app)
check('planner proposal is single impact section', 'PLAN IMPACT · SINGLE DECISION VIEW' in app and 'No separate resource/timing table is repeated.' in app)
check('other programme impact highlighted', 'other-program-impact-v1076' in app and '.other-program-impact-v1076 td' in css)
check('accepted focused plan requires separate commit forecast', "focus.triage.status='Reviewed'" in app and 'reviewedPlanFingerprint' in app)
check('re-optimize and commit are staged yellow actions', "'button next-action'" in app and 'Plan reviewed.' in app and 'Commit forecast →' in app)
check('equipment scope removed from standards workspace', "v1075AssuranceSection()+v1075MethodsSection()+v1075PeopleSection()+v1075FiveSSection()" in app)
check('equipment scope inserted in audit workspace', 'audit-equipment-scope' in app and '_renderAuditReadinessV1076Base' in app)
for f in ['app.js','core.js','demo-data.js','repository.js','services.js','service-worker.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    check('javascript syntax '+f,p.returncode==0)

# Full portfolio regression.
js_domain=r'''global.window=global;require('./core.js');require('./demo-data.js');require('./services.js');const P=ProtoLab;let s=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(s);P.ensurePlanningModel(s);const plan=new P.PlannerService().autoPlanPortfolio(s,{includePotential:false});const fail=plan.filter(x=>!x.ok),inv=P.validateInvariants(s);let mismatches=0;for(const b of s.bookings||[]){if(!b.equipmentId)continue;const eq=s.equipment.find(e=>e.id===b.equipmentId),route=s.routes.find(x=>x.requestId===b.requestId),st=route?.steps?.find(x=>x.id===b.stepId),proc=st&&s.processes.find(x=>x.id===st.processId),tr=(s.requests.find(x=>x.id===b.requestId)?.testRequirements||[]).find(x=>x.id===b.stepId),test=tr?.standardTestId&&s.standardTests.find(x=>x.id===tr.standardTestId),need=test?(P.planningCapabilityForTest(test)||test.equipmentCapability):tr?.equipmentCapability||(proc?P.planningCapabilityForProcess(s,s.requests.find(x=>x.id===b.requestId),proc):null),got=P.equipmentPlanningCapability(eq);if(need&&got!==need)mismatches++;}console.log(JSON.stringify({plans:plan.length,failed:fail.length,bookings:(s.bookings||[]).length,mismatches,invariants:inv.length}));if(fail.length||mismatches||inv.length)process.exit(7);'''
p=subprocess.run(['node','-e',js_domain],cwd=root,capture_output=True,text=True,timeout=60)
check('portfolio planner regression',p.returncode==0)
if p.stdout.strip(): print('Domain:',p.stdout.strip())

# Instrument app.js to exercise the current smart replan and workflow state.
needle="window.addEventListener('DOMContentLoaded',init);"
instrument="window.__LABOS_V1076_TEST__={App,v1076SmartPlanProposal,v1076ValidatePlannerState,workspaceSchedule,renderProcessLibrary,renderAuditReadiness,planningFingerprintV1070};\n"
inst=app.replace(needle,instrument+needle,1)
with tempfile.TemporaryDirectory() as td:
    td=Path(td); testjs=td/'app-test.js'; testjs.write_text(inst,encoding='utf-8')
    harness=r'''global.window=global;window.addEventListener=()=>{};window.removeEventListener=()=>{};window.innerWidth=1600;window.scrollTo=()=>{};window.visualViewport=null;global.innerWidth=1600;global.navigator={};global.location={href:'http://localhost',protocol:'http:'};global.CSS={escape:s=>String(s)};global.MutationObserver=class{observe(){} disconnect(){}};const n=()=>{};function d(){return {innerHTML:'',textContent:'',value:'',checked:false,dataset:{},querySelector:()=>null,querySelectorAll:()=>[],classList:{add:n,remove:n,toggle:n,contains:()=>false},style:{},appendChild:n,prepend:n,remove:n,insertAdjacentHTML:n,insertAdjacentElement:n,setAttribute:n,addEventListener:n,removeEventListener:n,focus:n,click:n,closest:()=>null,getAttribute:()=>'',set onclick(v){},set onchange(v){},set oninput(v){}}};const roots={'#toastRoot':d(),'#page':d(),'#mainNav':d(),'#actionCount':d(),'#modalRoot':d(),'#roleSelect':d(),'#sidebar':d()};global.document={querySelector:s=>roots[s]||null,getElementById:id=>roots['#'+id]||null,querySelectorAll:()=>[],createElement:()=>d(),body:d(),documentElement:{style:{setProperty:n,removeProperty:n}},addEventListener:n};global.Blob=class{};global.URL={createObjectURL:()=>'',revokeObjectURL:n};require(ROOT+'/core.js');require(ROOT+'/demo-data.js');require(ROOT+'/repository.js');require(ROOT+'/services.js');require(APPTEST);const P=global.ProtoLab,T=global.__LABOS_V1076_TEST__,A=T.App;A.state=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(A.state);P.ensurePlanningModel(A.state);A.state.identity={userId:'U12',name:'Admin',role:'administrator'};new P.PlannerService().autoPlanPortfolio(A.state);const focus='P26-0051',before=A.state.requests.find(r=>r.id===focus).forecastDate,smart=T.v1076SmartPlanProposal(focus),after=smart.proposed.requests.find(r=>r.id===focus).forecastDate;if(!smart.useTarget)throw Error('target-first strategy was not selected for late constrained build');if(!(new Date(after)<new Date(before)))throw Error('smart plan did not improve focused build forecast');if(smart.impacted.length<2)throw Error('cross-program impact was not detected');const verr=T.v1076ValidatePlannerState(smart.proposed,smart.impacted);if(verr.length)throw Error('smart proposal validation failed: '+verr[0]);const r=A.state.requests.find(x=>x.id===focus);let html=T.workspaceSchedule(r);if(!html.includes('data-auto-plan="'+focus+'"')||!html.includes('button next-action'))throw Error('re-optimize is not yellow current action');if(html.includes('data-commit-triage="'+focus+'"'))throw Error('commit appeared before plan review');r.triage.status='Reviewed';r.triage.reviewedForecast=r.forecastDate;r.triage.reviewedPlanFingerprint=T.planningFingerprintV1070(A.state);html=T.workspaceSchedule(r);if(!html.includes('data-commit-triage="'+focus+'"')||!html.includes('Commit forecast →'))throw Error('commit did not appear after review');const standards=T.renderProcessLibrary();if(standards.includes('Equipment & laboratory scope'))throw Error('equipment scope remains in Lab Standards & Resources');const audit=T.renderAuditReadiness();if(!audit.includes('Equipment & laboratory scope')||!audit.includes('audit-equipment-scope'))throw Error('equipment scope missing from Audit Readiness');console.log(JSON.stringify({focus,before,after,impacted:smart.impacted.length,strategy:smart.useTarget?'target-first':'direct',standardsScope:false,auditScope:true}));process.exit(0);'''
    harness=harness.replace('ROOT',json.dumps(str(root))).replace('APPTEST',json.dumps(str(testjs)))
    p2=subprocess.run(['node','-e',harness],cwd=root,capture_output=True,text=True,timeout=90)
    check('smart replan + staged workflow runtime test',p2.returncode==0)
    if p2.stdout.strip(): print('Runtime:',p2.stdout.strip())
    if p2.stderr.strip(): print('Runtime stderr:',p2.stderr.strip())

failed=[n for n,v in checks if not v]
print(f"\n{len(checks)-len(failed)}/{len(checks)} checks passed")
if failed:
    print('Failed: '+', '.join(failed));sys.exit(1)
