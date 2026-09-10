from pathlib import Path
import json, subprocess, sys, re

ROOT=Path(__file__).resolve().parent
PREV=ROOT.parent/'labos81'
checks=[]
def check(name, cond, detail=''):
    checks.append((name,bool(cond),detail))
    print(('PASS' if cond else 'FAIL')+f' | {name}'+(f' | {detail}' if detail else ''))
def txt(name): return (ROOT/name).read_text(encoding='utf-8')

core=txt('core.js'); app=txt('app.js'); idx=txt('index.html'); css=txt('styles.css'); sw=txt('service-worker.js'); svc=txt('services.js'); demo=txt('demo-data.js')
check('Version is REV 1.0.82', "ProtoLab.VERSION = '1.0.82-poc'" in core and 'REV 1.0.82' in idx)
check('Main assets cache-busted to 1.0.82', idx.count('?v=1.0.82') >= 5)
check('Service-worker reset identity updated', 'LabOS 1.0.82 cache reset worker' in sw)
check('Active portfolio calendar emits month/CW/weekday/date', all(x in app for x in ['calendar-day-v1082','swim-month-v1082','swim-cw-v1082','swim-weekday-v1082','swim-date-v1082']))
check('Active portfolio lanes contain weekend bands', 'swim-weekend-band-v1082' in app and '${weekendBands}${due!==null?' in app)
check('Active workspace calendar emits month/CW/weekday/date', 'workspace-calendar-day-v1082' in app and 'workspace-weekend-band-v1082' in app)
check('Weekend CSS is full-height grey lane shading', 'top:0;bottom:0' in css and '.swim-weekend-band-v1082,.workspace-weekend-band-v1082' in css)
check('Material stage blocker opens executable resolver', 'actionAttrs:`data-v1082-material-resolver="${esc(r.id)}"`' in app)
check('Material self-link removed from active stage issue', "actionLabel:'Open material resolution',actionAttrs:'data-workspace-tab=\"materials\"'" not in app)
check('Material resolver diagnoses true shortage', 'Root cause: exact lab stock does not exist in sufficient quantity' in app)
check('Incoming supply requires owner/date/reference', 'Supply owner, expected arrival date and a controlled PO/order/supply reference are required.' in app)
check('Incoming material can be received from Materials screen', "btn('Receive planned supply'" in app and 'data-v1082-receive-supply' in app)
check('Physical issue remains separate from planning feasibility', "buildReady:issuedReady" in core and 'supplyPlanReady' in core)
check('Exact reservation consumes available lot quantity', 'm.quantity=Number(m.quantity||0)-qty' in app)
check('Partial incoming receipt keeps the remainder planned', 'Remaining quantity after partial receipt' in app)
check('REV81 planning-integrity safeguards retained', all(x in svc for x in ['planningIntegrityAudit','repairSeedPlanningIntegrityV1081','equipmentReadinessFailures','planningEventOverlaps']))

# Root-cause proof against the prior source snapshot if available.
if PREV.exists():
    old=(PREV/'app.js').read_text(encoding='utf-8')
    old_calendar='swim-month-v1080' in old and 'swim-cw-v1080' in old
    old_final=old.rfind("planningSwimlane=function({view='portfolio'")
    old_final_seg=old[old_final:old.find('renderPlanning=function()',old_final)] if old_final>=0 else ''
    check('Root cause proof: REV81 contained old calendar code somewhere', old_calendar)
    check('Root cause proof: REV81 final active planner lacked month/CW', old_final>=0 and 'swim-month-v1080' not in old_final_seg and 'swim-cw-v1080' not in old_final_seg)
    old_issue="actionLabel:'Open material resolution',actionAttrs:'data-workspace-tab=\"materials\"'" in old
    check('Root cause proof: REV81 material resolution was a self-link', old_issue)
else:
    check('Root cause proof: prior REV81 source available', False, 'labos81 source folder not found')

