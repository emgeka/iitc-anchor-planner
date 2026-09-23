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
    clearTimeout,
    setTimeout,
    document: {
      documentElement: { lang: '', clientWidth: 800, clientHeight: 600 },
      getElementById() { return null; }
    },
    localStorage: {
      getItem(key) { return stored.has(key) ? stored.get(key) : null; },
      setItem(key, value) { stored.set(key, String(value)); }
    },
    navigator: { languages: [], language: '', userAgent: '' },
    window: { bootPlugins: [], portals: {}, innerWidth: 800, innerHeight: 600 }
  };
  vm.runInNewContext(`${wrapperSource}\nwrapper({});`, context, { filename: userscriptPath });
  return { ap: context.window.plugin.anchorPlanner, context, stored };
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

{
  const { ap } = createRuntime();
  assert.equal(ap.statusText({ key: 'done' }), '✓', 'Completed portals need an unambiguous check mark.');
  assert.equal(ap.statusText({ key: 'existing' }), 'K0', 'The zero-key marker must not resemble OK.');
}

{
  const { ap } = createRuntime();
  const panel = {
    classList: createClassList(),
    style: {},
    getBoundingClientRect() { return { left: 435, top: 295, width: 360, height: 500 }; }
  };
  ap.runtime.panel = panel;
  ap.state.panelPosition = { left: 435, top: 295 };
  ap.schedulePanelPositionCorrection(0);
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(panel.style.top, '95px', 'Expanded panel content must be moved back into the viewport after layout settles.');
}

{
  const { ap, context } = createRuntime();
  let selected = null;
  let rendered = null;
  let mapMoves = 0;
  let requests = 0;
  const marker = { getDetails() { return { title: 'Alpha' }; } };
  context.window.portals.portalA = marker;
  context.window.map = {
    setView() { mapMoves++; },
    panTo() { mapMoves++; },
    fitBounds() { mapMoves++; }
  };
  context.window.portalDetail = { request() { requests++; } };
  context.window.IITC = {
    portal: {
      display: {
        select(guid) { selected = guid; },
        renderToSidebar(portal) { rendered = portal; }
      }
    }
  };
  assert.equal(ap.showPortalDetails('portalA'), true);
  assert.equal(selected, 'portalA');
  assert.equal(rendered, marker);
  assert.equal(mapMoves, 0, 'Showing loaded details must not move or zoom the map.');
  assert.equal(requests, 0, 'Showing details must not request portal data.');
}

{
  const { ap, context } = createRuntime();
  let promptTitle = '';
  let promptText = '';
  context.window.prompt = function (title, text) { promptTitle = title; promptText = text; };
  ap.showPortalActions({ guid: 'blockerA', title: 'Blocker Alpha', lat: 50.1, lng: 8.6 });
  assert.equal(promptTitle, 'Share portal:');
  assert.match(promptText, /Blocker Alpha/);
  assert.match(promptText, /waze\.com/);
}

{
  const { ap, context } = createRuntime();
  context.window.portals.blockerA = { options: { data: { title: 'Loaded Blocker A' } } };
  ap.runtime.stats = { planA: { guid: 'planA', title: 'Named Plan' } };
  ap.runtime.links = [{
    blockers: [
      { a: 'blockerA', b: 'blockerB', titleA: '', titleB: '' },
      { a: 'blockerB', b: 'blockerC', titleA: '', titleB: 'Known Blocker C' }
    ]
  }];
  ap.runtime.existingLinks = [{ a: 'blockerB', b: 'blockerC', titleA: '', titleB: 'Known Blocker C' }];
  ap.state.finalScanProgress = { links: [{ a: 'blockerB', b: 'blockerC', titleA: '', titleB: 'Known Blocker C' }] };
  assert.deepEqual(Array.from(ap.collectMissingPortalNameGuids()).sort(), ['blockerB']);
  assert.equal(ap.runtime.links[0].blockers[0].titleA, 'Loaded Blocker A');
  assert.equal(ap.updatePortalTitle('blockerB', 'Loaded Blocker B'), true);
  assert.equal(ap.runtime.links[0].blockers[0].titleB, 'Loaded Blocker B');
  assert.equal(ap.runtime.links[0].blockers[1].titleA, 'Loaded Blocker B');
  assert.equal(ap.runtime.existingLinks[0].titleA, 'Loaded Blocker B');
  assert.equal(ap.state.finalScanProgress.links[0].titleA, 'Loaded Blocker B');

  ap.runtime.links[0].blockers.push({ a: 'blockerD', b: 'blockerA', titleA: '', titleB: 'Loaded Blocker A' });
  ap.runtime.links[0].blockers.push({ a: 'blockerD', b: 'blockerC', titleA: '', titleB: 'Known Blocker C' });
  const automaticCalls = [];
  const refreshMissingNames = ap.refreshMissingNames;
  ap.refreshMissingNames = function (auto) { automaticCalls.push(auto); };
  context.setTimeout = function (callback) { callback(); return 1; };
  assert.equal(ap.queueMissingNameRefresh(), true, 'A missing blocker name must start the automatic loader even when every plan portal is named.');
  assert.deepEqual(automaticCalls, [true]);

  const requested = [];
  ap.requestPortalDetails = function (guid, callback) {
    requested.push(guid);
    callback({ title: 'Loaded Blocker D' });
  };
  ap.setMessage = () => {};
  ap.renderOverlays = () => {};
  ap.renderPanel = () => {};
  ap.refreshMissingNames = refreshMissingNames;
  ap.refreshMissingNames(false);
  assert.deepEqual(requested, ['blockerD'], 'A repeated blocker endpoint must trigger only one detail request.');
  assert.equal(ap.runtime.links[0].blockers[2].titleA, 'Loaded Blocker D');
  assert.equal(ap.runtime.links[0].blockers[3].titleA, 'Loaded Blocker D');
  assert.equal(ap.queueMissingNameRefresh(), false, 'No automatic loader should start after every portal name has been resolved.');
}

{
  const { ap, context } = createRuntime();
  const layerGroup = { _map: null, addTo() { throw new Error('setupLayer must not force-enable a disabled layer'); } };
  context.L = { LayerGroup: function () { return layerGroup; } };
  context.window.map = {
    createPane() { return { style: {} }; },
    getPane() { return null; },
    hasLayer() { return false; },
    on() {}
  };
  context.window.addLayerGroup = function (name, layer, defaultDisplay) {
    assert.equal(name, 'Anchor Planner');
    assert.equal(layer, layerGroup);
    assert.equal(defaultDisplay, true);
  };
  ap.setupLayer();
  assert.equal(ap.runtime.enabled, false, 'The stored disabled layer state must remain disabled during setup.');
}

console.log('Runtime UI checks passed: panel positioning, delayed expansion correction, loaded portal details without map movement, automatic blocker-name loading and deduplication, persisted layer state');
