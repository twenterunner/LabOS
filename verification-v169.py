from pathlib import Path
import subprocess, sys, re
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
core=(root/'core.js').read_text(encoding='utf-8')
index=(root/'index.html').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
checks=[]
def check(name,cond):
    checks.append((name,bool(cond))); print(('PASS' if cond else 'FAIL')+': '+name)
check('core version 1.0.69', "ProtoLab.VERSION = '1.0.69-poc'" in core)
check('header version 1.0.69', 'REV 1.0.69' in index)
check('cache-busted assets 1.0.69', index.count('?v=1.0.69') >= 6)
check('current workflow forced yellow semantics', "firstOpen.hasBlocker=true" in app and "s.state='current'" in app and '.workspace-workflow-step-v1066.current{background:#fff6cf' in css)
check('completed workflow green', '.workspace-workflow-step-v1066.complete{background:#edf8f1' in css)
check('future workflow grey', '.workspace-workflow-step-v1066.pending{background:#f3f5f6' in css)
check('blocker visible red while current remains yellow', 'workflow-blocker-flag-v1069' in app and 'background:var(--bad)' in css and 'has-blocker-v1069' in app)
check('substeps have complete/current/future states', "const state=x.done?'complete':i===nextIdx?'current':'future'" in app and '.workspace-substep-chip-v1066.future{' in css)
check('next execution actions yellow', 'route-next-action-v1069' in app and '.route-next-action-v1069{background:#f4cf62' in css)
check('sticky NEXT action directly handles start/data/complete', 'Start ${current.name} →' in app and 'Record required data →' in app and 'Complete ${current.name} →' in app)
check('main route wording improved', 'BUILD ROUTE · STEP ${esc(selected.order)} OF ${steps.length}' in app and 'NEXT ACTION' in app and 'Ready for this operation' in app)
check('main route current/future/complete styling', '.route-step-main-v1069.current{' in css and '.route-step-main-v1069.complete{' in css and '.route-step-main-v1069.future{' in css)
check('sticky font enlarged', '.workspace-workflow-step-v1066 b{font-size:10.5px' in css and '.workspace-rail-label-v1066{font-size:9.5px' in css)
check('full-build sticky plan replaces seven day mini view', 'BUILD PLAN · ENTIRE FLOW · MORNING / AFTERNOON' in app and 'const days=Math.max(2,Math.ceil((end-start)/86400000))' in app)
check('sticky plan default fit and zoom controls', 'data-v1069-plan-zoom="out"' in app and 'data-v1069-plan-zoom="fit"' in app and 'data-v1069-plan-zoom="in"' in app and "[1,1.5,2.25,3.25]" in app)
check('plan bars reflect workflow state', 'workspacePlanStatusV1069' in app and 'workspace-full-plan-bar-v1069 ${state}' in app and '.workspace-full-plan-bar-v1069.current{' in css)
check('unscheduled route steps surfaced', 'Not yet scheduled:' in app and 'unscheduled=routeSteps.filter' in app)
for f in ['app.js','core.js','demo-data.js','repository.js','services.js','service-worker.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    check('javascript syntax '+f,p.returncode==0)
# Preserve v1.0.68 resource planning regression.
js=r'''global.window=global;require('./core.js');require('./demo-data.js');require('./services.js');
const s=ProtoLab.createDemoState();ProtoLab.ensurePlanningCapabilityModelV1068(s);
const res=new ProtoLab.PlannerService().autoPlanPortfolio(s,{includePotential:false});if(res.some(x=>!x.ok))process.exit(2);
let bad=[];for(const b of s.bookings){const r=s.requests.find(x=>x.id===b.requestId),route=s.routes.find(x=>x.requestId===b.requestId),step=route?.steps?.find(x=>x.id===b.stepId),proc=step?s.processes.find(x=>x.id===step.processId):null,tr=(r?.testRequirements||[]).find(x=>x.id===b.stepId),test=tr?s.standardTests.find(x=>x.id===tr.standardTestId):null,need=proc?ProtoLab.planningCapabilityForProcess(s,r,proc):test?ProtoLab.planningCapabilityForTest(test):null,eq=s.equipment.find(x=>x.id===b.equipmentId);if(need&&(!eq||ProtoLab.equipmentPlanningCapability(eq)!==need))bad.push(b)}
if(bad.length)process.exit(3);const inv=ProtoLab.validateInvariants(s);if(inv.length)process.exit(4);console.log(JSON.stringify({results:res.length,bookings:s.bookings.length,bad:bad.length,invariants:inv.length}));'''
p=subprocess.run(['node','-e',js],cwd=root,capture_output=True,text=True)
check('portfolio planner regression remains clean',p.returncode==0)
if p.stdout.strip(): print('Planner:',p.stdout.strip())
failed=[n for n,v in checks if not v]
print(f"\n{len(checks)-len(failed)}/{len(checks)} release checks passed")
if failed:
    print('Failed: '+', '.join(failed));sys.exit(1)
