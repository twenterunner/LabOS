from pathlib import Path
import subprocess, sys
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
core=(root/'core.js').read_text(encoding='utf-8')
services=(root/'services.js').read_text(encoding='utf-8')
index=(root/'index.html').read_text(encoding='utf-8')
checks=[]
def check(name,cond):
    checks.append((name,bool(cond))); print(('PASS' if cond else 'FAIL')+': '+name)
check('core version 1.0.68', "ProtoLab.VERSION = '1.0.68-poc'" in core)
check('header version 1.0.68', 'REV 1.0.68' in index)
check('cache-busted assets 1.0.68', index.count('?v=1.0.68') >= 6)
check('single planning review label', 'REVIEW & OPTIMIZE PLAN' in app and 'One review, not two.' in app)
check('commitment movement tile is informational', "metric('Commitment movement'" in app)
check('accepted optimization records commitments in same action', 'P.recordCommitment(next,r,r.forecastDate' in app and 'no second approval is required' in app)
check('dashboard planning decision routes to unified optimizer', "openCommitmentReviewV1063=function(){if(App.currentView!=='planning')" in app and 'optimizePortfolio()' in app)
check('planning click prompts instead of auto-open', 'data-planning-item-v1068' in app and 'Stay in planning' in app and 'Open build →' in app)
check('new swimlane build bars omit open-request navigation', 'data-planning-item-v1068="${esc(ev.id)}" data-planning-booking-v1061' in app)
check('planning capability model exists', 'ensurePlanningCapabilityModelV1068' in core and 'equipmentPlanningCapability' in core)
check('programming capability is dedicated', "'EQ-010':'Programming / Flashing'" in core and "if(/programming|flashing/.test(n))return 'Programming / Flashing'" in core)
check('laser capability is dedicated', "'EQ-001':'Laser Welding'" in core and "if(/laser welding|resistance welding/.test(n))return 'Laser Welding'" in core)
check('planner uses planning capability', 'P.planningCapabilityForProcess?P.planningCapabilityForProcess(state,r,proc)' in services and 'P.equipmentPlanningCapability?P.equipmentPlanningCapability(e):e.capability' in services)
check('invalid legacy resource becomes gap', 'Unassigned / resource gap' in app and 'Resource reassignment required' in core)
for f in ['app.js','core.js','demo-data.js','repository.js','services.js','service-worker.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    check('javascript syntax '+f,p.returncode==0)
# Planner regression: all active demo builds can be planned and every fixed equipment booking matches required capability.
js=r'''global.window=global;require('./core.js');require('./demo-data.js');require('./services.js');
const s=ProtoLab.createDemoState();ProtoLab.ensurePlanningCapabilityModelV1068(s);
const res=new ProtoLab.PlannerService().autoPlanPortfolio(s,{includePotential:false});if(res.some(x=>!x.ok))process.exit(2);
let bad=[];for(const b of s.bookings){const r=s.requests.find(x=>x.id===b.requestId),route=s.routes.find(x=>x.requestId===b.requestId),step=route?.steps?.find(x=>x.id===b.stepId),proc=step?s.processes.find(x=>x.id===step.processId):null,tr=(r?.testRequirements||[]).find(x=>x.id===b.stepId),test=tr?s.standardTests.find(x=>x.id===tr.standardTestId):null,need=proc?ProtoLab.planningCapabilityForProcess(s,r,proc):test?ProtoLab.planningCapabilityForTest(test):null,eq=s.equipment.find(x=>x.id===b.equipmentId);if(need&&(!eq||ProtoLab.equipmentPlanningCapability(eq)!==need))bad.push(b)}
if(bad.length)process.exit(3);
const prog=new Set(s.bookings.filter(b=>/Programming|Flashing/i.test(b.stepName)).map(b=>s.equipment.find(e=>e.id===b.equipmentId)?.name));if([...prog].some(x=>x!=='Programming Rig'))process.exit(4);
const laser=new Set(s.bookings.filter(b=>/Laser Welding/i.test(b.stepName)).map(b=>s.equipment.find(e=>e.id===b.equipmentId)?.name));if([...laser].some(x=>!['Laser Welder 1','Laser Welder 2'].includes(x)))process.exit(5);
const inv=ProtoLab.validateInvariants(s);if(inv.length)process.exit(6);console.log(JSON.stringify({results:res.length,bookings:s.bookings.length,programming:[...prog],laser:[...laser]}));'''
p=subprocess.run(['node','-e',js],cwd=root,capture_output=True,text=True)
check('portfolio planner resource semantic regression',p.returncode==0)
if p.stdout.strip(): print('Planner:',p.stdout.strip())
# Legacy repair regression: programming previously on a laser welder is moved to programming rig.
js2=r'''global.window=global;require('./core.js');require('./demo-data.js');const s=ProtoLab.createDemoState();ProtoLab.ensurePlanningCapabilityModelV1068(s);const r=s.requests[0],route=s.routes.find(x=>x.requestId===r.id),step=route.steps.find(x=>x.processId==='PROC-014');s.bookings=[{id:'B1',requestId:r.id,stepId:step.id,stepName:'Programming / Flashing',equipmentId:'EQ-001',staffId:'U04',skillId:'COMP-06',start:'2026-09-15T08:00:00.000Z',end:'2026-09-15T12:00:00.000Z',durationHours:4,status:'Planned',taskType:'process'}];s.settings.planningResourceSemanticsVersion='old';const out=ProtoLab.ensurePlanningCapabilityModelV1068(s);if(s.bookings[0].equipmentId!=='EQ-010')process.exit(2);console.log(JSON.stringify(out));'''
p2=subprocess.run(['node','-e',js2],cwd=root,capture_output=True,text=True)
check('legacy incorrect resource repair',p2.returncode==0)
if p2.stdout.strip(): print('Repair:',p2.stdout.strip())
failed=[n for n,v in checks if not v]
print(f"\n{len(checks)-len(failed)}/{len(checks)} release checks passed")
if failed:
    print('Failed: '+', '.join(failed));sys.exit(1)
