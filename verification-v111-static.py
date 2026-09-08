from pathlib import Path
import re, sys
root=Path(__file__).resolve().parent
app=(root/'app.js').read_text(); core=(root/'core.js').read_text(); css=(root/'styles.css').read_text(); idx=(root/'index.html').read_text(); repo=(root/'repository.js').read_text()
checks=[]
def t(name, cond): checks.append((name,bool(cond)))
t('index.html present at application root',(root/'index.html').exists())
t('all principal relative assets referenced',all(x in idx for x in ['core.js?v=1.0.11','demo-data.js?v=1.0.11','repository.js?v=1.0.11','services.js?v=1.0.11','app.js?v=1.0.11','styles.css?v=1.0.11']))
t('header exposes REV 1.0.11','REV 1.0.11' in idx)
t('schema 6 migration exists','s.schemaVersion===5' in repo and 's.schemaVersion=6' in repo)
t('purpose profiles are defined',all(x in core for x in ['Rapid Engineering','Controlled Engineering','Validation / Customer','Production Intent']))
t('route source choices are present',all(x in app for x in ['Start from scratch','Use product standard route','Copy a previous build']))
t('route visible mobile controls are present',all(x in app for x in ['data-route-up-step','data-route-down-step','data-edit-route-step','data-remove-route-step']))
t('Control Plan direct edit and revision wording present','Edit Control Plan' in app and 'Edit → new revision' in app)
t('old Serialise/digital-traveller label removed','Serialise & execute digital traveller' not in app and 'digital traveller' not in app.lower())
t('guided execution explanation present','Purpose of this step record' in app and 'GUIDED BUILD EXECUTION' in app)
t('mobile route choices collapse to one column','route-choice-grid' in css and '@media' in css)
t('no external runtime/library dependency in index','https://' not in idx and 'http://' not in idx)
fail=0
for n,ok in checks:
 print(('PASS' if ok else 'FAIL')+' | '+n)
 fail+=0 if ok else 1
print(f'\nRESULT: {len(checks)-fail} passed, {fail} failed')
sys.exit(1 if fail else 0)
