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
text=(root/'index.html').read_text()
p=P();p.feed(text)
checks=[]
required=['index.html','styles.css','core.js','demo-data.js','repository.js','services.js','app.js','manifest.webmanifest','service-worker.js','README.md','QUICK_START.md','USER_MANUAL.html','VERIFICATION.md','docs/FUTURE_ENTERPRISE_ARCHITECTURE.md']
checks.append(('Required delivery files present',all((root/f).exists() for f in required if f!='VERIFICATION.md')))
local=[r for r in p.refs if not r.startswith(('http:','https:','#','mailto:'))]
checks.append(('All index asset references are relative',all(not r.startswith('/') for r in local)))
checks.append(('All referenced local index assets exist',all((root/r.split('?',1)[0].replace('./','')).exists() for r in local)))
css=(root/'styles.css').read_text(); app=(root/'app.js').read_text(); repo=(root/'repository.js').read_text(); core=(root/'core.js').read_text()
checks.append(('Responsive mobile breakpoints present','@media (max-width:820px)' in css and '@media (max-width:560px)' in css))
checks.append(('Touch target baseline is at least 44px','--touch:44px' in css))
checks.append(('Repository boundary present','class StorageRepository' in repo and 'class IndexedDBStorageRepository' in repo))
checks.append(('Role identity abstraction present','DemoIdentityProvider' in repo))
checks.append(('Global search covers core record types',all(x in app for x in ['App.state.requests.forEach','App.state.serials.forEach','App.state.processes.forEach','App.state.materials.forEach','App.state.deviations.forEach'])))
checks.append(('No external runtime JavaScript/CSS dependencies',not any(r.startswith(('http:','https:')) for r in p.refs)))
checks.append(('Versioned asset URLs bypass stale browser cache',all('?v=1.0.3' in r for r in p.refs if r.endswith('.js') or '.js?v=' in r or r.endswith('.css') or '.css?v=' in r)))
checks.append(('Legacy service worker cache is self-clearing',"registration.unregister()" in (root/'service-worker.js').read_text() and "addEventListener('fetch'" not in (root/'service-worker.js').read_text()))
checks.append(('Modal backdrop cannot globally close forms','modal-backdrop\" data-modal-close' not in app and 'clickedBackdrop' not in app))
checks.append(('Guided workspace replaces horizontal tabs and gate stepper','guided-workspace' in app and 'renderGuidedChecklist' in app and 'workspace-tabs' not in app.split('function renderWorkspace(){',1)[1].split('function workspaceReadiness',1)[0]))
checks.append(('Independent Approver role can approve Control Plans',"approver:['request:view','approval:perform','controlplan:approve'" in core))
fail=0
for name,ok in checks:
    print(('PASS' if ok else 'FAIL')+' | '+name)
    fail+=not ok
print(f'\nRESULT: {len(checks)-fail} passed, {fail} failed')
raise SystemExit(1 if fail else 0)
