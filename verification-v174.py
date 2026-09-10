from pathlib import Path
import subprocess, sys, tempfile, json, textwrap
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
core=(root/'core.js').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
index=(root/'index.html').read_text(encoding='utf-8')
checks=[]
def check(name,cond):
    checks.append((name,bool(cond))); print(('PASS' if cond else 'FAIL')+': '+name)

check('core version 1.0.74', "ProtoLab.VERSION = '1.0.74-poc'" in core)
check('header version 1.0.74', 'REV 1.0.74' in index)
check('cache busting 1.0.74', index.count('?v=1.0.74') >= 6)
check('dashboard request cards responsive 4/3/2/1', all(x in css for x in ['repeat(4,minmax(0,1fr))','repeat(3,minmax(0,1fr))','repeat(2,minmax(0,1fr))','max-width:799px']))
check('capacity shows last current next together', 'Last, current and next' in app and 'capacity-three-grid-v1074' in app and 'capacity-three-period-v1074' in app)
check('capacity selector is week/month only in new view', 'capacity-mode-only-v1074' in app and 'Period size' in app)
check('planning calendar shortcut visible in planning header', 'Calendar settings' in app and 'data-v1074-calendar-settings' in app)
check('weekend planning setting persists', 'includeWeekendsForBuilds' in app and 'data-v1074-weekends' in app)
check('build plan is a fold-out', 'workspace-build-plan-fold-v1074' in app and 'data-v1074-build-plan-fold' in app)
check('5S gallery removed at runtime', "fiveSBenchGalleryV1064=function(){return ''}" in app and 'installFiveSVisualEntryPointsV1062=function(){}' in app)
check('planning-event review only renders commitment movement section', 'planning-event-only-section-v1074' in app and "if(!contextEvent)return _showPlanProposalV1074Base" in app)
check('green proposal id normalization present', 'M74-${options.length+1}' in app and 'v71[x.id]||v70[x.id]' in app)
check('move transaction verifies exact target', 'The move transaction did not reproduce its prevalidated target.' in app)
check('move persists before redraw and clears overlays', 'await App.repo.save(App.state)' in app and 'clearMoveOverlaysV1071();App.dragBookingV1061=null' in app)
for f in ['app.js','core.js','demo-data.js','repository.js','services.js','service-worker.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    check('javascript syntax '+f,p.returncode==0)

# Full portfolio domain regression.
js_domain=r'''global.window=global;require('./core.js');require('./demo-data.js');require('./services.js');const P=ProtoLab;
let s=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(s);P.ensurePlanningModel(s);const plan=new P.PlannerService().autoPlanPortfolio(s,{includePotential:false});const fail=plan.filter(x=>!x.ok);const inv=P.validateInvariants(s);let mismatches=0;for(const b of s.bookings||[]){if(!b.equipmentId)continue;const eq=s.equipment.find(e=>e.id===b.equipmentId),route=s.routes.find(x=>x.requestId===b.requestId),st=route?.steps?.find(x=>x.id===b.stepId),proc=st&&s.processes.find(x=>x.id===st.processId),tr=(s.requests.find(x=>x.id===b.requestId)?.testRequirements||[]).find(x=>x.id===b.stepId),need=tr?.equipmentCapability||(proc?P.planningCapabilityForProcess(s,s.requests.find(x=>x.id===b.requestId),proc):null),got=P.equipmentPlanningCapability(eq);if(need&&got!==need)mismatches++;}console.log(JSON.stringify({plans:plan.length,failed:fail.length,bookings:(s.bookings||[]).length,mismatches,invariants:inv.length}));if(fail.length||mismatches||inv.length)process.exit(7);'''
p=subprocess.run(['node','-e',js_domain],cwd=root,capture_output=True,text=True,timeout=60)
check('portfolio planner regression',p.returncode==0)
if p.stdout.strip(): print('Domain:',p.stdout.strip())

# Instrument app.js so the real move engine can be invoked without running init().
needle="window.addEventListener('DOMContentLoaded',init);"
instrument="window.__LABOS_TEST__={App,validatedMoveOptionsV1071,commitMoveProposalV1070};\n"
inst=app.replace(needle,instrument+needle,1)
with tempfile.TemporaryDirectory() as td:
    td=Path(td); (td/'app-test.js').write_text(inst,encoding='utf-8')
    harness=r'''global.window=global;window.addEventListener=()=>{};window.removeEventListener=()=>{};window.innerWidth=1600;window.scrollTo=()=>{};window.visualViewport=null;global.innerWidth=1600;global.navigator={};global.location={href:'http://localhost/index.html',protocol:'http:'};global.CSS={escape:s=>String(s)};global.MutationObserver=class{observe(){} disconnect(){}};
const noop=()=>{};function cls(){return {add:noop,remove:noop,toggle:noop,contains:()=>false}};function d(){return {innerHTML:'',textContent:'',value:'',checked:false,dataset:{},querySelector:()=>null,querySelectorAll:()=>[],classList:cls(),style:{},appendChild:noop,prepend:noop,remove:noop,insertAdjacentHTML:noop,insertAdjacentElement:noop,setAttribute:noop,addEventListener:noop,removeEventListener:noop,focus:noop,click:noop,closest:()=>null,getAttribute:()=>'',set onclick(v){},set onchange(v){},set oninput(v){}}};const roots={'#toastRoot':d(),'#page':d(),'#mainNav':d(),'#actionCount':d(),'#modalRoot':d(),'#roleSelect':d(),'#sidebar':d()};global.document={querySelector:s=>roots[s]||null,getElementById:id=>roots['#'+id]||null,querySelectorAll:()=>[],createElement:()=>d(),body:d(),documentElement:{style:{setProperty:noop,removeProperty:noop}},addEventListener:noop};global.Blob=class{};global.URL={createObjectURL:()=>'',revokeObjectURL:noop};
require(ROOT+'/core.js');require(ROOT+'/demo-data.js');require(ROOT+'/repository.js');require(ROOT+'/services.js');require(APPTEST);
(async()=>{const P=global.ProtoLab,T=global.__LABOS_TEST__,A=T.App;A.state=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(A.state);P.ensurePlanningModel(A.state);new P.PlannerService().autoPlanPortfolio(A.state,{includePotential:false});A.identity={switchRole(){}};A.repo={save:async()=>true};A.currentView='planning';let green=null,yellow=null;for(const b of A.state.bookings||[]){const opts=T.validatedMoveOptionsV1071(b,10);for(const o of opts){const prop=A.planningMoveProposalsV1071?.[o.id];if(o.kind==='green'&&prop?.ok&&!green){const target=prop.newTimes.find(x=>x.id===b.id)||prop.newTimes[0];if(target&&(new Date(target.start).toISOString()!==new Date(b.start).toISOString()||target.equipmentId!==b.equipmentId||target.staffId!==b.staffId))green={b:{...b},o,prop,target}}if(o.kind==='yellow'&&prop?.ok&&!yellow)yellow={b:{...b},o,prop,target:prop.newTimes.find(x=>x.id===b.id)||prop.newTimes[0]};}if(green&&yellow)break}if(!green)throw new Error('No non-no-op green move resolved to a proposal');const ok=await T.commitMoveProposalV1070(green.prop);const live=A.state.bookings.find(x=>x.id===green.b.id),changed=live&&new Date(live.start).toISOString()===new Date(green.target.start).toISOString()&&live.equipmentId===green.target.equipmentId&&live.staffId===green.target.staffId;if(!ok||!changed||A.dragBookingV1061!=null||A.v1074MoveCache!=null)throw new Error('Green transaction did not commit/clear correctly');let y={available:false};if(yellow){/* regenerate yellow against current state so fingerprint is current */yellow=null;for(const b of A.state.bookings||[]){const opts=T.validatedMoveOptionsV1071(b,10);const o=opts.find(x=>x.kind==='yellow'&&A.planningMoveProposalsV1071?.[x.id]?.ok);if(o){const prop=A.planningMoveProposalsV1071[o.id];yellow={b:{...b},o,prop,target:prop.newTimes.find(x=>x.id===b.id)||prop.newTimes[0]};break}}if(yellow){const yok=await T.commitMoveProposalV1070(yellow.prop,'verification training move'),ylive=A.state.bookings.find(x=>x.id===yellow.b.id),ychanged=ylive&&new Date(ylive.start).toISOString()===new Date(yellow.target.start).toISOString(),training=(A.state.resourceCareBookings||[]).some(x=>x.type==='Training'&&x.staffId===yellow.prop.training?.staffId);if(!yok||!ychanged||!training)throw new Error('Yellow transaction failed');y={available:true,committed:true}}}console.log(JSON.stringify({green:{optionId:green.o.id,committed:ok,changed},yellow:y}));process.exit(0)})().catch(e=>{console.error(e);process.exit(9)});'''
    harness=harness.replace('ROOT',json.dumps(str(root))).replace('APPTEST',json.dumps(str(td/'app-test.js')))
    p2=subprocess.run(['node','-e',harness],cwd=root,capture_output=True,text=True,timeout=60)
    check('application-level green/yellow move transaction',p2.returncode==0)
    if p2.stdout.strip(): print('Move:',p2.stdout.strip())
    if p2.stderr.strip(): print('Move stderr:',p2.stderr.strip())

failed=[n for n,v in checks if not v]
print(f"\n{len(checks)-len(failed)}/{len(checks)} checks passed")
if failed:
    print('Failed: '+', '.join(failed));sys.exit(1)
