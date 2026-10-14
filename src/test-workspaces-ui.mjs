import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./iitc-anchor-planner.user.js', import.meta.url), 'utf8');
const wrapper = source.slice(source.indexOf('function wrapper(plugin_info) {'), source.indexOf('var script = document.createElement'));
function point(lat, lng) {
  if (typeof lat === 'object') ({ lat, lng } = lat);
  return { lat, lng, distanceTo(p) { return Math.hypot(lat - p.lat, lng - p.lng) * 111000; } };
}
function ids(html) {
  return new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(match => [match[1], { id: match[1], setAttribute() {} }]));
}
function runtime() {
  const stored = new Map(), classes = new Set(), dialogs = [], dialogNodes = new Map();
  let panelNodes = new Map(), html = '';
  const panel = { style: {},
    classList: { contains: v => classes.has(v), add: v => classes.add(v), remove: v => classes.delete(v), toggle(v, set) { if (set) classes.add(v); else classes.delete(v); } },
    querySelector(selector) { return selector.startsWith('#') ? panelNodes.get(selector.slice(1)) || null : null; }, querySelectorAll() { return []; },
    get innerHTML() { return html; }, set innerHTML(value) { html = value; panelNodes = ids(value); } };
  const context = { console, L: { latLng: point }, navigator: {},
    document: { documentElement: {}, getElementById(id) { return panelNodes.get(id) || dialogNodes.get(id) || null; } },
    localStorage: { getItem: key => stored.get(key) || null, setItem: (key, value) => stored.set(key, value) },
    window: { bootPlugins: [], portals: {}, plugin: {}, alert() {}, innerWidth: 360,
      dialog(options) { for (const [id, node] of ids(options.html || '')) dialogNodes.set(id, node);
        const handle = { options, closed: false, dialog(action) { if (action === 'close') { this.closed = true; options.closeCallback?.(); } } }; dialogs.push(handle); return handle; } } };
  vm.runInNewContext(wrapper + '\nwrapper({});', context);
  const ap = context.window.plugin.anchorPlanner;
  ap.runtime.panel = panel; ap.state.language = 'en';
  ap.correctPanelPosition = ap.renderOverlays = ap.queueMissingNameRefresh = () => {};
  ap.wireTaskList = () => {};
  ap.scan = () => {};
  return { ap, panel, context, stored, dialogs, node: id => panelNodes.get(id) || null };
}
function savedFan(ap) {
  ap.state.fanDesign = { anchors: ['A'], assignments: { B: 'A', C: 'A' },
    portals: [{ guid: 'A', title: 'A', lat: 0, lng: 0 }, { guid: 'B', title: 'B', lat: 0, lng: 1 }, { guid: 'C', title: 'C', lat: 1, lng: 0 }],
    links: [['A', 'B'], ['A', 'C'], ['B', 'C']], fields: [['A', 'B', 'C']], areaKeys: [] };
}
{
  const { ap, panel, node } = runtime();
  savedFan(ap); ap.state.planSource = 'fan';
  ap.getReadiness = () => { throw Error('Home must not render a working plan'); };
  ap.renderPanel();
  assert.ok(node('ap-home-anchors') && node('ap-home-fan'));
  assert.ok(panel.innerHTML.includes('Review and execute an existing Draw Tools link plan'));
  for (const id of ['ap-scan', 'ap-tasks', 'ap-final-scan', 'ap-next-task', 'ap-more', 'ap-key-import', 'ap-key-reset', 'ap-fan-design', 'ap-filters', 'ap-clear', 'ap-tolerance']) assert.equal(node(id), null, `Home must not expose ${id}`);
  assert.ok(node('ap-settings'));
  assert.equal(node('ap-language'), null, 'Language lives in the separate global settings dialog');
  assert.equal(ap.state.planSource, 'fan', 'Home does not change the saved active plan');
}
{
  const { ap, panel, node, dialogs } = runtime();
  savedFan(ap);
  ap.renderPanel(); node('ap-home-anchors').onclick();
  assert.equal(ap.runtime.workspaceView, 'anchors'); assert.equal(ap.state.planSource, 'external');
  for (const id of ['ap-scan', 'ap-tasks', 'ap-tolerance', 'ap-home']) assert.ok(node(id), id);
  for (const id of ['ap-home-fan', 'ap-fan-open', 'ap-fan-design', 'ap-fan-remove-plan', 'ap-clear']) assert.equal(node(id), null, `Anchor area must not expose ${id}`);
  assert.ok(panel.innerHTML.indexOf('ap-view-nav') < panel.innerHTML.indexOf('ap-primary-actions'));
  const saved = JSON.stringify(ap.state.fanDesign);
  node('ap-home').onclick();
  assert.equal(ap.runtime.workspaceView, 'home');
  node('ap-home-fan').onclick();
  assert.equal(ap.runtime.workspaceView, 'fan'); assert.equal(ap.state.planSource, 'fan');
  assert.equal(JSON.stringify(ap.state.fanDesign), saved);
  for (const id of ['ap-fan-design', 'ap-fan-remove-plan', 'ap-scan', 'ap-tasks', 'ap-home']) assert.ok(node(id), id);
  assert.equal(node('ap-tolerance'), null, 'Coordinate matching tolerance does not belong in native fan controls');
  assert.equal(node('ap-language'), null);
  assert.equal(node('ap-anchor-workspace'), null); assert.equal(node('ap-home-anchors'), null);
  assert.ok(panel.innerHTML.includes('Refresh plan'));
  ap.showTaskList(); assert.ok(dialogs.at(-1).options.title.includes('Fan planner'));
  const taskDialog = dialogs.at(-1);
  node('ap-home').onclick();
  assert.equal(taskDialog.closed, true); assert.equal(ap.runtime.taskListOpen, false);
  assert.equal(JSON.stringify(ap.state.fanDesign), saved);
}
{
  const { ap, node } = runtime();
  let opened = 0; ap.showFanPlanner = () => { opened++; };
  ap.renderPanel(); node('ap-home-fan').onclick();
  assert.equal(ap.runtime.workspaceView, 'fan'); assert.equal(opened, 1);
  for (const id of ['ap-scan', 'ap-tasks', 'ap-key-import', 'ap-tolerance', 'ap-clear']) assert.equal(node(id), null, 'An unaccepted fan must not show the external working plan');
  assert.ok(node('ap-fan-design') && node('ap-home'));
  ap.showWorkspaceHome();
  ap.runtime.finalScan = { running: true };
  const source = ap.state.planSource;
  assert.equal(ap.openWorkspace('anchors'), false);
  assert.equal(ap.runtime.workspaceView, 'home'); assert.equal(ap.state.planSource, source);
}
{
  const { ap, node, context, dialogs } = runtime();
  savedFan(ap); ap.renderPanel(); node('ap-home-anchors').onclick();
  const before = ap.runtime.workspaceView;
  context.localStorage.setItem = () => { throw Error('full'); };
  assert.equal(ap.openWorkspace('fan'), false);
  assert.equal(ap.runtime.workspaceView, before);
  assert.equal(ap.state.planSource, 'external');
  ap.showPluginSettings();
  assert.ok(dialogs.at(-1).options.html.includes('ap-global-clear'));
  assert.ok(dialogs.at(-1).options.html.includes('ap-global-language'));
  assert.ok(!dialogs.at(-1).options.html.includes('ap-tolerance'));
  assert.equal(dialogs.at(-1).options.width, 340);
}
{
  const { ap, panel, node } = runtime();
  for (const language of Object.keys(ap.LOCALES)) {
    ap.state.language = language; ap.runtime.workspaceView = 'home'; ap.renderPanel();
    assert.ok(node('ap-home-anchors') && node('ap-home-fan'));
    assert.ok(!panel.innerHTML.includes('{'));
  }
  ap.state.panelCollapsed = true; ap.renderPanel();
  assert.equal(node('ap-home-fan'), null);
  node('ap-collapse').onclick(); assert.ok(node('ap-home-fan'));
}
console.log('Workspace UI: pure home choice, isolated anchor/fan controls, empty fan workflow, settings scope, contextual tasks, dialog cleanup, preserved plans and failed navigation passed.');
