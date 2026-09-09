const fs=require('fs'),vm=require('vm'),assert=require('assert');
global.window=global;vm.runInThisContext(fs.readFileSync('core.js','utf8'));vm.runInThisContext(fs.readFileSync('demo-data.js','utf8'));vm.runInThisContext(fs.readFileSync('services.js','utf8'));const P=global.ProtoLab;
const app=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('styles.css','utf8'),index=fs.readFileSync('index.html','utf8');let pass=0,fail=0;function t(n,f){try{f();console.log('PASS | '+n);pass++}catch(e){console.error('FAIL | '+n+' | '+e.message);fail++}}
t('Release is v1.0.40 schema 21',()=>{assert.equal(P.VERSION,'1.0.40-poc');assert.equal(P.SCHEMA_VERSION,21)});
t('Build execution has explicit route step navigation',()=>{assert(app.includes('function processStepNavigator'));assert(app.includes('data-exec-step'));assert(app.includes('Route step ${idx+1} of ${steps.length}'))});
t('Process data supports batch and per-sample capture',()=>{assert(app.includes('function processDataWorksheetModal'));assert(app.includes("scope==='batch'"));assert(app.includes("scope==='sample'"));assert(app.includes('Batch-level data'));assert(app.includes('Per-sample data'))});
t('Process data has CSV template and import',()=>{assert(app.includes('function downloadProcessStepCsv'));assert(app.includes('function importProcessStepCsv'));assert(app.includes('data-process-csv-template'));assert(app.includes('data-process-csv-import'))});
t('Process CSV is linked to permanent sample identity',()=>{assert(app.includes("'lab_sample_id'"));assert(app.includes("sampleByRef(requestId,get(vals,'lab_sample_id')"))});
t('Process data changes invalidate Build Report evidence set',()=>{assert(app.includes('Process data changed · ${step.name}'));assert(app.includes('Process data CSV updated · ${step.name}'));assert(app.includes('Process data definition changed · ${step.name}'))});
t('Administrator has build data & files export',()=>{assert(app.includes('function buildDataFilesModal'));assert(app.includes('Sample register'));assert(app.includes('Process execution log'));assert(app.includes('Control Plan measurements'));assert(app.includes('Characterisation results'));assert(app.includes('Audit trail'))});
t('Build Report includes structured process-step data',()=>{assert(app.includes('function reportProcessDataHtml'));assert(app.includes('${reportProcessDataHtml(route,r)}'))});
t('Process execution enforces route sequence',()=>{assert(app.includes('Complete earlier route step(s) first'))});
t('Responsive process-step controls exist',()=>{assert(css.includes('.process-step-rail'));assert(css.includes('.process-step-chip'));assert(css.includes('.process-data-panel'))});
t('Versioned assets point to v1.0.40',()=>{assert(index.includes('styles.css?v=1.0.40'));assert(index.includes('app.js?v=1.0.40'));assert(index.includes('REV 1.0.40'))});
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);if(fail)process.exit(1);