for js in ['core.js','demo-data.js','repository.js','services.js','app.js','service-worker.js']:
    r=subprocess.run(['node','--check',str(ROOT/js)],capture_output=True,text=True)
    check(f'JavaScript syntax: {js}',r.returncode==0,(r.stderr.strip() or 'OK')[:180])

# Core runtime regression: fresh demo remains planning-integrity clean and incoming supply has correct semantics.
node=r'''
global.window=global;const fs=require('fs'),vm=require('vm');
for(const f of ['core.js','demo-data.js','services.js'])vm.runInThisContext(fs.readFileSync(process.argv[1]+'/'+f,'utf8'),{filename:f});
const P=global.ProtoLab,s=P.createDemoState(),integrity=P.planningIntegrityAudit(s),r=s.requests.find(x=>x.id==='P26-1003');P.ensureMaterialRequirements(s,r);
r.materialOwnership='Lab supplied';r.quantity=123;r.materialReplenishments=[];s.allocations=s.allocations.filter(a=>a.requestId!==r.id);
for(const q of r.materialRequirements)q.requiredQty=123;
const keys=new Set(r.materialRequirements.map(q=>q.partNumber+'|'+q.revision));s.materials=s.materials.filter(m=>!keys.has(m.partNumber+'|'+m.revision));
let a=P.materialPlanningAssessment(s,r);const before={planningReady:a.planningReady,buildReady:a.buildReady};
r.materialReplenishments=(r.materialRequirements||[]).map((q,i)=>({id:'PLAN-'+i,requirementId:q.id,qty:123,expectedDate:'2026-09-15',owner:'Mila Jansen',reference:'PO-TEST-1082',status:'Planned'}));
a=P.materialPlanningAssessment(s,r);const after={planningReady:a.planningReady,buildReady:a.buildReady,earliest:a.earliestDate,incoming:a.lines.map(x=>x.incoming)};
console.log(JSON.stringify({integrity:integrity.counts,integrityOk:integrity.ok,before,after}));
if(!integrity.ok||before.planningReady||before.buildReady||!after.planningReady||after.buildReady||after.earliest!=='2026-09-15'||after.incoming.some(x=>x!==123))process.exit(2);
'''
r=subprocess.run(['node','-e',node,str(ROOT)],capture_output=True,text=True)
try: detail=json.loads((r.stdout.strip().splitlines() or ['{}'])[-1])
except Exception: detail={'stdout':r.stdout[-500:],'stderr':r.stderr[-500:]}
check('Runtime: fresh planning integrity + incoming material semantics',r.returncode==0,json.dumps(detail,separators=(',',':'))[:600])

