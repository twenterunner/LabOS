from pathlib import Path
import re,json
from playwright.sync_api import sync_playwright
R=Path('/mnt/data/labos95')
html=(R/'index.html').read_text()
html=re.sub(r'<link[^>]+href="(?:styles\.css[^\"]*|manifest\.webmanifest|favicon-[^\"]*|apple-touch-icon\.png)"[^>]*>','',html)
html=re.sub(r'<script src="[^"]+"></script>','',html)
app=(R/'app.js').read_text()
hook="window.__V195={v1078ManualTaskDefinitions,workflowSubstepsV1066,workspaceSchedule,render,requestById};window.addEventListener('DOMContentLoaded',init);"
app=app.replace("window.addEventListener('DOMContentLoaded',init);",hook)
out={}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 pg=b.new_page(); errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
 pg.set_content(html);pg.add_style_tag(content=(R/'styles.css').read_text())
 for f in ['core.js','demo-data.js','repository.js','services.js']: pg.add_script_tag(content=(R/f).read_text())
 pg.add_script_tag(content=app);pg.evaluate("dispatchEvent(new Event('DOMContentLoaded'))");pg.wait_for_function("window.__PROTOLAB_READY__===true",timeout=30000)
 out['stable']=pg.evaluate("""(()=>{const s=ProtoLab.createDemoState(),r=s.requests.find(x=>!['CLOSED','DELIVERED','RELEASED'].includes(x.status)); r.characterisation=['Electrical functional test','Helium leak test']; r.testRequirements=[];ProtoLab.ensureTestRequirements(s,r);const a=r.testRequirements.map(x=>({id:x.id,name:x.name}));r.characterisation=['Helium leak test','Thermal soak'];ProtoLab.ensureTestRequirements(s,r);const b=r.testRequirements.map(x=>({id:x.id,name:x.name}));return {a,b,unique:new Set(b.map(x=>x.id)).size===b.length,retained:a.find(x=>x.name==='Helium leak test')?.id===b.find(x=>x.name==='Helium leak test')?.id}})()""")
 out['stale']=pg.evaluate("""(()=>{const s=ProtoLab.createDemoState(),r=s.requests.find(x=>!['CLOSED','DELIVERED','RELEASED'].includes(x.status));r.characterisation=['Electrical functional test'];r.testRequirements=[];ProtoLab.ensureTestRequirements(s,r);const old=r.testRequirements[0],future=new Date(Date.now()+10*86400000);future.setHours(10,0,0,0);s.bookings.push({id:'STALE',requestId:r.id,stepId:old.id,stepName:'Test · OLD WRONG TEST',start:future.toISOString(),end:new Date(future.getTime()+3600000).toISOString(),durationHours:1,locked:true,status:'Planned',taskType:'test'});const before=ProtoLab.planningTaskCoverage(s,r);const rec=ProtoLab.reconcilePlanningBookings(s,r,{removeObsolete:true});const after=ProtoLab.planningTaskCoverage(s,r);return {before:{ok:before.ok,mismatch:before.mismatched.length},removed:rec.removed.map(x=>x.id),after:{ok:after.ok,missing:after.missing.length,mismatch:after.mismatched.length},exists:s.bookings.some(x=>x.id==='STALE')}})()""")
 out['autoplan']=pg.evaluate("""(()=>{const s=ProtoLab.createDemoState();ProtoLab.ensurePlanningModel(s);ProtoLab.ensureEnterpriseModel(s);const r=s.requests.find(x=>!['CLOSED','DELIVERED','RELEASED'].includes(x.status));try{new ProtoLab.PlannerService().autoPlan(s,r.id);const c=ProtoLab.planningTaskCoverage(s,r);return {ok:c.ok,expected:c.expected.map(x=>({id:x.id,name:x.name,kind:x.kind})),booked:(s.bookings||[]).filter(b=>b.requestId===r.id&&!ProtoLab.isHistoricalPlanningBooking(b)).map(b=>({id:b.stepId,name:b.stepName,kind:b.taskType,key:!!b.taskDefinitionKey})),forecast:r.forecastDate}}catch(e){return {err:e.message,code:e.code,details:e.details}}})()""")
 out['manualMatch']=pg.evaluate("""(()=>{const r=ProtoLabApp.state.requests.find(x=>!['CLOSED','DELIVERED','RELEASED'].includes(x.status));const a=ProtoLab.planningTasksForRequest(ProtoLabApp.state,r).map(x=>x.id),b=__V195.v1078ManualTaskDefinitions(r).map(x=>x.id),c=__V195.workflowSubstepsV1066(r,{id:'schedule'}).map(x=>x.label.split(' · ')[0]);return {same:JSON.stringify(a)===JSON.stringify(b),canonical:a,manual:b,sticky:c}})()""")
 out['errs']=errs
 print(json.dumps(out,indent=2))
 b.close()
