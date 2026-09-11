from pathlib import Path
import re,json,sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
html=(ROOT/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link[^>]+href="(?:styles\.css[^\"]*|manifest\.webmanifest|favicon-[^\"]*|apple-touch-icon\.png)"[^>]*>','',html)
html=re.sub(r'<script src="[^"]+"></script>','',html)
app=(ROOT/'app.js').read_text(encoding='utf-8')
hook="window.__LABOS_V1093_TEST__={guidedApprovalDock,guidedNextDock,buildGuidedSteps,workspaceControlPlan,v1093CpGate,controlPlanApprovalState};window.addEventListener('DOMContentLoaded',init);"
app=app.replace("window.addEventListener('DOMContentLoaded',init);",hook)
out={}
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=b.new_page(viewport={'width':1600,'height':900}); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html); page.add_style_tag(content=(ROOT/'styles.css').read_text(encoding='utf-8'))
    for f in ['core.js','demo-data.js','repository.js','services.js']: page.add_script_tag(content=(ROOT/f).read_text(encoding='utf-8'))
    page.add_script_tag(content=app); page.evaluate("window.dispatchEvent(new Event('DOMContentLoaded'))"); page.wait_for_function("window.__PROTOLAB_READY__ === true",timeout=30000)
    js="""(()=>{const s=ProtoLabApp.state,r=s.requests.find(x=>x.controlPlanId&&s.controlPlans.find(c=>c.id===x.controlPlanId&&c.buildSpecific)),cp=s.controlPlans.find(c=>c.id===r.controlPlanId);for(const c of cp.characteristics||[]){c.classification=''}ProtoLab.markBuildSpecificDelta(s,r,'Control Plan','browser verification');for(const a of s.approvals.filter(a=>a.requestId===r.id&&a.stage==='build-change'&&a.changeArea==='Control Plan'&&a.status!=='Superseded')){a.status='Approved';a.timestamp=ProtoLab.now()}cp.status='Review requested';cp.reviewRequestedAt=ProtoLab.now();cp.reviewRequestedBy=cp.owner||'Process Engineer';cp.owner='Process Engineer';ProtoLabApp.identity.switchRole('engineering_requester');const steps=__LABOS_V1093_TEST__.buildGuidedSteps(r),step={...steps.find(x=>x.id==='controls'),done:false};const requesterSignoff=__LABOS_V1093_TEST__.guidedApprovalDock(r,step),requesterNext=__LABOS_V1093_TEST__.guidedNextDock(r,steps,step),panel=__LABOS_V1093_TEST__.workspaceControlPlan(r);ProtoLabApp.identity.switchRole('quality');const qualitySignoff=__LABOS_V1093_TEST__.guidedApprovalDock(r,step);return {requesterSignoff,requesterNext,qualitySignoff,panel};})()"""
    out.update(page.evaluate(js)); out['pageErrors']=errors; b.close()
print(json.dumps(out,separators=(',',':')))
assert 'Waiting for' in out['requesterSignoff'] and 'Final CP approval is incomplete' in out['requesterSignoff']
assert 'Blocked · waiting for Quality Engineering' in out['requesterNext'] and 'disabled' in out['requesterNext']
assert 'Quality approve Control Plan' in out['qualitySignoff']
assert 'CONTROL PLAN APPROVAL PATH' in out['panel'] and 'Final Quality Engineering approval' in out['panel']
assert not out['pageErrors']
