from pathlib import Path
import re, base64, io, sys
try:
    from PIL import Image
except Exception:
    Image=None

root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(encoding='utf-8')
core=(root/'core.js').read_text(encoding='utf-8')
index=(root/'index.html').read_text(encoding='utf-8')
css=(root/'styles.css').read_text(encoding='utf-8')
checks=[]
def check(name, cond):
    checks.append((name,bool(cond)))
    print(('PASS' if cond else 'FAIL')+': '+name)

check('core version 1.0.65', "ProtoLab.VERSION = '1.0.65-poc'" in core)
check('header version 1.0.65', 'REV 1.0.65' in index)
check('cache-busted assets 1.0.65', index.count('?v=1.0.65') >= 6)
check('dashboard six-filter implementation', 'dashboard-filter-tile-v1064' in app and 'engineeringDashboardFilterV1064' in app)
check('next action restricted from ordinary pages', "compactNextActionV1065" in app and "['dashboard','action-centre']" in app)
check('compact portfolio CSS', '.request-portfolio .request-search-card' in css)
check('product category grouping', 'pmCategory' in app and 'productCategoryV1065' in app and 'data-v1065-product-group' in app)
check('planning health colour summary', 'planningHealthSummaryV1065' in app and 'health-bad-v1065' in css)
check('planning bars bind booking id directly', 'data-planning-booking-v1061=\"${esc(ev.id)}\"' in app)
check('native planning drag start', "addEventListener('dragstart'" in app and 'planningMovePanelV1065' in app)
check('native planning drop target', 'data-v1061-drop-slot' in app and "addEventListener('drop'" in app)
check('resource assurance consolidated into lab standards', "document.querySelector('[data-nav=\"equipment-master\"]')?.remove()" in app and 'resourceAssuranceIntegratedHtmlV1065' in app)
check('resource assurance pull-out status', 'Pulled now' in app and 'Scheduled pull' in app)
check('default decision rationale', 'defaultImprovementRationaleV1065' in app and 'System-proposed · review/edit before saving' in app)
check('exact equipment administrator exception', "adminExceptionModal('Equipment',eq.id,'Equipment governance'" in app)
check('exception shown as exception not false green', '⚠ Exception active' in app)
check('JSON export function exists', 'async function exportJson()' in app)
check('sticky submenu rules', 'sticky-submenu-v1063' in css and 'position:sticky !important' in css)

for key in ['GOOD','BAD','SHADOW']:
    m=re.search(rf"const FIVE_S_IMG_{key}_V1065='data:image/jpeg;base64,([^']+)'",app)
    good=bool(m)
    if good and Image:
        try:
            im=Image.open(io.BytesIO(base64.b64decode(m.group(1))))
            good=im.format=='JPEG' and im.width>=1200 and im.height>=600
        except Exception:
            good=False
    check(f'embedded 5S {key.lower()} bench image',good)

failed=[n for n,v in checks if not v]
print(f"\n{len(checks)-len(failed)}/{len(checks)} static release checks passed")
if failed:
    print('Failed: '+', '.join(failed))
    sys.exit(1)
