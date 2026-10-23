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

function createRuntime(savedState = null, clock = null) {
  class LatLng {
    constructor(lat, lng) { this.lat = lat; this.lng = lng; }
  }
  const stored = new Map();
  if (savedState) stored.set('plugin-anchor-planner-v1', JSON.stringify(savedState));
  const context = {
    console,
    clearTimeout: clock ? clock.clearTimeout : clearTimeout,
    setTimeout: clock ? clock.setTimeout : setTimeout,
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
  ap.state.lastScan = {
    plannedLinks: 1,
    unconfirmedLinks: 1,
    finalScanComplete: false,
    finalScanAt: '2026-09-23T12:00:00.000Z',
    finalScanViews: 12,
    finalScanTotalViews: 14
  };
  const readiness = ap.getReadiness([{
    guid: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    title: 'A',
    linkCount: 1,
    openLinks: 1,
    requiredKeys: 0
  }]);
  assert.equal(readiness.summary.includes('final blocker check incomplete'), true, 'An attempted but capped final scan must be shown as incomplete.');
  assert.equal(readiness.summary.includes('final blocker check pending'), false, 'An attempted final scan must not revert to pending.');
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
  ap.FINAL_SCAN_SETTLE_MS = 10;
  let automaticNameRefreshes = 0;
  ap.queueMissingNameRefresh = () => { automaticNameRefreshes++; return true; };
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
  ap.onFinalScanMapDataRefreshStart();
  ap.onFinalScanMapDataRefreshEnd();
  context.window.links.blocker = {
    options: { data: { oGuid: 'cccccccccccccccccccccccccccccccc', dGuid: 'dddddddddddddddddddddddddddddddd' } },
    getLatLngs: () => [{ lat: 0, lng: 1 }, { lat: 1, lng: 0 }]
  };
  ap.onFinalScanLinkAdded();
  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(ap.runtime.finalScan, null);
  assert.equal(ap.runtime.links[0].blocked, true);
  assert.equal(ap.state.lastScan.finalScanComplete, true);
  assert.equal(ap.state.finalScanProgress, null, 'Completed final-scan progress must be removed.');
  assert.deepEqual(mapViews.at(-1), { center: originalCenter, zoom: 8 }, 'The original map view must be restored after the final scan.');
  assert.equal(automaticNameRefreshes, 1, 'New blocker endpoints must trigger automatic name loading after final-scan recomputation.');
}

function createClock() {
  let now = 0, serial = 0;
  const timers = new Map();
  return {
    setTimeout(callback, delay = 0) { const id = ++serial; timers.set(id, { at: now + delay, callback }); return id; },
    clearTimeout(id) { timers.delete(id); },
    advance(ms) {
      const end = now + ms;
      let budget = 10000;
      while (budget--) {
        const next = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!next) { now = end; return; }
        timers.delete(next[0]); now = next[1].at; next[1].callback();
      }
      throw new Error('Unexpected unbounded final-check timers');
    },
    get pending() { return timers.size; }
  };
}

function loadFixture(saved = null) {
  const clock = createClock();
  const runtime = createRuntime(saved, clock);
  const { ap, context } = runtime;
  let center = { lat: 50, lng: 8 }, zoom = 8;
  const mapViews = [], messages = [];
  context.window.map = {
    project: p => ({ x: p.lng, y: p.lat }), unproject: p => ({ lat: p.y, lng: p.x }),
    getCenter: () => center, getZoom: () => zoom, getBounds: () => ({ center }),
    getContainer: () => ({ clientWidth: 800, clientHeight: 600 }),
    setView(p, z) { center = p; zoom = z; mapViews.push({ center: p, zoom: z }); }
  };
  ap.runtime.links = [{ id: 'a|b', a: 'a', b: 'b', existing: false, latlngA: { lat: 0, lng: 0 }, latlngB: { lat: 1, lng: 1 }, blockers: [] }];
  ap.renderPanel = ap.renderOverlays = ap.queueMissingNameRefresh = () => {};
  ap.setMessage = message => messages.push(message);
  const request = {
    getStatus: () => ({ short: request.status }), status: 'refreshing',
    fetchedDataParams: { mapZoom: 13, bounds: { contains: () => request.covered } }, covered: true,
    activeRequestCount: 0, queuedTiles: {}, requestedTiles: {}, renderQueue: [], renderQueuePaused: false,
    failedTileCount: 0, staleTileCount: 0
  };
  context.window.IITC = { map: { request } };
  return { ...runtime, clock, request, mapViews, messages };
}

