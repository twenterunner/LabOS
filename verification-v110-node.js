const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=__dirname;
function fakeEl(){return {innerHTML:'',textContent:'',value:'',checked:false,style:{},dataset:{},className:'',classList:{add(){},remove(){},toggle(){},contains(){return false}},appendChild(){},remove(){},click(){},focus(){},setAttribute(){},addEventListener(){},querySelector(){return null},querySelectorAll(){return []},scrollIntoView(){}}}
const els={};for(const k of ['#page','#mainNav','#actionCount','#roleSelect','#menuButton','#globalSearch','#searchResults','#sidebar','#toastRoot','#modalRoot','#versionBadge','.brand'])els[k]=fakeEl();
let domReady=null;const listeners={};
const document={querySelector:s=>els[s]||fakeEl(),querySelectorAll:s=>[],createElement:()=>fakeEl(),addEventListener:(ev,cb)=>{(listeners[ev]||(listeners[ev]=[])).push(cb)},body:fakeEl()};
const ctx={console,Date,Math,Intl,setTimeout,clearTimeout,Blob:class{},URL:{createObjectURL(){return'blob:x'},revokeObjectURL(){}},confirm(){return true},prompt(){return'1'},innerWidth:1200,window:null,document,navigator:{},location:{protocol:'http:'},scrollTo(){}};ctx.window=ctx;ctx.window.addEventListener=(ev,cb)=>{if(ev==='DOMContentLoaded')domReady=cb};vm.createContext(ctx);
for(const f of ['core.js','demo-data.js','services.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
ctx.ProtoLab.IndexedDBStorageRepository=class{async init(){return true}async load(){return ctx.ProtoLab.createDemoState()}async save(){return true}};
ctx.ProtoLab.BrowserDocumentStore=class{};
ctx.ProtoLab.DemoIdentityProvider=class{constructor(s){this.state=s}switchRole(role){const u=this.state.users.find(x=>x.role===role)||this.state.users[0];this.state.identity={userId:u.id,name:u.name,role};return this.state.identity}};
ctx.ProtoLab.MigrationService=class{static migrate(s){return s}};
let src=fs.readFileSync(path.join(root,'app.js'),'utf8');
src=src.replace("window.addEventListener('DOMContentLoaded',init);","window.__renderManagementTest=renderManagement;window.__appForTest=App;window.addEventListener('DOMContentLoaded',init);");
vm.runInContext(src,ctx,{filename:'app.js'});
function test(name,fn){try{fn();console.log('PASS | '+name);return 0}catch(e){console.error('FAIL | '+name+' | '+e.message);return 1}}
(async()=>{await domReady();ctx.__appForTest.identity.switchRole('administrator');let fail=0;
 fail+=test('REV 1.0.10 is visible',()=>assert.strictEqual(ctx.ProtoLab.VERSION,'1.0.10-poc'));
 fail+=test('Management KPI page renders without runtime exception',()=>{const html=ctx.__renderManagementTest();assert(html.length>5000);assert(/Management KPIs &amp; Capacity/.test(html));assert(/Demand versus capacity/.test(html));});
 fail+=test('KPI render defines current bookings before process-capacity use',()=>{const text=fs.readFileSync(path.join(root,'app.js'),'utf8');assert(/week1\.setDate\(week1\.getDate\(\)\+7\);const currentBookings=/.test(text));});
 for(const weeks of [13,26,52]) fail+=test(`KPI page renders ${weeks}-week horizon`,()=>{ctx.__appForTest.filters.kpiFutureWeeks=weeks;const html=ctx.__renderManagementTest();assert(html.includes(`Next ${weeks} weeks`));assert(/Weekly equipment-capability demand/.test(html));});
 for(const p of ctx.__appForTest.state.products.slice(0,3)) fail+=test(`KPI page renders product filter ${p.id}`,()=>{ctx.__appForTest.filters.kpiProduct=p.id;const html=ctx.__renderManagementTest();assert(html.includes(p.family));assert(!html.includes('ReferenceError'));});
 console.log(`\nRESULT: ${9-fail} passed, ${fail} failed`);process.exitCode=fail?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});