# Chromium DOM/UI regression without external or localhost navigation.
browser_script=ROOT/'_verification_v182_browser.py'
browser_script.write_text(r'''
from pathlib import Path
import re,json,sys
from playwright.sync_api import sync_playwright
ROOT=Path(sys.argv[1])
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link[^>]+href="(?:styles\\.css[^"]*|manifest\\.webmanifest|favicon-[^"]*|apple-touch-icon\\.png)"[^>]*>','',html)
html=re.sub(r'<script src="[^"]+"></script>','',html)
out={}
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':1920,'height':1080})
    errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
    page.set_content(html)
    page.add_style_tag(content=(ROOT/'styles.css').read_text(encoding='utf-8'))
    for f in ['core.js','demo-data.js','repository.js','services.js','app.js']:
        page.add_script_tag(content=(ROOT/f).read_text(encoding='utf-8'))
    page.evaluate("window.dispatchEvent(new Event('DOMContentLoaded'))")
    page.wait_for_function("window.__PROTOLAB_READY__ === true",timeout=20000)
    # Global planning calendar
    page.locator('#mainNav [data-nav="planning"]').click();page.wait_for_timeout(100)
    heads=page.locator('.calendar-day-v1082').all_inner_texts(); out['globalCells']=len(heads);out['globalFirst7']=heads[:7]
    out['globalWeekendBands']=page.locator('.swim-weekend-band-v1082').count()
    z=page.locator('.swim-zoom-v1078 button');out['globalZoomActive']=[not z.nth(i).is_disabled() for i in range(min(3,z.count()))]
    # Planned build workspace calendar
    page.locator('#mainNav [data-nav="requests"]').click();page.locator('[data-open-request="P26-1024"]').first.click();page.wait_for_timeout(80)
    fold=page.locator('[data-v1074-build-plan-fold="P26-1024"]')
    if fold.count(): fold.locator('summary').click()
    wh=page.locator('.workspace-calendar-day-v1082').all_inner_texts();out['workspaceCells']=len(wh);out['workspaceFirst7']=wh[:7]
    out['workspaceWeekendBands']=page.locator('.workspace-weekend-band-v1082').count()
    wz=page.locator('.workspace-plan-zoom-v1069 button');out['workspaceZoomActive']=[not wz.nth(i).is_disabled() for i in range(wz.count())]
    # Exact screenshot state: an unplanned build still shows the working calendar when expanded.
    page.locator('#mainNav [data-nav="requests"]').click();page.locator('[data-open-request="P26-1002"]').first.click();page.wait_for_timeout(60)
    ufold=page.locator('[data-v1074-build-plan-fold="P26-1002"]')
    if ufold.count(): ufold.locator('summary').click()
    uh=page.locator('.workspace-calendar-day-v1082').all_inner_texts();out['unplannedWorkspaceCells']=len(uh);out['unplannedFirst7']=uh[:7];out['unplannedWeekendBands']=page.locator('.workspace-weekend-band-v1082').count()
    uz=page.locator('.workspace-plan-zoom-v1069 button');out['unplannedZoomActive']=[not uz.nth(i).is_disabled() for i in range(uz.count())]
    # Exact-stock path
    page.locator('[data-v1082-material-resolver]').first.click();out['exactResolverOpens']='Exact stock exists but is not reserved' in page.locator('#modalRoot').inner_text()
    page.locator('[data-v1082-reserve-exact]').click();page.wait_for_timeout(100)
    out['exactAfter']=page.evaluate("""(()=>{const r=ProtoLabApp.state.requests.find(x=>x.id==='P26-1002'),a=ProtoLab.materialPlanningAssessment(ProtoLabApp.state,r);return {planningReady:a.planningReady,reserved:a.lines.map(x=>x.reserved)}})()""")
    # Screenshot-equivalent 123-per-line, zero-stock true shortage
    page.evaluate("""(()=>{const s=ProtoLabApp.state,r=s.requests.find(x=>x.id==='P26-1003');ProtoLab.ensureMaterialRequirements(s,r);r.materialOwnership='Lab supplied';r.quantity=123;r.materialReplenishments=[];s.allocations=s.allocations.filter(a=>a.requestId!==r.id);for(const q of r.materialRequirements)q.requiredQty=123;const keys=new Set(r.materialRequirements.map(q=>q.partNumber+'|'+q.revision));s.materials=s.materials.filter(m=>!keys.has(m.partNumber+'|'+m.revision));})()""")
    page.locator('#mainNav [data-nav="requests"]').click();page.locator('[data-open-request="P26-1003"]').first.click();page.wait_for_timeout(60)
    page.locator('[data-v1082-material-resolver]').first.click();out['shortageDiagnosed']='exact lab stock does not exist in sufficient quantity' in page.locator('#modalRoot').inner_text().lower()
    page.locator('#v1082MatOwner').fill('Mila Jansen');page.locator('#v1082MatDate').fill('2026-09-15');page.locator('#v1082MatRef').fill('PO-TEST-1082');page.locator('[data-v1082-plan-supply]').click();page.wait_for_timeout(100)
    out['planAfter']=page.evaluate("""(()=>{const r=ProtoLabApp.state.requests.find(x=>x.id==='P26-1003'),a=ProtoLab.materialPlanningAssessment(ProtoLabApp.state,r);return {planningReady:a.planningReady,buildReady:a.buildReady,earliest:a.earliestDate,incoming:a.lines.map(x=>x.incoming)}})()""")
    out['receiveActionVisible']=page.locator('[data-v1082-receive-supply]').count()>0
    page.locator('[data-v1082-receive-supply]').first.click();lots=page.locator('[data-v1082-receive-lot]')
    for i in range(lots.count()): lots.nth(i).fill(f'LOT-1082-{i+1}')
    page.locator('[data-v1082-save-receipts]').click();page.wait_for_timeout(100)
    out['receiveAfter']=page.evaluate("""(()=>{const r=ProtoLabApp.state.requests.find(x=>x.id==='P26-1003'),a=ProtoLab.materialPlanningAssessment(ProtoLabApp.state,r);return {planningReady:a.planningReady,buildReady:a.buildReady,reserved:a.lines.map(x=>x.reserved),activeIncoming:(r.materialReplenishments||[]).filter(x=>!['Received','Cancelled'].includes(x.status)).length}})()""")
    if page.locator('[data-issue-reserved]').count(): page.locator('[data-issue-reserved]').first.click();page.wait_for_timeout(100)
    out['issueAfter']=page.evaluate("""(()=>{const r=ProtoLabApp.state.requests.find(x=>x.id==='P26-1003'),a=ProtoLab.materialPlanningAssessment(ProtoLabApp.state,r);return {planningReady:a.planningReady,buildReady:a.buildReady,summary:a.summary}})()""")
    out['pageErrors']=errors
    browser.close()
print(json.dumps(out,separators=(',',':')))
assert out['globalCells']==56 and all('CW' in x and 'AM' in x and 'PM' in x for x in out['globalFirst7'])
assert out['globalWeekendBands']>0 and all(out['globalZoomActive'])
assert out['workspaceCells']>0 and all('CW' in x and 'AM' in x and 'PM' in x for x in out['workspaceFirst7'])
assert out['workspaceWeekendBands']>0 and all(out['workspaceZoomActive'])
assert out['unplannedWorkspaceCells']==14 and all('CW' in x and 'AM' in x and 'PM' in x for x in out['unplannedFirst7']) and out['unplannedWeekendBands']>0 and all(out['unplannedZoomActive'])
assert out['exactResolverOpens'] and out['exactAfter']['planningReady'] and out['exactAfter']['reserved']==[4,4,4,4]
assert out['shortageDiagnosed'] and out['planAfter']['planningReady'] and not out['planAfter']['buildReady'] and out['planAfter']['earliest']=='2026-09-15' and out['planAfter']['incoming']==[123,123,123,123]
assert out['receiveActionVisible'] and out['receiveAfter']['reserved']==[123,123,123,123] and out['receiveAfter']['activeIncoming']==0
assert out['issueAfter']['buildReady'] and not out['pageErrors']
''',encoding='utf-8')
r=subprocess.run([sys.executable,str(browser_script),str(ROOT)],capture_output=True,text=True,timeout=120)
try: bdetail=json.loads((r.stdout.strip().splitlines() or ['{}'])[-1])
except Exception: bdetail={'stdout':r.stdout[-900:],'stderr':r.stderr[-900:]}
check('Chromium UI: calendar/weekend + material resolution end-to-end',r.returncode==0,json.dumps(bdetail,separators=(',',':'))[:1400])
try: browser_script.unlink()
except Exception: pass

required=['index.html','styles.css','core.js','demo-data.js','repository.js','services.js','app.js','service-worker.js','README.md','CHANGELOG_v1.0.82.md','VERIFICATION_v1.0.82.md','verification-v182.py','ROOT_CAUSE_PROOF_v1.0.82.md']
check('Required REV82 release files present',all((ROOT/x).exists() for x in required),', '.join(x for x in required if not (ROOT/x).exists()) or 'all present')
failed=[x for x in checks if not x[1]]
print(f'\nSUMMARY | {len(checks)-len(failed)}/{len(checks)} passed | {len(failed)} failed')
sys.exit(1 if failed else 0)
