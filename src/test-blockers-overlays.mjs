import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./iitc-anchor-planner.user.js', import.meta.url), 'utf8');
const wrapper = source.slice(source.indexOf('function wrapper(plugin_info) {'), source.indexOf('var script = document.createElement'));
function point(lat, lng) {
  if (typeof lat === 'object') ({ lat, lng } = lat);
  return { lat, lng, distanceTo(p) { return Math.hypot(lat - p.lat, lng - p.lng) * 111000; } };
}
function node() { return { style: {}, children: [], appendChild(child) { this.children.push(child); child.parentNode = this; }, innerHTML: '' }; }
function runtime() {
  const storage = new Map();
  const context = { console, L: { LatLng: class {}, latLng: point }, navigator: {}, setTimeout() {},
    window: { bootPlugins: [], portals: {}, links: {}, PLAYER: { team: 'RESISTANCE' }, TEAM_RES: 1, TEAM_ENL: 2, TEAM_MAC: 3 },
    document: { documentElement: {}, getElementById() { return null; }, createElement: node },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) } };
  vm.runInNewContext(wrapper + '\nwrapper({});', context);
  const ap = context.window.plugin.anchorPlanner;
  ap.state.language = 'en';
  ap.renderPanel = ap.renderOverlays = ap.refreshTaskList = ap.queueMissingNameRefresh = ap.refreshKeyList = () => {};
  context.window.plugin.keys = { keys: { B: 5 }, addKey(delta, guid) { this.keys[guid] = (this.keys[guid] || 0) + delta; } };
  return { ap, context, storage };
}
function intel(a, b, team, x, y, timestamp = 1) {
  return { options: { team, timestamp, data: { oGuid: a, dGuid: b } }, getLatLngs: () => [x, y] };
}
function planned(ap) {
  const link = { id: 'A|B', a: 'A', b: 'B', titleA: 'A', titleB: 'B', latlngA: point(0, 0), latlngB: point(0, 2), existing: false, blockers: [] };
  ap.runtime.links = [link];
  ap.runtime.stats = { A: { guid: 'A', title: 'A', lat: 0, lng: 0, linkCount: 1 }, B: { guid: 'B', title: 'B', lat: 0, lng: 2, linkCount: 1 } };
  ap.state.linkDirections['A|B'] = 'A';
  return link;
}
{
  const { ap, context } = runtime();
  for (const [input, expected] of [['RESISTANCE', 'res'], ['R', 'res'], [1, 'res'], ['ENLIGHTENED', 'enl'], ['E', 'enl'], [2, 'enl'], ['MACHINA', 'mac'], ['M', 'mac'], [3, 'mac'], [null, 'unknown'], [0, 'unknown'], [999, 'unknown']]) assert.equal(ap.normalizeFaction(input), expected);
  assert.equal(ap.linkFaction({ options: { data: { team: 'E' } } }), 'enl');
  assert.equal(ap.factionRelation({ faction: 'res' }), 'own');
  assert.equal(ap.factionRelation({ faction: 'enl' }), 'enemy');
  assert.equal(ap.factionRelation({ faction: 'mac' }), 'enemy');
  delete context.window.PLAYER;
  assert.equal(ap.factionRelation({ faction: 'enl' }), 'unknown');
}
{
  const { ap, context } = runtime();
  context.window.links = Object.fromEntries([1, 2, 3, 999].map((team, i) => ['cross' + i, intel('X' + i, 'Y' + i, team, point(-1, .5 + i / 3), point(1, .5 + i / 3))]));
  const info = ap.collectExistingLinkIds([]), link = planned(ap);
  const blockers = ap.findBlockersForPlannedLink(link, info.list);
  assert.equal(blockers.length, 4, 'Every crossing faction remains a blocker');
  assert.deepEqual(Array.from(blockers, blocker => blocker.faction), ['res', 'enl', 'mac', 'unknown']);
  link.blockers = blockers; link.blocked = true;
  assert.match(ap.blockerFactionSummary([...blockers, blockers[0]]), /Friendly: 1 · Enemy: 2 · Unknown: 1/);
  const ownHtml = ap.taskBlockerHtml({ blocker: blockers[0], links: [link], manual: false, target: '' }, 0);
  assert.ok(ownHtml.includes('Friendly blocker') && ownHtml.includes('Coordinate removal or flipping'));
  assert.notEqual(ap.blockerColor(blockers[0]), ap.blockerColor(blockers[1]));
  const rows = ap.getBlockerWorklist(null);
  assert.equal(rows.length, 8);
  assert.ok(rows.every(row => Object.values(row.blockersById).length === 1));
  const exported = ap.buildBlockerExport()[0].blockingLinks;
  assert.equal(exported[0].faction, 'res'); assert.equal(exported[0].relation, 'own');
  const accumulator = ap.createExistingLinkAccumulator(); ap.mergeExistingLinkInfo(accumulator, info);
  ap.runtime.finalScan = { points: [point(0, 0)], accumulator, total: 1, index: 0, targetZoom: 15 };
  ap.persistFinalScanProgress(); ap.load();
  assert.equal(ap.state.finalScanProgress.links[0].faction, 'res');
  assert.equal(ap.state.finalScanProgress.links[0].timestamp, 1);
  const prior = ap.createExistingLinkAccumulator();
  ap.mergeExistingLinkInfo(prior, { list: [{ ...info.list[0], faction: 'unknown' }] });
  ap.mergeExistingLinkInfo(prior, info);
  assert.equal(prior.list[0].faction, 'res', 'Fresh known metadata upgrades an unknown cached faction');
}
{
  const { ap, context } = runtime();
  const link = planned(ap); ap.updateKeyConsumption();
  context.window.links.enemy = intel('A', 'B', 2, point(0, 0), point(0, 2), 10);
  const enemy = ap.collectExistingLinkIds([]);
  ap.applyExistingLinkCoverage(enemy);
  assert.equal(link.existing, false, 'Enemy geometry is not a completed own-faction throw');
  assert.equal(link.blockers.length, 1, 'Coincident enemy link requires removal at an endpoint');
  assert.equal(context.window.plugin.keys.keys.B, 5, 'Enemy link never spends the player stock');
  context.window.links = { own: intel('A', 'B', 1, point(0, 0), point(0, 2), 20) };
  assert.equal(ap.observeNewPlanLinks(), true);
  assert.equal(link.existing, true); assert.equal(link.existingGuid, 'own');
  assert.equal(link.blockers.length, 0);
  assert.equal(context.window.plugin.keys.keys.B, 4, 'New own-faction link uses the existing one-key rule');
  const old = ap.collectExistingLinkIds([]).list[0], accumulator = ap.createExistingLinkAccumulator();
  ap.mergeExistingLinkInfo(accumulator, { list: [old] });
  ap.mergeExistingLinkInfo(accumulator, enemy);
  assert.equal(accumulator.map['A|B'].guid, 'own', 'Older coverage cannot replace a newer live entity');
}
{
  const { ap, context } = runtime();
  const group = { layers: [], addLayer(layer) { this.layers.push(layer); } };
  ap.runtime.layerGroup = group;
  context.L.divIcon = options => ({ options });
  context.L.marker = (latlng, options) => ({ latlng, options, addTo(layer) { layer.addLayer(this); return this; } });
  context.window.map = { latLngToContainerPoint() { throw Error('Native markers must not be pinned to screen pixels'); }, getPane: () => ({}) };
  ap.addHtmlStatusMarker({ lat: 52.18, lng: 9.6 }, { key: 'ready' }, 'Portal<br>Keys 5/2', true);
  assert.equal(group.layers.length, 1);
  const marker = group.layers[0];
  assert.equal(marker.latlng.lat, 52.18); assert.equal(marker.latlng.lng, 9.6);
  assert.deepEqual(Array.from(marker.options.icon.options.iconAnchor), [16, 16]);
  assert.equal(marker.options.interactive, false); assert.equal(marker.options.clickable, false);
  assert.equal(marker.options.keyboard, false); assert.equal(marker.options.pane, ap.PANE_NAME);
  assert.equal(marker.options.title, 'Portal · Keys 5/2');
  assert.ok(marker.options.icon.options.html.includes('ap-map-badge-next'));
  assert.ok(marker.options.icon.options.html.includes('!important'));
  assert.equal(ap.runtime.htmlOverlay, null, 'No detached screen overlay is created for native markers');
}
{
  const { ap, context } = runtime();
  let offset = 0;
  const container = node();
  context.window.map = { getContainer: () => container, latLngToContainerPoint: latlng => ({ x: latlng.lng * 10 - offset, y: latlng.lat * 10 - offset }) };
  ap.addHtmlStatusMarker({ lat: 3, lng: 4 }, { key: 'ready' }, 'Portal', false);
  const badge = ap.runtime.htmlBadgeLocations[0].badge;
  assert.equal(badge.style.left, '40px');
  offset = 7; ap.positionHtmlStatusMarkers();
  assert.equal(badge.style.left, '33px'); assert.equal(badge.style.top, '23px');
  ap.clearHtmlOverlay(); assert.equal(ap.runtime.htmlBadgeLocations.length, 0);
}
console.log('Blocker factions/overlays: own/enemy/Machina/unknown, all crossing links, preserved checkpoint metadata, coincident enemy removal and key accounting, native geographic badges and moving fallback passed.');
