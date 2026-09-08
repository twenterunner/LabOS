const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=__dirname;
const ctx={console,Date,Math,Intl,setTimeout,clearTimeout,window:null};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['core.js','demo-data.js','services.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const P=ctx.ProtoLab, app=fs.readFileSync(path.join(root,'app.js'),'utf8'), css=fs.readFileSync(path.join(root,'styles.css'),'utf8'), index=fs.readFileSync(path.join(root,'index.html'),'utf8');
let passed=0,failed=0;
function test(name,fn){try{fn();console.log('PASS | '+name);passed++;}catch(e){console.error('FAIL | '+name+' | '+e.message);failed++;}}
function fresh(){return P.createDemoState();}

test('REV 1.0.11 and schema 6',()=>{assert.strictEqual(P.VERSION,'1.0.11-poc');assert.strictEqual(P.SCHEMA_VERSION,6)});
test('Four purpose assurance profiles exist',()=>assert.deepStrictEqual(Object.keys(P.ASSURANCE_PROFILES),['rapid','controlled','validation','production']));
test('Rapid Engineering removes production/customer formalities',()=>{const q=P.ASSURANCE_PROFILES.rapid.requires;assert(!q.controlPlan&&!q.pfmea&&!q.releaseApproval&&!q.customerApprovals&&!q.serialisation)});
test('Controlled Engineering is lean but traceable',()=>{const q=P.ASSURANCE_PROFILES.controlled.requires;assert.strictEqual(q.controlPlan,'special-only');assert(q.serialisation);assert(!q.releaseApproval)});
test('Validation requires formal controls and release',()=>{const q=P.ASSURANCE_PROFILES.validation.requires;assert(q.processRelease&&q.testRelease&&q.pfmea&&q.controlPlan&&q.independentControlPlanApproval&&q.releaseApproval&&q.fullGenealogy)});
test('Production Intent applies strongest profile',()=>{const q=P.ASSURANCE_PROFILES.production.requires;assert(q.processRelease&&q.testRelease&&q.controlPlan&&q.customerApprovals&&q.fullGenealogy)});
test('Purpose recommendation maps quick experiment to Rapid',()=>assert.strictEqual(P.recommendAssuranceProfile({purpose:'Quick engineering experiment'}),'rapid'));
test('Purpose recommendation maps DV to Validation',()=>assert.strictEqual(P.recommendAssuranceProfile({purpose:'Design validation (DV)'}),'validation'));
test('Purpose recommendation maps PPAP support to Production Intent',()=>assert.strictEqual(P.recommendAssuranceProfile({purpose:'Production-intent / PPAP support'}),'production'));
test('Product Safety enforces at least Validation',()=>{const r={assuranceProfile:'rapid',productSafety:true};assert.strictEqual(P.ensureAssuranceProfile(r).id,'validation')});
test('New request stores selected assurance and product route source',()=>{const s=fresh();const p=s.products[0];const r=new P.RequestService(s).create({title:'Purpose test',productId:p.id,quantity:2,requiredDate:'2026-10-01',objective:'Learn fit',purpose:'Quick engineering experiment',assuranceProfile:'rapid',characterisation:['Functional verification']});assert.strictEqual(r.assuranceProfile,'rapid');const route=s.routes.find(x=>x.requestId===r.id);assert.strictEqual(route.source.mode,'product');assert.strictEqual(route.source.productId,p.id)});
test('Rapid test-only request does not require a process route',()=>{const s=fresh();const p=s.products[0];const r=new P.RequestService(s).create({title:'Bench test',productId:p.id,quantity:1,requiredDate:'2026-10-01',objective:'Quick test',purpose:'Quick engineering experiment',assuranceProfile:'rapid',characterisation:['Functional verification']});const route=s.routes.find(x=>x.requestId===r.id);route.steps=[];P.ensureTestRequirements(s,r);const a=P.processPlanningAssessment(s,r);assert(!a.issues.some(x=>/Define the process route/.test(x)),a.issues.join(' | '))});
test('Approved Control Plan revision preserves history',()=>{const s=fresh();const cp=s.controlPlans.find(x=>x.status==='Approved');const oldId=cp.id,oldRev=cp.revision;const next=new P.ControlPlanService(s).revise(cp.id);assert.strictEqual(cp.status,'Superseded');assert.strictEqual(next.status,'Draft');assert.strictEqual(next.supersedes,oldId);assert.notStrictEqual(next.id,oldId);assert.notStrictEqual(next.revision,oldRev)});
test('Route can start from scratch',()=>assert(app.includes('Start from scratch')&&app.includes("value=\"scratch\"")));
test('Route can leverage product standard',()=>assert(app.includes('Use product standard route')&&app.includes("value=\"product\"")));
test('Route can copy a previous build without altering original',()=>assert(app.includes('Copy a previous build')&&app.includes('src.steps.map(resetCopiedStep)')));
test('Copied/reused route remains editable',()=>assert(app.includes('This is a starting point, not a locked template')&&app.includes('data-edit-route-step')));
test('Route supports move and remove without drag',()=>assert(app.includes('data-route-up-step')&&app.includes('data-route-down-step')&&app.includes('data-remove-route-step')&&app.includes('moveRouteStep')&&app.includes('removeRouteStep')));
test('Control Plan has a prominent direct editor',()=>assert(app.includes('Edit Control Plan')&&app.includes('controlPlanEditor')));
test('Editing approved Control Plan creates new revision',()=>assert(app.includes("if(cp.status==='Approved'){cp=new P.ControlPlanService(App.state).revise(cpId)")));
test('Execution wording explains purpose rather than digital-traveller jargon',()=>{assert(app.includes('GUIDED BUILD EXECUTION'));assert(app.includes('Purpose of this step record'));assert(!app.includes('Serialise & execute digital traveller'))});
test('Rapid Engineering permits build-level evidence without unit IDs',()=>assert(app.includes('Build-level record')&&app.includes('unit IDs are optional for this engineering-only build')));
test('Formal builds still require unit identification when profile demands it',()=>assert(app.includes('This build purpose requires unit identification before execution.')));
test('Rapid result entry works without Control Plan characteristics',()=>assert(app.includes("requested.length?requested:['Engineering result']")&&app.includes('Build-level')));
test('Rapid workflow can complete as engineering-use-only',()=>assert(app.includes('Complete engineering build')&&app.includes('This is not a customer/production release')));
test('Request wizard lets user deliberately choose assurance/formality level',()=>assert(app.includes('Assurance / formality level')&&app.includes('Quick engineering experiment')&&app.includes('Production-intent / PPAP support')));
test('Workspace clearly shows current assurance profile',()=>assert(app.includes('BUILD PURPOSE / ASSURANCE')&&app.includes('Change level…')));
test('Mobile route controls reflow without clipping',()=>assert(/@media\s*\(max-width:\s*680px\)[\s\S]*route-choice-grid/.test(css)||css.includes('.route-choice-grid{grid-template-columns:1fr}')));
test('Header/cache references are REV 1.0.11',()=>assert(index.includes('1.0.11')&&!index.includes('?v=1.0.10')));

console.log(`\nRESULT: ${passed} passed, ${failed} failed`);process.exitCode=failed?1:0;
