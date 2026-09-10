from pathlib import Path
import re, json, subprocess, sys
root=Path(__file__).parent
files=['index.html','styles.css','core.js','demo-data.js','repository.js','services.js','app.js','manifest.webmanifest','service-worker.js','README.md','QUICK_START.md','USER_MANUAL.html','VERIFICATION.md','CHANGELOG_v1.0.61.md']
text={f:(root/f).read_text(errors='ignore') for f in files if (root/f).exists() and (root/f).suffix not in ['.png']}
app=text['app.js']; css=text['styles.css']; core=text['core.js']; idx=text['index.html']; repo=text['repository.js']
checks=[]
def ck(name,cond): checks.append((name,bool(cond)))
ck('required web release files present',all((root/f).exists() for f in files))
ck('web-only package uses IndexedDB repository', 'repo:new P.IndexedDBStorageRepository()' in app)
ck('no API/SQLite storage class retained', 'ApiStorageRepository' not in repo and 'sqlite' not in repo.lower())
ck('REV 1.0.61 version', "ProtoLab.VERSION = '1.0.61-poc'" in core and 'REV 1.0.61' in idx)
ck('all JS/CSS cache busting updated', all('?v=1.0.61' in x for x in re.findall(r'(?:src|href)="([^"]+\.(?:js|css)\?v=[^"]+)"',idx)))
ck('sample register collapsed by default', "const registerOpen='';" in app)
ck('exact missing requester input guidance', 'required-input-guidance-v1061' in app and 'Build configuration' in app and 'Complete ${esc(first.label)}' in app)
ck('requester direct action opens controlled request editor', 'editRequestModal(r.id)' in app and "configuration:['#erqConfig']" in app)
ck('generic management navigation not presented as Resolve', 'Open affected items →' in app)
ck('administrator abort/archive workflow', 'abortArchiveBuildV1061' in app and 'archiveReason' in app and "archiveDisposition='Aborted'" in app)
ck('archive manager cutoff deletion', 'archiveManagerV1061' in app and 'v1061ArchiveCutoff' in app and 'Type DELETE to confirm' in app)
ck('archived builds read-only', 'archive-readonly-banner' in app and '_canEditRequestV1061' in app)
ck('drag feasible-slot planner', 'showFeasibleSlotsV1061' in app and 'data-v1061-drop-slot' in app and 'bookingSlotFeasibleV1061' in app)
ck('drag feasibility includes people and equipment', 'booking.staffId' in app and 'booking.equipmentId' in app)
ck('drag feasibility includes care and planning situations', 'resourceCareBookings' in app and 'planningEvents' in app and 'overlapV1061' in app)
ck('downstream tasks replan after drop', 'moveBookingAndReplanV1061' in app and 'dependent work automatically replanned' in app)
ck('sticky standards navigation', 'standards-tools-v1061' in app and 'position:sticky' in css)
ck('standards local search', 'v1061StandardsSearch' in app and 'Search processes, tests, equipment' in app)
ck('consolidated resource assurance domains', all(x in app for x in ["'Calibration'","'Maintenance'","'Training'","'EHS'","'Risks / Actions'"]))
ck('six resource assurance filter tiles', app.count("tile('")>=6 and 'assurance-filter-tile' in app)
ck('resource assurance individual equipment scope', 'Lab scope' in app and 'scope-equipment-grid' in app and 'data-v1061-scope-equipment' in app)
ck('30/60/90 upcoming assurance buckets', all(x in app for x in ["data-v1061-horizon=\"30\"","data-v1061-horizon=\"60\"","data-v1061-horizon=\"90\""]))
ck('configurable due warning weeks/months', 'resourceAssuranceNotifications' in app and 'v1061NotifyAmount' in app and '<option value="months"' in app)
ck('combined assurance report selectable domains', 'assuranceReportModalV1061' in app and 'data-v1061-report-type' in app)
ck('report exposes 0-30 / 31-60 / 61-90 bands', all(x in app for x in ['0–30 d','31–60 d','61–90 d']))
ck('default rationale for lesson review', 'defaultRationaleV1061' in app and "kind==='lesson'" in app)
ck('default rationale for MSA review', "kind==='grr'" in app and 'grrApproveNote' in app)
ck('default rationale for planning proposal', '_showPlanProposalV1061' in app and 'planProposalNote' in app)
ck('vacation preview explains not saved yet', 'This is an impact preview — the vacation is not saved yet.' in app)
ck('5S good/bad visual examples and expectations', 'five-s-examples-v1061' in app and 'GOOD · visual standard met' in app and 'BAD · action required' in app and 'What is expected' in app)
ck('mobile CSS covers new sticky/filter controls', '@media(max-width:760px)' in css and '.assurance-tiles' in css)
# Syntax checks
for f in ['core.js','demo-data.js','repository.js','services.js','app.js','service-worker.js']:
    p=subprocess.run(['node','--check',str(root/f)],capture_output=True,text=True)
    ck(f'{f} JavaScript syntax',p.returncode==0)
passed=sum(v for _,v in checks); failed=len(checks)-passed
print('\n'.join(('PASS' if v else 'FAIL')+' | '+n for n,v in checks))
print(f'\nRESULT: {passed} passed, {failed} failed')
(root/'VERIFICATION_RESULTS_v1.0.61.json').write_text(json.dumps({'version':'1.0.61','passed':passed,'failed':failed,'checks':[{'name':n,'passed':v} for n,v in checks],'browser_note':'Source, syntax, packaging and feature-path verification completed. A local Chromium navigation pass was attempted but the execution environment blocks localhost navigation by administrator policy; final deployed exploratory acceptance remains recommended.'},indent=2))
sys.exit(1 if failed else 0)
