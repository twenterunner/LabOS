from pathlib import Path
import subprocess, sys
root=Path(__file__).parent
checks=[]
def check(name, ok):
    checks.append((name,bool(ok))); print(('PASS' if ok else 'FAIL'),name)
core=(root/'core.js').read_text(); app=(root/'app.js').read_text(); demo=(root/'demo-data.js').read_text(); repo=(root/'repository.js').read_text(); idx=(root/'index.html').read_text(); css=(root/'styles.css').read_text()
check('version 1.0.79', "ProtoLab.VERSION = '1.0.79-poc'" in core and 'REV 1.0.79' in idx)
check('schema 30', 'ProtoLab.SCHEMA_VERSION = 30' in core and 's.schemaVersion===29' in repo)
check('power tool demo override', '2026.09-demo-33-power-tools' in demo and 'Cordless Drill / Driver' in demo and 'Oscillating Multi-Tool' in demo)
check('24 request generator', 'for(let i=0;i<24;i++)' in demo)
check('E0-E1-V-P mapping', 'Pre-A / Exploratory Engineering' in core and 'A-sample / Structured Engineering' in core and 'B-sample / Validation' in core and 'C-sample / Production Intent' in core)
check('time-accurate resource readiness', 'projectedEquipmentReadyAt' in core and 'projectedStaffQualificationAt' in core and 'projectedEquipmentReadyAt?P.projectedEquipmentReadyAt' in (root/'services.js').read_text())
check('semantic readiness UI', 'equipmentPlanningCapability?P.equipmentPlanningCapability(eq)' in app and 'planningCapability??tr?.equipmentCapability' in app)
check('5S scroll preservation', app.count('restoreScrollY=window.scrollY')>=3)
check('standards sticky menu', 'standards-section-jump-v1079' in app and 'standards-section-jump-v1079' in css)
check('cache-bust 1.0.79', idx.count('?v=1.0.79')>=5)
for f in ['core.js','demo-data.js','repository.js','services.js','app.js']:
    r=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    check('syntax '+f,r.returncode==0)
print(f"{sum(ok for _,ok in checks)}/{len(checks)} checks passed")
sys.exit(0 if all(ok for _,ok in checks) else 1)