{
  const { ap, clock, request } = loadFixture();
  ap.startFinalScan(); ap.onFinalScanMapDataRefreshStart();
  clock.advance(9000);
  assert.ok(ap.runtime.finalScan?.running, 'A normal nine-second load must not fail at the former eight-second cutoff.');
  request.status = 'done'; ap.onFinalScanMapDataRefreshEnd(); clock.advance(1200);
  assert.equal(ap.runtime.finalScan, null);
  assert.equal(ap.state.lastScan.finalScanComplete, true);
  assert.equal(ap.state.lastScan.finalScanViews, 1);
}

{
  const { ap, clock, request } = loadFixture();
  request.status = 'done';
  ap.startFinalScan(); clock.advance(1200);
  assert.equal(ap.state.lastScan.finalScanComplete, true, 'Matching, drained cached coverage must succeed without a new start/end hook pair.');
  assert.equal(ap.state.lastScan.finalScanTimedOut, false);
  assert.equal(clock.pending, 0);
}

{
  const { ap, clock, request } = loadFixture();
  request.status = 'done'; request.renderQueue = [{}];
  ap.startFinalScan(); clock.advance(2000);
  assert.ok(ap.runtime.finalScan.running, 'Done status with unrendered entities must keep waiting.');
  request.renderQueue = []; request.activeRequestCount = 1; clock.advance(1000);
  assert.ok(ap.runtime.finalScan.running, 'An active request must not be considered complete.');
  request.activeRequestCount = 0; clock.advance(1500);
  assert.equal(ap.state.lastScan.finalScanComplete, true);
}

{
  const { ap, clock, request, stored, messages } = loadFixture();
  ap.buildFinalScanCheckpoints = () => ({ points: [{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }], total: 2, truncated: false });
  ap.startFinalScan(); ap.onFinalScanMapDataRefreshStart();
  request.status = 'done'; ap.onFinalScanMapDataRefreshEnd(); clock.advance(1100);
  assert.equal(ap.runtime.finalScan.index, 1);
  request.covered = false; clock.advance(31000);
  assert.equal(ap.state.lastScan.finalScanComplete, false);
  assert.equal(ap.state.lastScan.finalScanViews, 1, 'Timed-out visits must not count as successfully checked.');
  assert.equal(ap.state.lastScan.finalScanTotalViews, 2);
  assert.equal(ap.state.lastScan.finalScanTimedOut, true);
  assert.equal(ap.canResumeFinalScan(), true);
  assert.equal(ap.state.finalScanProgress.points.length, 1, 'Retry only the failed view.');
  assert.match(messages.at(-1), /Resume check/);
  const reloaded = loadFixture(JSON.parse(stored.get(ap.STORAGE_KEY)));
  reloaded.ap.load(); reloaded.request.status = 'done';
  assert.equal(reloaded.ap.canResumeFinalScan(), true);
  reloaded.ap.startFinalScan(); reloaded.clock.advance(1200);
  assert.equal(reloaded.mapViews[0].center.lat, 1, 'Reloaded retry must skip the already checked first view.');
  assert.equal(reloaded.ap.state.lastScan.finalScanViews, 2);
  assert.equal(reloaded.ap.state.lastScan.finalScanComplete, true);
  assert.equal(reloaded.ap.state.lastScan.finalScanTimedOut, false, 'A successful retry clears the previous timeout.');
  assert.equal(reloaded.ap.state.finalScanProgress, null);
}

