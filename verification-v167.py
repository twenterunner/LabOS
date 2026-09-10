from pathlib import Path
import subprocess, sys
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
core=(root/'core.js').read_text(encoding='utf-8')
index=(root/'index.html').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
checks=[]
def check(name,cond):
    checks.append((name,bool(cond))); print(('PASS' if cond else 'FAIL')+': '+name)
check('core version 1.0.67', "ProtoLab.VERSION = '1.0.67-poc'" in core)
check('header version 1.0.67', 'REV 1.0.67' in index)
check('cache-busted assets 1.0.67', index.count('?v=1.0.67') >= 6)
check('guidance model itself suppresses non dashboard/action-centre views', "globalNextGuidanceV1058=function()" in app and "if(!['dashboard','action-centre'].includes(App.currentView))return null" in app)
check('late global action DOM guard installed', 'installGlobalNextGuardV1067' in app and "document.querySelectorAll('.global-next-guide').forEach(x=>x.remove())" in app)
check('execution prerequisite action directs to exact step', 'PREREQUISITE REQUIRED' in app and 'Go to ${esc(current.name)}' in app and 'data-exec-step=' in app)
check('sticky NEXT command routes to current process step', 'Go to ${current.name} →' in app and '_guidedNextDockV1067' in app)
check('sticky process substep highlights next required step', 'next-required-v1067' in app and '<em>NEXT</em>' in app)
check('wide process route uses screen width more efficiently', '.route-definition-card .route-method-list{grid-template-columns:repeat(2,minmax(0,1fr))' in css)
check('execution layout density improved', '.execution-step-cockpit{padding:12px 14px}' in css and '.sample-choice{padding:7px 9px' in css)
check('v1.0.66 half-day planning retained', 'halfDayCandidateStartsV1066' in app and 'PLAN SWIMLANE · MORNING / AFTERNOON' in app)
check('v1.0.66 full-width sticky workflow retained', 'workspaceWorkflowRailV1066' in app and 'workspace-cockpit-v1066' in app and 'OVERALL PROGRESS' in app)
for f in ['app.js','core.js','demo-data.js','repository.js','services.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    check('javascript syntax '+f,p.returncode==0)
# Demo-state invariant smoke test.
js="global.window=global;require('./core.js');require('./demo-data.js');const s=ProtoLab.createDemoState();const e=ProtoLab.validateInvariants(s);if(e.length){console.error(e);process.exit(1)}"
p=subprocess.run(['node','-e',js],cwd=root,capture_output=True,text=True)
check('demo data invariant smoke test',p.returncode==0)
failed=[n for n,v in checks if not v]
print(f"\n{len(checks)-len(failed)}/{len(checks)} release checks passed")
if failed:
    print('Failed: '+', '.join(failed)); sys.exit(1)
