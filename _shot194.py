from pathlib import Path
import re
from playwright.sync_api import sync_playwright
R=Path('/mnt/data/labos94')
h=(R/'index.html').read_text();h=re.sub(r'<link[^>]+href="(?:styles\.css[^\"]*|manifest\.webmanifest|favicon-[^\"]*|apple-touch-icon\.png)"[^>]*>','',h);h=re.sub(r'<script src="[^"]+"></script>','',h)
a=(R/'app.js').read_text();a=a.replace("window.addEventListener('DOMContentLoaded',init);","window.__SHOT_RENDER__=render;window.addEventListener('DOMContentLoaded',init);")
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']); pg=b.new_page(viewport={'width':1800,'height':1100}); pg.set_content(h);pg.add_style_tag(content=(R/'styles.css').read_text());
 for f in ['core.js','demo-data.js','repository.js','services.js']:pg.add_script_tag(content=(R/f).read_text())
 pg.add_script_tag(content=a);pg.evaluate("window.dispatchEvent(new Event('DOMContentLoaded'))");pg.wait_for_function("window.__PROTOLAB_READY__===true");pg.evaluate("ProtoLabApp.currentView='planning';ProtoLabApp.filters.planView='portfolio';__SHOT_RENDER__()")
 pg.wait_for_timeout(300);pg.locator('.planning-visual-main').screenshot(path=str(R/'REV1094_MASTER_PLANNER_PROOF.png'))
 b.close()
