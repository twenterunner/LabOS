const fs=require('fs'),vm=require('vm'),assert=require('assert');
global.window=global;vm.runInThisContext(fs.readFileSync('core.js','utf8'));const P=global.ProtoLab;
const app=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('styles.css','utf8'),index=fs.readFileSync('index.html','utf8');let pass=0,fail=0;function t(n,f){try{f();console.log('PASS | '+n);pass++}catch(e){console.error('FAIL | '+n+' | '+e.message);fail++}}
t('Release is v1.0.44 schema 21',()=>{assert.equal(P.VERSION,'1.0.44-poc');assert.equal(P.SCHEMA_VERSION,21)});
t('Readiness gate surfaces open items before satisfied items',()=>{assert(app.includes('openChecks=checks.filter(c=>!c[1])'));assert(app.includes('readiness check${readyChecks.length===1'));assert(app.includes('Build Readiness blocked by'))});
t('Readiness copy explains that prior work is verified not repeated',()=>{assert(app.includes('not a repeat of earlier workflow setup'));assert(app.includes('Earlier approved/reused work is simply checked here as evidence'))});
t('Execution record and process data are separately labelled',()=>{assert(app.includes('1 · PROCESS EXECUTION RECORD'));assert(app.includes('2 · CONTROLLED PROCESS DATA'));assert(app.includes('Execution record'));assert(app.includes('Process data worksheet'))});
t('Execution record explains automatic timer and duration',()=>{assert(app.includes('Start records the timestamp. Complete stops the timer and calculates actual duration.'));assert(app.includes('Complete execution & stop timer'))});
t('Execution note is optional rather than duplicate structured data',()=>{assert(app.includes('Execution note / evidence reference <small>optional</small>'));assert(!app.includes("if(!evidence){toast('Evidence / observation is required"))});
t('Process data definitions support required and capture level',()=>{assert(app.includes("captureLevel:['batch','sample','either'].includes"));assert(app.includes('Required before execution can be completed'));assert(app.includes('pdfRequired'));assert(app.includes('pdfLevel'))});
t('Required process data gates completion',()=>{assert(app.includes('function processDataRequirementStatus'));assert(app.includes('Complete required process data first'));assert(app.includes('Process data still required'))});
t('Process worksheet distinguishes batch and per-sample fields',()=>{assert(app.includes("batchDefs=defs.filter(d=>d.captureLevel!=='sample')"));assert(app.includes("sampleDefs=defs.filter(d=>d.captureLevel!=='batch')"))});
t('Control Plan is presented as formal separate evidence',()=>{assert(app.includes('3 · FORMAL CONTROL PLAN EVIDENCE'));assert(app.includes('controlled specification, method and reaction plan'))});
t('Responsive capture purpose layout exists',()=>{assert(css.includes('.capture-purpose-grid'));assert(css.includes('.field-required'));assert(css.includes('.readiness-satisfied'))});
t('Versioned assets point to v1.0.44',()=>{assert(index.includes('styles.css?v=1.0.44'));assert(index.includes('app.js?v=1.0.44'));assert(index.includes('REV 1.0.44'))});
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);if(fail)process.exit(1);
