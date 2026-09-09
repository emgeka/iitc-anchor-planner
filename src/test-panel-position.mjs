import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const userscriptPath = path.join(sourceDir, 'iitc-anchor-planner.user.js');
const userscript = fs.readFileSync(userscriptPath, 'utf8');
const wrapperStart = userscript.indexOf('function wrapper(plugin_info) {');
const wrapperEnd = userscript.indexOf('var script = document.createElement', wrapperStart);
const wrapperSource = userscript.slice(wrapperStart, wrapperEnd);

function createRuntime(savedState = null) {
  const stored = new Map();
  if (savedState) stored.set('plugin-anchor-planner-v1', JSON.stringify(savedState));
  const context = {
    console,
    document: { documentElement: { lang: '', clientWidth: 800, clientHeight: 600 } },
    localStorage: {
      getItem(key) { return stored.has(key) ? stored.get(key) : null; },
      setItem(key, value) { stored.set(key, String(value)); }
    },
    navigator: { languages: [], language: '' },
    window: { bootPlugins: [], portals: {}, innerWidth: 800, innerHeight: 600 }
  };
  vm.runInNewContext(`${wrapperSource}\nwrapper({});`, context, { filename: userscriptPath });
  return { ap: context.window.plugin.anchorPlanner, stored };
}

function createClassList() {
  const values = new Set();
  return {
    add(value) { values.add(value); },
    remove(value) { values.delete(value); },
    contains(value) { return values.has(value); }
  };
}

{
  const { ap } = createRuntime({ panelPosition: { left: '120', top: 80 } });
  ap.load();
  assert.equal(ap.state.panelPosition.left, 120);
  assert.equal(ap.state.panelPosition.top, 80);
}

{
  const { ap } = createRuntime({ panelPosition: { left: 'invalid', top: 80 } });
  ap.load();
  assert.equal(ap.state.panelPosition, null, 'Invalid saved coordinates must fall back to the responsive default.');
}

{
  const { ap } = createRuntime();
  const position = ap.clampPanelPosition(900, -20, 360, 300, 800, 600);
  assert.equal(position.left, 435, 'The panel must remain inside the right viewport margin.');
  assert.equal(position.top, 5, 'The panel must remain inside the top viewport margin.');
}

{
  const { ap, stored } = createRuntime();
  const classList = createClassList();
  const panel = {
    classList,
    style: {},
    getBoundingClientRect() { return { left: 100, top: 50, width: 360, height: 300 }; }
  };
  ap.runtime.panel = panel;
  ap.startPanelDrag(120, 70, 7);
  assert.equal(ap.movePanelDrag(1000, 1000, 8), false, 'Unrelated pointers must not move the panel.');
  assert.equal(ap.movePanelDrag(1000, 1000, 7), true);
  assert.equal(panel.style.left, '435px');
  assert.equal(panel.style.top, '295px');
  assert.equal(ap.endPanelDrag(7), true);
  assert.deepEqual(JSON.parse(stored.get(ap.STORAGE_KEY)).panelPosition, { left: 435, top: 295 });
  assert.equal(classList.contains('ap-dragging'), false);
}

{
  const { ap } = createRuntime();
  const panel = { classList: createClassList() };
  const head = { classList: createClassList(), parentNode: panel, tagName: 'DIV' };
  head.classList.add('ap-head');
  const title = { classList: createClassList(), parentNode: head, tagName: 'B' };
  const button = { classList: createClassList(), parentNode: head, tagName: 'BUTTON' };
  const content = { classList: createClassList(), parentNode: panel, tagName: 'DIV' };
  ap.runtime.panel = panel;
  assert.equal(ap.isPanelDragHandle(title), true);
  assert.equal(ap.isPanelDragHandle(button), false, 'The collapse button must remain clickable.');
  assert.equal(ap.isPanelDragHandle(content), false, 'Panel content must not become a map-drag blocker.');
}

console.log('Panel position checks passed: migration, viewport clamping, pointer isolation, persistence, drag-handle scope');
