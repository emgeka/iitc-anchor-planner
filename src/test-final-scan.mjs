import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const userscript = fs.readFileSync(path.join(sourceDir, 'iitc-anchor-planner.user.js'), 'utf8');
const wrapperStart = userscript.indexOf('function wrapper(plugin_info) {');
const wrapperEnd = userscript.indexOf('var script = document.createElement', wrapperStart);
const wrapperSource = userscript.slice(wrapperStart, wrapperEnd);

function createRuntime(savedState = null) {
  class LatLng {
    constructor(lat, lng) { this.lat = lat; this.lng = lng; }
  }
  const stored = new Map();
  if (savedState) stored.set('plugin-anchor-planner-v1', JSON.stringify(savedState));
  const context = {
    console,
    clearTimeout,
    setTimeout,
    document: { documentElement: { lang: '' }, getElementById() { return null; } },
    localStorage: {
      getItem(key) { return stored.has(key) ? stored.get(key) : null; },
      setItem(key, value) { stored.set(key, String(value)); }
    },
    navigator: { languages: [], language: '' },
    L: { LatLng, latLng: (lat, lng) => new LatLng(lat, lng) },
    window: { bootPlugins: [], portals: {}, links: {}, innerWidth: 800, innerHeight: 600 }
  };
  vm.runInNewContext(`${wrapperSource}\nwrapper({});`, context);
  return { ap: context.window.plugin.anchorPlanner, context, stored };
}

{
  const { ap, context } = createRuntime();
  context.window.IITC = { map: { tiles: { params: { ZOOM_TO_LINK_LENGTH: [200000, 200000, 200000, 200000, 200000, 200000, 200000, 100000, 50000, 10000, 5000, 1000, 300, 0, 0] } } } };
  context.window.map = { getMinZoom: () => 3, getMaxZoom: () => 21 };
  assert.equal(ap.getFinalScanZoom(), 13, 'The final scan must use the first IITC zoom without a link-length filter.');
}

{
  const { ap, context } = createRuntime();
  context.window.map = {
    project: (latlng) => ({ x: latlng.lng * 100, y: latlng.lat * 100 }),
    unproject: (point) => ({ lat: point.y / 100, lng: point.x / 100 })
  };
  const links = [
    { existing: true, latlngA: { lat: 0, lng: 0 }, latlngB: { lat: 0, lng: 100 } },
    { existing: false, latlngA: { lat: 1, lng: 0 }, latlngB: { lat: 1, lng: 100 } }
  ];
  const checkpoints = ap.buildFinalScanCheckpoints(links, 13, { width: 400, height: 400 }, 3);
  assert.equal(checkpoints.points.length, 3);
  assert.equal(checkpoints.truncated, true);
  assert.ok(checkpoints.points.every((point) => point.lat === 1), 'Existing planned links must not generate final-scan checkpoints.');
}

{
  const { ap } = createRuntime();
  const target = ap.createExistingLinkAccumulator();
  const link = { guid: 'link-1', a: 'a', b: 'b' };
  ap.mergeExistingLinkInfo(target, { list: [link], unresolved: 0 });
  ap.mergeExistingLinkInfo(target, { list: [link], unresolved: 0 });
  assert.equal(target.count, 1);
  assert.equal(target.list.length, 1, 'Links seen in overlapping views must be accumulated only once.');
}

