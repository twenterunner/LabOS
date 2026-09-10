from pathlib import Path
import re
root=Path(__file__).resolve().parent
checks=[]
def check(name,ok):
    checks.append((name,bool(ok)))
    print(('PASS' if ok else 'FAIL')+': '+name)
idx=(root/'index.html').read_text()
core=(root/'core.js').read_text()
app=(root/'app.js').read_text()
css=(root/'styles.css').read_text()
check('version badge 1.0.64','REV 1.0.64' in idx)
check('cache-busted assets 1.0.64',idx.count('?v=1.0.64')>=5)
check('core version 1.0.64',"ProtoLab.VERSION = '1.0.64-poc'" in core)
check('six engineering dashboard filters',"['all','My requests']" in app and 'data-v1064-eng-filter' in app)
check('integrated resource assurance','Which setups are being pulled from service?' in app and 'resourceAssuranceIntegratedHtmlV1064' in app)
check('resource pull-out summary','SETUPS PULLED FROM SERVICE' in app)
check('multi-day planning work-hours engine','planningAddWorkHoursV1064' in app and 'feasibleAssignmentsV1062=function' in app)
check('pointer drag fallback','pointerdown' in app and 'pointermove' in app and 'pointerup' in app and 'planning-drag-grip-v1064' in app)
check('clickable/drop feasible slots','data-v1064-move-slot' in app)
check('5S good bench asset',(root/'assets/5s/bench-good.jpg').stat().st_size>50000)
check('5S bad bench asset',(root/'assets/5s/bench-bad.jpg').stat().st_size>50000)
check('5S shadow-board asset',(root/'assets/5s/bench-shadow-board.jpg').stat().st_size>50000)
check('5S assets used in UI',app.count('assets/5s/')>=3)
check('dashboard filter CSS','dashboard-filter-tile-v1064' in css)
check('resource assurance CSS','assurance-inline-tiles-v1064' in css and 'resource-pull-card-v1064' in css)
if not all(ok for _,ok in checks):
    raise SystemExit(1)
print(f'\n{sum(ok for _,ok in checks)}/{len(checks)} static acceptance checks passed.')
