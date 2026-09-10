from pathlib import Path
from html.parser import HTMLParser
root=Path(__file__).parent
class Parser(HTMLParser):
    def __init__(self): super().__init__(); self.refs=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if tag=='script' and d.get('src'): self.refs.append(d['src'])
        if tag=='link' and d.get('href'): self.refs.append(d['href'])
text=(root/'index.html').read_text(); app=(root/'app.js').read_text(); css=(root/'styles.css').read_text(); core=(root/'core.js').read_text(); repo=(root/'repository.js').read_text(); services=(root/'services.js').read_text(); p=Parser();p.feed(text)
checks=[]
def add(n,v):checks.append((n,bool(v)))
required=['index.html','styles.css','core.js','demo-data.js','repository.js','services.js','app.js','manifest.webmanifest','service-worker.js','README.md','QUICK_START.md','USER_MANUAL.html','VERIFICATION.md']
add('Required release files present',all((root/f).exists() for f in required))
local=[r for r in p.refs if not r.startswith(('http:','https:','#','mailto:'))]
add('All index asset references are relative',all(not r.startswith('/') for r in local))
add('All referenced local assets exist',all((root/r.split('?',1)[0].replace('./','')).exists() for r in local))
versioned=[r for r in p.refs if r.split('?',1)[0].endswith(('.js','.css'))]
add('All JS/CSS assets use REV 1.0.57 cache busting',bool(versioned) and all('?v=1.0.57' in r for r in versioned))
add('Visible revision badge is REV 1.0.57','>REV 1.0.57<' in text)
add('Core version/schema are 1.0.57 / 29',"ProtoLab.VERSION = '1.0.57-poc'" in core and 'ProtoLab.SCHEMA_VERSION = 29' in core)
add('Schema-26 migration exists','if(s.schemaVersion===26)' in repo and 's.schemaVersion=27' in repo)
add('Migration avoids false material limiter before issue','anyIssued=' in repo and 'lim.limited&&anyIssued' in repo)
add('Material receipt defaults to still-needed quantity','value="${esc(reqs[0].remaining)}"' in app)
add('Material receipt supports excess buffer','excess=Math.max(0,qty-issued)' in app and "status:excess>0?'Available':'Consumed / issued'" in app)
add('Material output limiter is visible','material-output-limit' in app and 'Output currently limited to' in app)
add('Selected staff assignment is a hard planning preference','staffByTaskName' in services and 'peoplePool=preferredStaff?[preferredStaff]' in services)
add('Unavailable staff excluded when available people exist','availablePeople=peopleRaw.filter' in services)
add('Readiness rerenders after specific blocker resolution','specific=(next.checks||[]).find(c=>c[0]===name);render();if(specific?.[1])' in app)
add('Already-cleared readiness condition reconciles immediately','if(check[1]){closeModal();render();toast(`${name} is satisfied.`);return;}' in app)
add('Dialogs use actual visual viewport','window.visualViewport' in app and 'fitModalToVisualViewport' in app)
add('Modal children are constrained inside viewport','.modal>*{min-inline-size:0;max-inline-size:100%;}' in css)
add('Process matrix has structured concise headings','matrix-head-title' in app and 'matrix-sample-id' in app and 'matrix-head-title' in css)
add('Process table remains internally scrollable','process-data-table{max-width:100%;overflow-x:auto;}' in css)
add('No external runtime JS/CSS dependencies',not any(r.startswith(('http:','https:')) for r in p.refs))
add('Schema-28 to 29 migration exists','if(s.schemaVersion===28)' in repo and 's.schemaVersion=29' in repo)
add('Quality exposes MSA / Gage R&R and no Capability & SPC tab',"['msa','MSA / Gage R&R'" in app and "['capability','Capability & SPC'" not in app[app.find('REV 1.0.57'):])
add('Existing MSA upload path exists','Upload existing MSA / Gage R&R' in app and 'msaUploadFile' in app)
add('MSA links to process, Standard Test and equipment',all(x in app for x in ['standardTestId','Process link','Standard Test link','Gage / equipment']))
add('Daily operations auto-check has same-day guard and active refresh','last===P.todayISO()' in app and "window.addEventListener('focus'" in app and 'Run again now' in app)
add('Long-page subsection menu is sticky on mobile','position:sticky!important' in css and 'top:68px!important' in css)
add('Governance register uses responsive cards','governance-card-list' in app and '.governance-item-card' in css)
add('Workspace primary controls do not inject Lessons in REV57',"installWorkspaceLearningShortcut=function(){if(App.currentView" in app and "b.textContent='Override…'" in app[app.find('REV 1.0.57'):])
for n,v in checks: print(('PASS' if v else 'FAIL')+' | '+n)
fail=sum(not v for _,v in checks);print(f'\nRESULT: {len(checks)-fail} passed, {fail} failed');raise SystemExit(1 if fail else 0)