{
  const { ap } = createRuntime();
  ap.runtime.stats = {
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: { guid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', title: 'A', linkCount: 1 },
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb: { guid: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', title: 'B', linkCount: 1 }
  };
  ap.runtime.links = [{
    id: ap.normalizedLinkId('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'),
    a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', b: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', existing: false,
    latlngA: { lat: 0, lng: 0 }, latlngB: { lat: 1, lng: 1 }, blockers: []
  }];
  ap.state.lastScan = { plannedLinks: 1, unconfirmedLinks: 1 };
  ap.save = () => {};
  ap.renderOverlays = () => {};
  ap.renderPanel = () => {};
  const blocker = { guid: 'blocker', a: 'c', b: 'd', latlngA: { lat: 0, lng: 1 }, latlngB: { lat: 1, lng: 0 } };
  const coverage = ap.createExistingLinkAccumulator();
  ap.mergeExistingLinkInfo(coverage, { list: [blocker], unresolved: 0 });
  ap.applyExistingLinkCoverage(coverage, { complete: true, checked: 2, total: 2, zoom: 13 });
  assert.equal(ap.runtime.links[0].blocked, true);
  assert.equal(ap.state.lastScan.blockedPlannedLinks, 1);
  assert.equal(ap.state.lastScan.finalScanComplete, true);
  assert.equal(ap.runtime.stats.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.requiredKeys, 1);
}

{
  const { ap } = createRuntime();
  ap.runtime.links = [{ id: 'a--b', existing: true }];
  let message = '';
  ap.setMessage = (value) => { message = value; };
  assert.equal(ap.startFinalScan(), false);
  assert.equal(message, 'No unconfirmed plan links require a final check.');
  ap.state.lastScan = { plannedLinks: 1, unconfirmedLinks: 0, existingPlannedLinks: 1 };
  const readiness = ap.getReadiness([]);
  assert.equal(readiness.summary.includes('final blocker check pending'), false, 'Fully existing plans must not require a final scan.');
}

{
  const { ap, context, stored } = createRuntime();
  const originalCenter = { lat: 50, lng: 8 };
  const mapViews = [];
  context.window.map = {
    project: (latlng) => ({ x: latlng.lng, y: latlng.lat }),
    unproject: (point) => ({ lat: point.y, lng: point.x }),
    getMinZoom: () => 3,
    getMaxZoom: () => 21,
    getCenter: () => originalCenter,
    getZoom: () => 8,
    getContainer: () => ({ clientWidth: 800, clientHeight: 600 }),
    setView(center, zoom) { mapViews.push({ center, zoom }); }
  };
  ap.runtime.stats = {
    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: { guid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', title: 'A', linkCount: 1 },
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb: { guid: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', title: 'B', linkCount: 1 }
  };
  ap.runtime.links = [{
    id: ap.normalizedLinkId('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'),
    a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', b: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', existing: false,
    latlngA: { lat: 0, lng: 0 }, latlngB: { lat: 1, lng: 1 }, blockers: []
  }];
  ap.state.lastScan = { plannedLinks: 1, unconfirmedLinks: 1 };
  ap.renderPanel = () => {};
  ap.renderOverlays = () => {};
  ap.setMessage = () => {};
  assert.equal(ap.startFinalScan(), true);
  assert.equal(ap.pauseFinalScan(), true);
  assert.equal(ap.runtime.finalScan, null);
  assert.equal(ap.canResumeFinalScan(), true);
  assert.equal(ap.state.finalScanProgress.index, 0, 'Pausing during a view must resume that same unchecked view.');
  assert.deepEqual(mapViews.at(-1), { center: originalCenter, zoom: 8 });
  const reloaded = createRuntime(JSON.parse(stored.get(ap.STORAGE_KEY)));
  reloaded.ap.load();
  reloaded.ap.runtime.links = ap.runtime.links;
  assert.equal(reloaded.ap.canResumeFinalScan(), true, 'Saved progress must remain resumable after an IITC reload.');
  reloaded.ap.runtime.links = [{ id: 'changed-plan', existing: false }];
  assert.equal(reloaded.ap.canResumeFinalScan(), false, 'Changed plans must not resume stale progress.');
  assert.equal(ap.startFinalScan(), true, 'A saved check for the unchanged plan must resume.');
  context.window.links.blocker = {
    options: { data: { oGuid: 'cccccccccccccccccccccccccccccccc', dGuid: 'dddddddddddddddddddddddddddddddd' } },
    getLatLngs: () => [{ lat: 0, lng: 1 }, { lat: 1, lng: 0 }]
  };
  ap.onFinalScanMapDataRefreshStart();
  ap.onFinalScanMapDataRefreshEnd();
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(ap.runtime.finalScan, null);
  assert.equal(ap.runtime.links[0].blocked, true);
  assert.equal(ap.state.lastScan.finalScanComplete, true);
  assert.equal(ap.state.finalScanProgress, null, 'Completed final-scan progress must be removed.');
  assert.deepEqual(mapViews.at(-1), { center: originalCenter, zoom: 8 }, 'The original map view must be restored after the final scan.');
}

console.log('Final blocker scan checks passed: zoom selection, unconfirmed-only coverage, pause/reload resume, stale-plan rejection, deduplication, blocker recomputation, existing-link no-op');