{
  const { ap, clock, request } = loadFixture();
  ap.buildFinalScanCheckpoints = () => ({ points: [{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }], total: 2, truncated: false });
  request.status = 'done'; ap.startFinalScan();
  // Constant late link arrivals must not disable the overall loading deadline.
  for (let i = 0; i < 59; i++) { clock.advance(500); ap.onFinalScanLinkAdded(); }
  clock.advance(2000);
  assert.equal(ap.runtime.finalScan, null, 'A timed-out quiet period must not leave a stale timer blocking the next cached view.');
  assert.equal(ap.state.lastScan.finalScanViews, 1);
  assert.equal(ap.state.finalScanProgress.points.length, 1);
}

{
  const { ap, context, request, clock } = loadFixture();
  context.window.mapDataRequest = request; delete context.window.IITC;
  request.status = 'done'; ap.startFinalScan(); clock.advance(1200);
  assert.equal(ap.state.lastScan.finalScanComplete, true, 'Older IITC global mapDataRequest must support verified cache reuse.');
}

for (const failure of ['no hooks', 'wrong zoom', 'missing coverage', 'failed tiles', 'stale tiles']) {
  const { ap, context, request, clock } = loadFixture();
  request.status = 'done';
  if (failure === 'no hooks') delete context.window.IITC;
  if (failure === 'wrong zoom') request.fetchedDataParams.mapZoom = 12;
  if (failure === 'missing coverage') request.covered = false;
  if (failure === 'failed tiles') request.failedTileCount = 1;
  if (failure === 'stale tiles') request.staleTileCount = 1;
  ap.startFinalScan();
  if (failure !== 'no hooks') { ap.onFinalScanMapDataRefreshStart(); ap.onFinalScanMapDataRefreshEnd(); }
  clock.advance(32000);
  assert.equal(ap.state.lastScan.finalScanComplete, false, `${failure} must never give a false all-clear.`);
  assert.equal(ap.state.lastScan.finalScanViews, 0);
  assert.equal(ap.canResumeFinalScan(), true);
  assert.equal(clock.pending, 0);
}

{
  const { ap, request, clock, messages } = loadFixture();
  ap.buildFinalScanCheckpoints = () => ({ points: [{ lat: 0, lng: 0 }], total: 14, truncated: true });
  request.status = 'done'; ap.startFinalScan(); clock.advance(1200);
  assert.equal(ap.state.lastScan.finalScanComplete, false);
  assert.equal(ap.state.lastScan.finalScanTimedOut, false);
  assert.match(messages.at(-1), /twelve-view limit/);
  assert.equal(ap.canResumeFinalScan(), false, 'A capped plan must not offer a retry with no missing stored views.');
}

{
  const { ap, request, clock } = loadFixture();
  ap.startFinalScan(); ap.pauseFinalScan(); request.status = 'done'; clock.advance(32000);
  assert.equal(ap.runtime.finalScan, null);
  assert.equal(ap.canResumeFinalScan(), true);
  assert.equal(clock.pending, 0, 'Pausing must cancel the polling, timeout and settling timers.');
}

{
  const { ap, clock } = loadFixture();
  ap.state.finalScanProgress = {
    planSignature: ap.finalScanPlanSignature(ap.runtime.links), points: [{ lat: 8, lng: 8 }, { lat: 9, lng: 9 }],
    total: 2, index: 1, targetZoom: 13, timedOut: true, truncated: false, links: []
  };
  ap.startFinalScan();
  assert.equal(ap.runtime.finalScan.index, 0, 'Legacy timed-out progress without a verified count must be rechecked from scratch.');
  assert.equal(ap.runtime.finalScan.checked, 0);
  ap.pauseFinalScan(); clock.advance(32000);
  assert.equal(clock.pending, 0);
}

console.log('Final blocker scan checks passed: slow loads, cached coverage, renderer/request queues, failed/stale tiles, accurate counts, retry/reload, timeouts, view cap, pause/cleanup, hook fallback, zoom, blockers and names');
