from pathlib import Path
import re, subprocess, sys
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
core=(root/'core.js').read_text(encoding='utf-8')
index=(root/'index.html').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
checks=[]
def check(name, cond):
    checks.append((name,bool(cond)))
    print(('PASS' if cond else 'FAIL')+': '+name)
check('core version 1.0.66', "ProtoLab.VERSION = '1.0.66-poc'" in core)
check('header version 1.0.66', 'REV 1.0.66' in index)
check('cache-busted assets 1.0.66', index.count('?v=1.0.66') >= 6)
check('global next action restricted to Dashboard/Action Centre', 'enforceNextActionScopeV1066' in app and "['dashboard','action-centre'].includes(App.currentView)" in app and '#page:not(.show-global-next-v1066) .global-next-guide' in css)
check('half-day feasible planning slots', 'halfDayCandidateStartsV1066' in app and "for(const part of ['AM','PM'])" in app and 'feasibleAssignmentsV1062=function' in app)
check('half-day swimlane headings', 'halfday-v1066' in app and '<i>AM</i><i>PM</i>' in app)
check('full-width build sticky cockpit', 'workspace-cockpit-v1066' in app and 'left:var(--sidebar)!important;right:0!important' in css)
check('workflow integrated into sticky cockpit', 'workspaceWorkflowRailV1066' in app and 'GUIDED BUILD WORKFLOW' in app)
check('current workflow substeps integrated', 'workspaceSubstepRailV1066' in app and 'workflowSubstepsV1066' in app)
check('process route substeps supported', "step.id==='processrisk'" in app and 'processDefinitionForStep' in app)
check('execution route substeps actionable', 'attrs:`data-exec-step=' in app and "step.id==='execution'" in app)
check('sticky build planning swimlane', 'workspaceMiniPlanningSwimlaneV1066' in app and 'PLAN SWIMLANE · MORNING / AFTERNOON' in app)
check('0-100 progress indicator', 'workflowProgressV1066' in app and 'OVERALL PROGRESS' in app and 'Math.min(100' in app)
check('old duplicate guided sidebar removed from renderWorkspace', 'workspace-content-full-v1066' in app and 'renderWorkspace=function()' in app)
check('dynamic cockpit spacer remains', 'scheduleWorkspaceCockpitLayout()' in app and 'workspace-cockpit-spacer' in app)
# Syntax checks
for f in ['app.js','core.js','demo-data.js','repository.js','services.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    check(f'javascript syntax {f}',p.returncode==0)
failed=[n for n,v in checks if not v]
print(f"\n{len(checks)-len(failed)}/{len(checks)} static release checks passed")
if failed:
    print('Failed: '+', '.join(failed))
    sys.exit(1)
