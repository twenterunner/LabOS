const fs=require('fs'),vm=require('vm'),assert=require('assert');
global.window=global;vm.runInThisContext(fs.readFileSync('core.js','utf8'));vm.runInThisContext(fs.readFileSync('demo-data.js','utf8'));vm.runInThisContext(fs.readFileSync('services.js','utf8'));const P=global.ProtoLab;
const app=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('styles.css','utf8'),index=fs.readFileSync('index.html','utf8');let pass=0,fail=0;function t(n,f){try{f();console.log('PASS | '+n);pass++}catch(e){console.error('FAIL | '+n+' | '+e.message);fail++}}
t('Release is v1.0.39 schema 21',()=>{assert.equal(P.VERSION,'1.0.39-poc');assert.equal(P.SCHEMA_VERSION,21)});
t('Build Readiness guided step has a real renderer',()=>{assert(app.includes('function workspaceReadiness(r)'));assert(app.includes('new P.ReadinessService(App.state).evaluate(r.id)'))});
t('Readiness workspace is action oriented',()=>{assert(app.includes('function readinessActionTarget'));assert(app.includes('Resolve readiness before build'));assert(app.includes('Open equipment assurance'));assert(app.includes('Open training / competencies'))});
t('Guided workflow step switching is error safe',()=>{assert(app.includes('function selectWorkspaceTab(tab)'));assert(app.includes('Guided workflow section render failed'));assert(app.includes('selectWorkspaceTab(wt.dataset.workspaceTab)'))});
t('Guided workflow tiles are explicitly touch interactive',()=>{assert(css.includes('.guided-mobile-step,.guide-row{touch-action:manipulation;cursor:pointer;pointer-events:auto}'))});
t('Versioned assets point to v1.0.39',()=>{assert(index.includes('styles.css?v=1.0.39'));assert(index.includes('app.js?v=1.0.39'));assert(index.includes('REV 1.0.39'))});
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);if(fail)process.exit(1);
