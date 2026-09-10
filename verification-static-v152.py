from pathlib import Path
from html.parser import HTMLParser
root=Path(__file__).parent
class P(HTMLParser):
    def __init__(self): super().__init__(); self.refs=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if tag=='script' and d.get('src'): self.refs.append(d['src'])
        if tag=='link' and d.get('href'): self.refs.append(d['href'])
text=(root/'index.html').read_text(encoding='utf-8'); p=P(); p.feed(text)
css=(root/'styles.css').read_text(encoding='utf-8'); app=(root/'app.js').read_text(encoding='utf-8'); core=(root/'core.js').read_text(encoding='utf-8')
checks=[]
def add(name,ok): checks.append((name,bool(ok)))
required=['index.html','styles.css','core.js','demo-data.js','repository.js','services.js','app.js','manifest.webmanifest','service-worker.js','README.md','QUICK_START.md','USER_MANUAL.html','VERIFICATION.md']
add('Required release files present',all((root/f).exists() for f in required))
local=[r for r in p.refs if not r.startswith(('http:','https:','#','mailto:'))]
add('All index asset references are relative',all(not r.startswith('/') for r in local))
add('All referenced local assets exist',all((root/r.split('?',1)[0].replace('./','')).exists() for r in local))
versioned=[r for r in p.refs if r.split('?',1)[0].endswith(('.js','.css'))]
add('All JS/CSS asset URLs use REV 1.0.52 cache busting',bool(versioned) and all('?v=1.0.52' in r for r in versioned))
add('Visible revision badge is REV 1.0.52','>REV 1.0.52<' in text)
add('Core version is REV 1.0.52',"ProtoLab.VERSION = '1.0.52-poc'" in core)
add('Schema remains 25','ProtoLab.SCHEMA_VERSION = 25' in core)
add('Build Report has consolidated measured CP section','Control Plan execution & measured data' in app and 'Measured Control Plan matrix' in app)
add('SC/CC supporting plots use report foldouts','Capability plots & statistical detail' in app and 'report-fold' in app)
add('Sample evidence is matrix-based','Sample data matrix' in app and 'report-data-matrix' in app)
add('Management page is Lab Performance','Lab performance' in app and 'Lab Performance</button>' in app)
add('Management page has four LIMS pillars',all(x in app for x in ['DELIVERY & FLOW','QUALITY','READINESS & COMPLIANCE','CAPACITY & COST']))
add('Management attention panel is present','MANAGEMENT ATTENTION' in app and 'kpi-signal-list' in app)
add('KPI supporting analytics use foldouts',app.count('class="card kpi-fold"')>=6)
add('Responsive KPI pillars are defined','kpi-pillar-grid' in css and '@media(max-width:820px)' in css)
add('Build Report print expands folded evidence','details.report-fold:not([open])>*:not(summary)' in css and 'display:block!important' in css)
add('No external runtime JS/CSS dependencies',not any(r.startswith(('http:','https:')) for r in p.refs))
fail=0
for name,ok in checks:
    print(('PASS' if ok else 'FAIL')+' | '+name); fail+=not ok
print(f'\nRESULT: {len(checks)-fail} passed, {fail} failed')
raise SystemExit(1 if fail else 0)
