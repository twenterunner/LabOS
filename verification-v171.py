from pathlib import Path
import subprocess, sys
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
services=(root/'services.js').read_text(encoding='utf-8')
core=(root/'core.js').read_text(encoding='utf-8')
index=(root/'index.html').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
checks=[]
def check(name,cond):
    checks.append((name,bool(cond))); print(('PASS' if cond else 'FAIL')+': '+name)
check('core version 1.0.71', "ProtoLab.VERSION = '1.0.71-poc'" in core)
check('header version 1.0.71', 'REV 1.0.71' in index)
check('cache-busted assets 1.0.71', index.count('?v=1.0.71') >= 6)
check('top action label is My work', '<span class="action-label">My work</span>' in index)
check('role work hub exists', 'Mandatory actions assigned to you' in app and 'roleWorkHubV1071' in app)
check('action centre route consolidates to dashboard', "if(view==='action-centre')" in app and "view='dashboard'" in app)
check('action centre nav removed at runtime', "querySelector('[data-nav=\"action-centre\"]')?.remove()" in app)
check('floating next action suppressed', '.global-next-guide{display:none!important}' in css and 'globalNextGuidanceV1058=function(){return null}' in app)
check('green/yellow/red lane alternatives', 'planning-slot-overlay-v1071 green' not in app and "kind:'green'" in app and "kind:'training'" in app and "kind:'impact'" in app)
check('lane overlays have all three styles', '.planning-slot-overlay-v1071.green' in css and '.planning-slot-overlay-v1071.yellow' in css and '.planning-slot-overlay-v1071.red' in css)
check('no timeslot list in v1071 move panel', 'Drop directly onto a highlighted half-day in the swimlane' in app and 'planning-move-banner-v1071' in app)
check('green no-impact semantics', 'no other build affected' in app.lower() and "prop.kind='green'" in app)
check('yellow training is prevalidated', 'simulateTrainingMoveV1071' in app and 'YELLOW SLOT · TRAINING REQUIRED' in app)
check('red cross-build move is prevalidated', 'simulateCrossBuildMoveV1071' in app and 'RED SLOT · APPROVAL REQUIRED' in app)
check('red impact is quantified', 'Worst forecast shift' in app and 'Late after move' in app and 'Bookings moved' in app)
check('planning fingerprint retained', 'planningFingerprintV1070(App.state)!==prop.sourceFingerprint' in app)
check('build swimlane move still enabled', 'enableWorkspacePlanningDragV1070' in app and 'workspace-plan-lane-track-v1070' in css)
for f in ['app.js','core.js','demo-data.js','repository.js','services.js','service-worker.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    check('javascript syntax '+f,p.returncode==0)
# Preserve core planner regressions from v1.0.70.
js=r'''global.window=global;require('./core.js');require('./demo-data.js');require('./services.js');
const P=ProtoLab,s=P.createDemoState();P.ensurePlanningCapabilityModelV1068?.(s);
for(const r of s.requests){const route=s.routes.find(x=>x.requestId===r.id);if(!route)continue;r.planningPreferences=r.planningPreferences||{};r.planningPreferences.staffByTaskName=r.planningPreferences.staffByTaskName||{};for(const stp of route.steps||[]){const proc=s.processes.find(p=>p.id===stp.processId),skill=proc?.competency;if(!skill)continue;const bad=s.staff.find(st=>st.available!==false&&!(st.competencies||[]).includes(skill));if(bad)r.planningPreferences.staffByTaskName[stp.name]=bad.id;}}
const res=new P.PlannerService().autoPlanPortfolio(s,{includePotential:false});if(res.some(x=>!x.ok))process.exit(2);const inv=P.validateInvariants(s);if(inv.length)process.exit(3);console.log(JSON.stringify({plans:res.length,bookings:s.bookings.length,invariants:inv.length}));'''
p=subprocess.run(['node','-e',js],cwd=root,capture_output=True,text=True)
check('portfolio planner regression',p.returncode==0)
if p.stdout.strip(): print('Planner:',p.stdout.strip())
failed=[n for n,v in checks if not v]
print(f"\n{len(checks)-len(failed)}/{len(checks)} release checks passed")
if failed:
    print('Failed: '+', '.join(failed));sys.exit(1)
