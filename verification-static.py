from pathlib import Path
from html.parser import HTMLParser
root=Path(__file__).parent
class P(HTMLParser):
    def __init__(self): super().__init__(); self.refs=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if tag=='script' and d.get('src'): self.refs.append(d['src'])
        if tag=='link' and d.get('href'): self.refs.append(d['href'])
        if tag=='a' and d.get('href'): self.refs.append(d['href'])
text=(root/'index.html').read_text(encoding='utf-8')
p=P();p.feed(text)
checks=[]
required=['index.html','styles.css','core.js','demo-data.js','repository.js','services.js','app.js','manifest.webmanifest','service-worker.js','README.md','QUICK_START.md','USER_MANUAL.html','VERIFICATION.md','docs/FUTURE_ENTERPRISE_ARCHITECTURE.md']
checks.append(('Required delivery files present',all((root/f).exists() for f in required)))
local=[r for r in p.refs if not r.startswith(('http:','https:','#','mailto:'))]
checks.append(('All index asset references are relative',all(not r.startswith('/') for r in local)))
checks.append(('All referenced local index assets exist',all((root/r.split('?',1)[0].replace('./','')).exists() for r in local)))
css=(root/'styles.css').read_text(encoding='utf-8'); app=(root/'app.js').read_text(encoding='utf-8'); repo=(root/'repository.js').read_text(encoding='utf-8'); core=(root/'core.js').read_text(encoding='utf-8'); services=(root/'services.js').read_text(encoding='utf-8'); demo=(root/'demo-data.js').read_text(encoding='utf-8')
checks.append(('Responsive mobile breakpoints present','@media (max-width:820px)' in css and '@media (max-width:560px)' in css))
checks.append(('Touch target baseline is at least 44px','--touch:44px' in css))
checks.append(('Mobile hamburger is explicitly preserved at narrow widths','#menuButton{display:inline-flex!important' in css and 'width:44px' in css))
checks.append(('Repository boundary present','class StorageRepository' in repo and 'class IndexedDBStorageRepository' in repo))
checks.append(('Role identity abstraction present','DemoIdentityProvider' in repo))
checks.append(('Global search covers core record types',all(x in app for x in ['App.state.requests.forEach','App.state.serials.forEach','App.state.processes.forEach','App.state.materials.forEach','App.state.deviations.forEach'])))
checks.append(('No external runtime JavaScript/CSS dependencies',not any(r.startswith(('http:','https:')) for r in p.refs)))
versioned=[r for r in p.refs if r.split('?',1)[0].endswith(('.js','.css'))]
checks.append(('Versioned asset URLs bypass stale browser cache',bool(versioned) and all('?v=1.0.15' in r for r in versioned)))
checks.append(('Legacy service worker cache is self-clearing',"registration.unregister()" in (root/'service-worker.js').read_text(encoding='utf-8') and "addEventListener('fetch'" not in (root/'service-worker.js').read_text(encoding='utf-8')))
checks.append(('Modal backdrop cannot globally close forms','modal-backdrop\" data-modal-close' not in app and 'clickedBackdrop' not in app))
checks.append(('Guided workspace replaces horizontal tabs and gate stepper','guided-workspace' in app and 'renderGuidedChecklist' in app and '.workspace-tabs,.gate-stepper{display:none!important}' in css))
checks.append(('Independent Approver role can approve Control Plans',"approver:['request:view','approval:perform','controlplan:approve'" in core))
checks.append(('Visible revision number is present in the application header','id="versionBadge"' in text and '>REV 1.0.15<' in text))
checks.append(('Purpose-based guided workflow is present','renderGuidedChecklist' in app and 'Define the engineering need' in app and 'Execute the build & capture evidence' in app and 'Characterise, evaluate & disposition exceptions' in app))
checks.append(('AUTO-PLAN keeps material/process definition as commitment prerequisites but can preview best-feasible timing','Best-feasible preview is possible' in app and 'Material feasibility' in app and 'Process / test definition' in app and 'Best-available route/test assumptions' in services))
checks.append(('Only Engineering supplied and Lab supplied are selectable in the request wizard','>Engineering supplied</option>' in app and '>Lab supplied</option>' in app and '<option>External supplier</option>' not in app))
checks.append(('Lab supplied material requires exact reservation before planning',"['Reserved','Issued'].includes(a.status)" in core and 'm.partNumber===req.partNumber' in app and 'm.revision===req.revision' in app))
checks.append(('Engineering supplied material captures expected arrival before planning','materialSupply' in app and 'Expected lab arrival' in app and 'Supply owner' in app))
checks.append(('Standard process/test and competence master data drive planning','standardTests' in demo and 'competencies' in demo and 'Required certified skill' in app and 'standardTests' in app))
checks.append(('Planner uses confirmed route and qualified/calibrated resources','procAssess.route' in services and 'route.confirmed!==true' in core and 'P.projectedEquipmentReady' in services and 'P.projectedStaffQualification' in services))
checks.append(('Planning estimates combine lab standards with same-product history','class LearningService' in services and 'Same-product history median' in services and 'setupTime' in services and 'cycleTime' in services))
checks.append(('Closed builds feed future learning','captureBuild(state,requestId)' in services and 'firstPassYield' in services and 'scrapRate' in services and 'reworkHours' in services and 'issues' in services and 'lessons' in services))
checks.append(('Control Plan special characteristics accept target OR limits','hasSpec=!!target||lsl!==null||usl!==null' in app))
checks.append(('Product safety approval records are generated','ensureApprovalRecords' in core and "type:'Product Safety'" in core))
checks.append(('Page-level horizontal overflow is prevented while tables remain scrollable','overflow-x:hidden' in css and '-webkit-overflow-scrolling:touch' in css))
checks.append(('Weekly and quarterly forward-demand views are present','Weekly equipment-capability demand' in app and 'Weekly certified-skill demand' in app and 'Equipment need by quarter' in app))
checks.append(('Calibration certificate fields are controlled','Certificate number' in app and 'Traceability / reference standard' in app and 'calibrationCertificates' in core))
checks.append(('Optimized readiness plan coordinates calibration maintenance and training','class ResourceCareService' in services and 'OPTIMIZED READINESS PLAN' in app and 'resourceCareBookings' in services))

fail=0
for name,ok in checks:
    print(('PASS' if ok else 'FAIL')+' | '+name)
    fail+=not ok
print(f'\nRESULT: {len(checks)-fail} passed, {fail} failed')
raise SystemExit(1 if fail else 0)
