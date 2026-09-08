const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=__dirname;
function fakeEl(){return {innerHTML:'',textContent:'',value:'',checked:false,files:[],style:{},dataset:{},className:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},appendChild(){},remove(){},click(){},focus(){},setAttribute(){},addEventListener(){},querySelector(){return null},querySelectorAll(){return []},scrollIntoView(){}}}
const els={};for(const k of ['#page','#mainNav','#actionCount','#roleSelect','#menuButton','#globalSearch','#searchResults','#sidebar','#toastRoot','#modalRoot','#versionBadge','.brand'])els[k]=fakeEl();
let domReady=null;const document={querySelector:s=>els[s]||fakeEl(),querySelectorAll:s=>[],createElement:()=>fakeEl(),addEventListener(){},body:fakeEl()};
const ctx={console,Date,Math,Intl,setTimeout:(fn)=>fn(),clearTimeout,Blob:class{},URL:{createObjectURL(){return'blob:x'},revokeObjectURL(){}},confirm(){return true},prompt(){return'1'},innerWidth:390,window:null,document,navigator:{},location:{protocol:'http:'},scrollTo(){}};ctx.window=ctx;ctx.window.addEventListener=(ev,cb)=>{if(ev==='DOMContentLoaded')domReady=cb};vm.createContext(ctx);
for(const f of ['core.js','demo-data.js','services.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
ctx.ProtoLab.IndexedDBStorageRepository=class{async init(){return true}async load(){return ctx.ProtoLab.createDemoState()}async save(){return true}};
ctx.ProtoLab.BrowserDocumentStore=class{};ctx.ProtoLab.DemoIdentityProvider=class{constructor(s){this.state=s}switchRole(role){const u=this.state.users.find(x=>x.role===role)||this.state.users[0];this.state.identity={userId:u.id,name:u.name,role};return this.state.identity}};ctx.ProtoLab.MigrationService=class{static migrate(s){return s}};
let src=fs.readFileSync(path.join(root,'app.js'),'utf8');src=src.replace("window.addEventListener('DOMContentLoaded',init);","window.__v112={App,renderProcessLibrary,renderEquipmentMaster,workspaceFlow,nextProcessRevision};window.addEventListener('DOMContentLoaded',init);");vm.runInContext(src,ctx,{filename:'app.js'});
let p=0,f=0;function test(name,fn){try{fn();console.log('PASS | '+name);p++}catch(e){console.error('FAIL | '+name+' | '+e.message);f++}}
(async()=>{await domReady();const T=ctx.__v112,A=T.App;A.identity.switchRole('administrator');
 test('REV 1.0.12 is active',()=>assert.strictEqual(ctx.ProtoLab.VERSION,'1.0.12-poc'));
 test('Process library exposes complete process edit',()=>{const h=T.renderProcessLibrary();assert(h.includes('Edit process'));assert(h.includes('data-edit-process-definition'));});
 test('Lab staff can be added and edited',()=>{const h=T.renderProcessLibrary();assert(h.includes('+ Add staff'));assert(h.includes('Edit person'));assert(h.includes('Certificates'));});
 test('Staff editing remains certificate gated',()=>{assert(src.includes('Skills are not assigned here'));assert(src.includes('competencies:[]'));assert(src.includes('Issue training certificates before AUTO-PLAN'))});
 test('Equipment page exposes explicit calibration certificate add',()=>{const h=T.renderEquipmentMaster();assert(h.includes('+ Add certificate'));assert(h.includes('data-add-cal-certificate'));});
 test('Calibration certificate form captures controlled fields',()=>{for(const x of ['Certificate number','Calibration laboratory / issuer','Calibration date','Next due date','Traceability / reference standard','Controlled evidence / document reference'])assert(src.includes(x),x)});
 test('Released process edit creates a new revision',()=>{assert.strictEqual(T.nextProcessRevision('A'),'B');assert(src.includes('Released revision is protected'));assert(src.includes("p.status='Under review'"));});
 test('Process editor includes work instruction and evidence',()=>{assert(src.includes('Work instruction steps — one per line'));assert(src.includes('Required evidence — one per line'));});
 const r=A.state.requests.find(x=>x.routeId);A.workspaceId=r.id;test('Created build route remains editable',()=>{const h=T.workspaceFlow(r);assert(h.includes('data-edit-route-step'));assert(h.includes('data-remove-route-step'));assert(h.includes('+ Add process'));});
 console.log(`\nRESULT: ${p} passed, ${f} failed`);process.exitCode=f?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});
