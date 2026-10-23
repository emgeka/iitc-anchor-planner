import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./iitc-anchor-planner.user.js', import.meta.url), 'utf8');
const wrapper = source.slice(source.indexOf('function wrapper(plugin_info) {'), source.indexOf('var script = document.createElement'));
function point(lat, lng) {
  if (typeof lat === 'object') ({ lat, lng } = lat);
  return { lat: Number(lat), lng: Number(lng), distanceTo(p) { return Math.hypot(this.lat - p.lat, this.lng - p.lng) * 111000; } };
}
class Line {
  constructor(points, options = {}) { this.points = points.map(p => point(p)); this.options = options; }
  getLatLngs() { return this.points; }
  addTo(group) { group.addLayer(this); return this; }
}
class Polygon extends Line {}
class Group {
  layers = [];
  addLayer(layer) { this.layers.push(layer); return this; }
  removeLayer(layer) { this.layers = this.layers.filter(p => p !== layer); }
  eachLayer(fn) { this.layers.forEach(fn); }
  clearLayers() { this.layers = []; }
  addTo(map) { map.addLayer(this); return this; }
}
function runtime() {
  const storage = new Map(), alerts = [], drawn = new Group();
  let saves = 0, scans = 0;
  const context = { console, L: { latLng: point, LatLng: class {}, Polygon, LayerGroup: Group, polyline: (p, o) => new Line(p, o), polygon: (p, o) => new Polygon(p, o), circleMarker: p => new Line([p]) },
    window: { bootPlugins: [], portals: {}, links: {}, alert: value => alerts.push(value), map: new Group() }, navigator: {},
    document: { documentElement: {}, getElementById() { return null; } },
    localStorage: { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v) } };
  vm.runInNewContext(wrapper + '\nwrapper({});', context);
  const ap = context.window.plugin.anchorPlanner;
  ap.state.language = 'en';
  context.window.plugin.drawTools = { drawnItems: drawn, save() { saves++; } };
  context.window.plugin.keys = { keys: { A: 7 }, addKey() { throw new Error('Planning must not change keys'); } };
  const realScan = ap.scan;
  ap.scan = () => { scans++; };
  ap.renderPanel = ap.renderOverlays = ap.refreshTaskList = () => {};
  ap.collectExistingLinkIds = () => ({ map: {}, list: [] });
  return { ap, context, drawn, storage, alerts, realScan, saves: () => saves, scans: () => scans };
}
const p = (guid, x, y) => ({ guid, title: guid, lat: y, lng: x });
const triangle = [p('A', 0, 0), p('B', 2, 0), p('C', 1, 1)];
const json = value => JSON.parse(JSON.stringify(value));
function draft(ap, portals = triangle, anchors = ['A'], source = 'plan') {
  ap.runtime.fanDraft = { portals, anchors, source, count: anchors.length, pinned: [], excluded: {}, assignments: {}, open: true, preview: null };
  ap.previewFanDesign();
  return ap.runtime.fanDraft;
}
{
  const { ap, context, storage } = runtime();
  const before = JSON.stringify(ap.state);
  const plan = ap.buildFanDesign(triangle, ['A'], {});
  assert.deepEqual(json(plan.errors), []);
  assert.equal(plan.links.length, 3);
  assert.equal(plan.fields.length, 1);
  assert.deepEqual(json(plan.assignments), { B: 'A', C: 'A' });
  assert.equal(JSON.stringify(ap.state), before);
  assert.equal(storage.size, 0);
  assert.equal(context.window.plugin.keys.keys.A, 7);
}
{
  const { ap } = runtime();
  const portals = [...triangle, p('D', 10, 0), p('E', 12, 0), p('F', 11, 1), p('G', 20, 0), p('H', 22, 0), p('I', 21, 1)];
  for (const anchors of [['A', 'D'], ['A', 'D', 'G']]) {
    const selected = portals.slice(0, anchors.length * 3);
    const plan = ap.buildFanDesign(selected, anchors, {});
    assert.deepEqual(json(plan.errors), []);
    assert.equal(Object.keys(plan.assignments).length, selected.length - anchors.length);
    for (const edge of plan.links) {
      assert.ok([edge.a, edge.b].every(portal => anchors.includes(portal.guid) ? portal.guid === edge.anchor : plan.assignments[portal.guid] === edge.anchor));
      assert.ok(!plan.links.some(other => ap.fanEdgesConflict(edge, other)));
    }
    assert.equal(new Set(plan.fields.map(field => field.map(p => p.guid).sort().join('|'))).size, plan.fields.length);
  }
  assert.equal(ap.buildFanDesign(portals, ['A', 'D'], { B: 'D' }).assignments.B, 'D', 'Manual assignment overrides proximity even if invalid geometry is then rejected.');
  const fixed = ap.suggestFanAnchors(portals, 3, ['D'], { B: 'A' });
  assert.ok(fixed.anchors.includes('D') && fixed.anchors.includes('A'));
  assert.equal(fixed.anchors.length, 3);
  assert.ok(fixed.evaluations <= 100);
  assert.deepEqual(json(fixed), json(ap.suggestFanAnchors(portals, 3, ['D'], { B: 'A' })));
}
{
  const { ap } = runtime();
  for (const [portals, anchors, assignments, error] of [
    [triangle.slice(0, 2), ['A'], {}, 'fan.limit'],
    [[...triangle, triangle[0]], ['A'], {}, 'fan.invalid'],
    [[...triangle.slice(0, 2), p('C', 0, 0)], ['A'], {}, 'fan.invalid'],
    [[{ ...triangle[0], guid: '' }, ...triangle.slice(1)], ['A'], {}, 'fan.invalid'],
    [[...triangle.slice(0, 2), p('C', NaN, 1)], ['A'], {}, 'fan.invalid'],
    [triangle, [], {}, 'fan.anchorsNeeded'], [triangle, ['missing'], {}, 'fan.anchorsNeeded'],
    [triangle, ['A', 'B', 'C'], {}, 'fan.anchorsNeeded'],
    [triangle, ['A'], { B: 'missing' }, 'fan.invalidAssignment'],
    [[p('A', 0, 0), p('B', 1, 0), p('C', 2, 0)], ['A'], {}, 'fan.conflict'],
    [[p('A', 0, 0), p('B', -1, 0), p('C', 1, 0)], ['A'], {}, 'fan.noFields'],
    [[p('A', 0, 0), p('B', 2, 2), p('C', 2, 0), p('D', 0, 2)], ['A', 'C'], { B: 'A', D: 'C' }, 'fan.conflict']
  ]) assert.ok(ap.buildFanDesign(portals, anchors, assignments).errors.includes(error), error);
  const many = Array.from({ length: 60 }, (_, i) => p(String(i), Math.cos(i), Math.sin(i)));
  const suggestion = ap.suggestFanAnchors(many, 30, [], {});
  assert.ok(ap.buildFanDesign(Array.from({ length: 201 }, (_, i) => p('limit' + i, i / 1000, i / 2000)), ['limit0'], {}).errors.includes('fan.limit'));
  assert.equal(suggestion.anchors.length, 30);
  assert.ok(suggestion.evaluations <= 100);
}
{
  const { ap } = runtime();
  ap.collectExistingLinkIds = () => ({ map: { 'A|B': true }, list: [{ latlngA: point(-1, .5), latlngB: point(2, .5) }] });
  const plan = ap.buildFanDesign(triangle, ['A'], {});
  assert.equal(plan.existing, 1);
  assert.ok(plan.blocked > 0);
}
{
  const { ap, drawn, context, saves, scans, storage } = runtime();
  const old = new Line([point(5, 5), point(6, 6)]);
  drawn.addLayer(old);
  ap.state.linkDirections = { keep: 'X' };
  draft(ap);
  assert.equal(drawn.layers.length, 1, 'Preview is separate from Draw Tools');
  assert.equal(storage.size, 0);
  assert.equal(ap.applyFanDesign(), true);
  assert.equal(drawn.layers.length, 1);
  assert.ok(drawn.layers.includes(old));
  assert.equal(saves(), 0, 'Native planning never saves Draw Tools');
  assert.equal(scans(), 1);
  assert.deepEqual(json(ap.state.linkDirections), { keep: 'X' });
  assert.equal(context.window.plugin.keys.keys.A, 7);
  draft(ap); assert.equal(ap.applyFanDesign(), true);
  assert.equal(drawn.layers.length, 1, 'Repeated acceptance leaves drawings untouched');
  assert.equal(ap.getNativeFanPlan().links.length, 3);
  ap.load(); assert.deepEqual(json(ap.state.fanDesign.anchors), ['A']);
}
{
  const { ap, drawn, context, alerts } = runtime();
  const old = new Line([point(5, 5), point(6, 6)]); drawn.addLayer(old);
  draft(ap);
  context.localStorage.setItem = () => { throw new Error('storage full'); };
  assert.equal(ap.applyFanDesign(), false);
  assert.deepEqual(drawn.layers, [old]);
  assert.equal(ap.state.fanDesign, null);
  assert.ok(alerts.length);
}
{
  const { ap, drawn } = runtime();
  draft(ap);
  ap.runtime.finalScan = { running: true };
  assert.equal(ap.applyFanDesign(), false);
  ap.runtime.finalScan = null;
  drawn.addLayer(new Line([point(-1, .5), point(2, .5)]));
  assert.equal(ap.applyFanDesign(), true, 'Old drawings are separate from the active native plan');
  assert.equal(drawn.layers.length, 1);
  ap.previewFanDesign();
  assert.equal(ap.runtime.fanDraft.preview.errors.length, 0);
  assert.ok(ap.runtime.fanDraft.layer, 'Conflicting old drawings must not hide a geometrically valid proposal');
  assert.equal(ap.runtime.fanDraft.layer.layers.filter(layer => layer instanceof Polygon).length, 1);
  assert.equal(ap.applyFanDesign(), true);
  assert.equal(drawn.layers.length, 1);
}
{
  const { ap, drawn, context } = runtime();
  const area = new Polygon([point(-1, -1), point(-1, 3), point(2, 3), point(2, -1)], { fill: true });
  drawn.addLayer(area);
  ap.getLoadedPortals = () => [...triangle, p('outside', 5, 5), p('boundary', -1, 0)].map(portal => ({ ...portal, latlng: point(portal) }));
  assert.deepEqual(json(ap.getFanCandidates('area').map(p => p.guid).sort()), ['A', 'B', 'C', 'boundary']);
  context.window.map.getBounds = () => ({ contains: p => p.lng < 3 });
  assert.equal(ap.getFanCandidates('map').length, 4);
  assert.equal(ap.extractSegments(area).length, 4);
  draft(ap, triangle, ['A'], 'area');
  assert.equal(ap.applyFanDesign(), true);
  assert.ok(drawn.layers.includes(area));
  assert.equal(ap.extractSegments(area).length, 4, 'Native acceptance does not reinterpret selection drawings');
  ap.load(); assert.equal(ap.extractSegments(area).length, 4);
  assert.equal(ap.normalizeFanDesign({ anchors: ['A', 'A'], assignments: { B: 'A', C: 'missing' } }).anchors.length, 1);
  assert.equal(ap.normalizeFanDesign({ anchors: ['A'], assignments: [] }), null);
}
{
  const { ap, context } = runtime();
  draft(ap, [{ ...triangle[0], title: '<script>bad</script>' }, ...triangle.slice(1)]);
  assert.ok(!ap.fanPlannerHtml().includes('<script>bad'));
  const controls = new Map();
  const element = { scrollTop: 0, querySelector(key) { if (!controls.has(key)) controls.set(key, {}); return controls.get(key); }, querySelectorAll() { return []; } };
  context.document.getElementById = id => id === 'ap-fan-planner' ? element : null;
  ap.getFanCandidates = source => source === 'area' ? triangle.slice(0, 2) : triangle;
  ap.refreshFanPlanner();
  controls.get('#ap-fan-source').onchange.call({ value: 'area' });
  assert.equal(ap.runtime.fanDraft.portals.length, 2);
  assert.ok(ap.runtime.fanDraft.preview.errors.includes('fan.areaRequired'), 'Missing polygon explains the selection workflow');
  assert.ok(ap.fanPlannerHtml().includes('id="ap-fan-apply" disabled'));
  controls.get('#ap-fan-source').onchange.call({ value: 'plan' });
  assert.equal(ap.runtime.fanDraft.anchors.length, 1, 'Loading portals automatically suggests an anchor');
  assert.equal(ap.runtime.fanDraft.preview.fields.length, 1);
  assert.ok(ap.runtime.fanDraft.layer);
  controls.get('#ap-fan-load').onclick();
  assert.equal(ap.runtime.fanDraft.preview.fields.length, 1, 'Repeated Load portals retains a computed proposal');
  assert.ok(ap.fanPlannerHtml().includes('geometric fields'));
  ap.runtime.fanDraft = null; ap.previewFanDesign();
}
{
  const { ap, context, drawn } = runtime();
  context.window.innerWidth = 360;
  drawn.addLayer(new Polygon([point(-1, -1), point(-1, 3), point(2, 3), point(2, -1)], { fill: true }));
  ap.getFanCandidates = () => triangle;
  const dialogs = [];
  context.window.dialog = options => dialogs.push(options);
  ap.showFanPlanner();
  assert.equal(dialogs[0].width, 340);
  assert.equal(ap.runtime.fanDraft.source, 'area');
  assert.ok(ap.runtime.fanDraft.preview.fields.length);
  const first = ap.runtime.fanDraft;
  ap.showFanPlanner();
  dialogs[0].closeCallback();
  assert.notEqual(ap.runtime.fanDraft, first);
  assert.ok(ap.runtime.fanDraft.layer, 'Stale close callback cannot remove a new preview');
  dialogs[1].closeCallback();
  assert.equal(ap.runtime.fanDraft.layer, null);
  assert.equal(ap.runtime.fanDraft.open, false);
}
{
  const { ap, context, drawn, realScan } = runtime();
  const areaA = new Polygon([point(-1, -1), point(-1, 3), point(2, 3), point(2, -1)], { fill: true });
  const areaB = new Polygon([point(9, 9), point(9, 13), point(12, 13), point(12, 9)], { fill: true });
  drawn.addLayer(areaA); drawn.addLayer(areaB);
  const second = [p('D', 10, 10), p('E', 12, 10), p('F', 11, 11)];
  ap.getLoadedPortals = () => [...triangle, ...second].map(portal => ({ ...portal, latlng: point(portal) }));
  assert.equal(ap.getFanAreas().length, 2);
  assert.deepEqual(json(ap.getFanCandidates('area', ap.fanAreaKey(areaA)).map(p => p.guid)), ['A', 'B', 'C']);
  assert.deepEqual(json(ap.getFanCandidates('area', ap.fanAreaKey(areaB)).map(p => p.guid)), ['D', 'E', 'F']);
  context.window.dialog = () => {};
  ap.showFanPlanner();
  assert.equal(ap.runtime.fanDraft.areaKey, ap.fanAreaKey(areaB), 'Most recently drawn polygon is the default');
  assert.deepEqual(json(ap.runtime.fanDraft.portals.map(p => p.guid)), ['D', 'E', 'F']);
  assert.equal(ap.runtime.fanDraft.preview.fields.length, 1);
  assert.equal(ap.applyFanDesign(), true);
  assert.equal(ap.state.planSource, 'fan');
  assert.equal(ap.extractSegments(areaB).length, 0, 'Accepted selection boundary is not an anchor-portal plan link');
  const accepted = JSON.stringify(ap.state.fanDesign);
  assert.equal(ap.switchPlanSource('external'), true);
  assert.equal(ap.getActiveFanPlan(), null);
  assert.equal(JSON.stringify(ap.state.fanDesign), accepted, 'Switching preserves the saved fan geometry');
  const overlay = new Group(); ap.renderNativeFanPlan(overlay); assert.equal(overlay.layers.length, 0);
  ap.load(); assert.equal(ap.state.planSource, 'external');
  ap.queueMissingNameRefresh = () => {};
  const external = new Line([point(triangle[0]), point(triangle[1])]);
  drawn.layers = [external, areaB];
  realScan();
  assert.equal(ap.runtime.links.length, 1);
  assert.equal(ap.runtime.links[0].id, 'A|B');
  assert.equal(ap.switchPlanSource('fan'), true); realScan();
  assert.equal(ap.runtime.links.length, 3);
  assert.ok(ap.runtime.links.every(link => ['D', 'E', 'F'].includes(link.a) && ['D', 'E', 'F'].includes(link.b)));
  assert.ok(drawn.layers.includes(external));
  assert.equal(context.window.plugin.keys.keys.A, 7);
  ap.runtime.finalScan = { running: true };
  assert.equal(ap.switchPlanSource('external'), false);
  assert.equal(ap.state.planSource, 'fan');
  ap.runtime.finalScan = null;
  context.localStorage.setItem = () => { throw Error('full'); };
  assert.equal(ap.switchPlanSource('external'), false);
  assert.equal(ap.state.planSource, 'fan');
}
{
  const { ap, context, drawn } = runtime();
  const hole = new Polygon([], { fill: true });
  hole.getLatLngs = () => [[point(0, 0), point(0, 3), point(3, 3)], [point(1, 1), point(1, 2), point(2, 2)]];
  drawn.addLayer(hole); assert.equal(ap.getFanAreas().length, 0);
  context.window.dialog = () => {};
  ap.showFanPlanner();
  assert.ok(ap.runtime.fanDraft.preview.errors.includes('fan.areaRequired'));
  assert.equal(ap.runtime.fanDraft.layer, undefined);
  assert.equal(ap.applyFanDesign(), false);
}
{
  const { ap, context, realScan, drawn } = runtime();
  draft(ap); delete context.window.plugin.drawTools;
  assert.equal(ap.applyFanDesign(), true, 'Draw Tools is not required');
  ap.load();
  ap.getLoadedPortals = () => [];
  ap.queueMissingNameRefresh = () => {};
  realScan();
  assert.equal(ap.runtime.links.length, 3, 'Accepted native plan feeds the regular scan');
  assert.equal(Object.keys(ap.runtime.stats).length, 3);
  assert.equal(ap.runtime.stats.A.title, 'A', 'Saved portal names survive unloaded Intel');
  assert.equal(ap.runtime.unresolvedEndpoints.length, 0);
  assert.equal(ap.state.lastScan.drawLayers, 0);
  assert.equal(Object.keys(ap.state.linkDirections).length, 0);
  assert.equal(ap.runtime.stats.A.requiredKeys, 2);
  const group = new Group(); ap.renderNativeFanPlan(group);
  assert.equal(group.layers.length, 4, 'Accepted plan draws its fields and links after reload');
  assert.equal(drawn.layers.length, 0);
  ap.getLoadedPortals = () => [{ guid: 'neighbor', title: 'Wrong neighbor', latlng: point(0, 0) }];
  realScan();
  assert.equal(ap.runtime.stats.neighbor, undefined, 'Native GUIDs cannot be replaced by a coincident loaded neighbor');
  assert.equal(ap.runtime.stats.A.title, 'A');
  assert.equal(ap.clearNativeFanPlan(), true);
  assert.equal(ap.getNativeFanPlan(), null);
  assert.equal(ap.runtime.links.length, 0);
  assert.equal(context.window.plugin.keys.keys.A, 7);
  ap.load(); assert.equal(ap.getNativeFanPlan(), null, 'Removal survives reload');
}
{
  const { ap, context } = runtime();
  const timers = [], requests = [];
  context.setTimeout = fn => { timers.push(fn); return timers.length; };
  ap.setMessage = () => {};
  const missing = Array.from({ length: 76 }, (_, i) => ({ ...p('P' + i, i / 100, (i % 3) / 100), title: ap.MISSING_TITLE }));
  ap.runtime.stats.A = { ...triangle[0], title: 'Existing anchor' };
  ap.requestPortalDetails = (guid, callback) => { requests.push(guid); callback({ title: 'Portal name ' + guid }); };
  draft(ap, missing, ['P0'], 'map');
  assert.ok(!ap.runtime.fanDraft.preview.errors.includes('fan.limit'), '76 selected portals are supported');
  assert.equal(timers.length, 1, 'Even an oversized polygon starts name loading independently of geometry');
  ap.queueMissingNameRefresh(); assert.equal(timers.length, 1, 'Pending auto-loader is deduplicated');
  timers.shift()();
  assert.equal(requests.length, 1);
  assert.equal(ap.runtime.fanDraft.portals[0].title, 'Portal name P0');
  ap.refreshMissingNames(false); assert.equal(requests.length, 1, 'Manual retry shares the running loader');
  while (timers.length) timers.shift()();
  assert.equal(requests.length, 76);
  assert.equal(new Set(requests).size, 76);
  assert.ok(ap.runtime.fanDraft.portals.every(p => !ap.isMissingPortalTitle(p.title)));
  assert.equal(ap.runtime.nameLoader, null);
}
{
  const { ap, context, realScan } = runtime();
  draft(ap); ap.applyFanDesign();
  ap.runtime.fanDraft.portals[1].title = ap.MISSING_TITLE;
  ap.state.fanDesign.portals[1].title = ap.MISSING_TITLE;
  ap.runtime.links = [{ a: 'A', b: 'B', titleA: 'A', titleB: ap.MISSING_TITLE }];
  ap.runtime.workPlan = { stale: true };
  assert.equal(ap.updatePortalTitle('B', 'Resolved fan portal'), true);
  assert.equal(ap.runtime.fanDraft.portals[1].title, 'Resolved fan portal');
  assert.equal(ap.runtime.links[0].titleB, 'Resolved fan portal');
  assert.equal(ap.runtime.workPlan, null);
  ap.load(); assert.equal(ap.state.fanDesign.portals[1].title, 'Resolved fan portal');
  ap.getLoadedPortals = () => [{ guid: 'B', title: ap.MISSING_TITLE, latlng: point(triangle[1]) }];
  ap.queueMissingNameRefresh = () => {}; realScan();
  assert.equal(ap.runtime.stats.B.title, 'Resolved fan portal', 'Incomplete Intel cannot replace a saved resolved name');
  assert.equal(context.window.plugin.keys.keys.A, 7);
}
{
  const { ap } = runtime();
  ap.getLoadedPortals = () => [{ guid: 'new', title: ap.MISSING_TITLE, latlng: point(1, 1) }];
  ap.collectPortalBookmarks = () => [{ guid: 'new', title: 'Bookmark portal' }, { guid: 'unloaded', title: 'Do not add', latlng: point(1, 1) }];
  assert.equal(ap.getFanCandidates('map')[0].title, 'Bookmark portal');
  assert.equal(ap.getFanCandidates('map').length, 1, 'Bookmarks enrich names only for selected loaded GUIDs');
}
{
  const { ap, context } = runtime();
  const timers = [], replies = [], requested = [];
  context.setTimeout = fn => timers.push(fn);
  ap.setMessage = () => {};
  draft(ap);
  ap.runtime.fanDraft.portals = triangle.map(p => ({ ...p, title: ap.MISSING_TITLE }));
  ap.requestPortalDetails = (guid, callback) => { requested.push(guid); replies.push(() => callback({ title: 'Resolved ' + guid })); };
  ap.refreshMissingNames(true);
  assert.deepEqual(requested, ['A']);
  ap.runtime.fanDraft.portals = [{ ...triangle[2], title: ap.MISSING_TITLE }, { ...p('D', 2, 2), title: ap.MISSING_TITLE }];
  ap.refreshMissingNames(true);
  while (replies.length || timers.length) { if (replies.length) replies.shift()(); else timers.shift()(); }
  assert.deepEqual(requested, ['A', 'C', 'D'], 'Changed selections merge new GUIDs and skip obsolete pending names');
  assert.equal(ap.runtime.nameLoader, null);
}
{
  const { ap, context, drawn, realScan } = runtime();
  const selection = [p('new000', 9.6, 52.18), ...Array.from({ length: 75 }, (_, i) => p('new' + String(i + 1).padStart(3, '0'), 9.6 + .02 * Math.cos(i * Math.PI * 2 / 75), 52.18 + .02 * Math.sin(i * Math.PI * 2 / 75)))];
  const oldArea = new Polygon([point(-1, -1), point(-1, 3), point(2, 3), point(2, -1)], { fill: true });
  const newArea = new Polygon([point(52.15, 9.57), point(52.15, 9.63), point(52.21, 9.63), point(52.21, 9.57)], { fill: true });
  drawn.addLayer(oldArea); drawn.addLayer(newArea);
  draft(ap); assert.equal(ap.applyFanDesign(), true);
  ap.state.fanDesign.anchors = ['A', 'B'];
  ap.state.fanDesign.assignments = { C: 'A' };
  ap.state.fanDesign.selectionAreaKey = ap.fanAreaKey(oldArea);
  const old = JSON.stringify(ap.state.fanDesign);
  ap.getLoadedPortals = () => [...selection, ...triangle].map(portal => ({ ...portal, latlng: point(portal) }));
  context.window.dialog = () => {};
  ap.showFanPlanner();
  const current = ap.runtime.fanDraft;
  assert.equal(current.areaKey, ap.fanAreaKey(newArea), 'Fresh design uses the current/newest polygon, not saved selection');
  assert.equal(current.portals.length, 76);
  assert.equal(current.count, 1);
  assert.deepEqual(json(current.pinned), []);
  assert.deepEqual(json(current.assignments), {});
  assert.deepEqual(json(current.preview.errors), []);
  assert.ok(current.preview.fields.length >= 70, 'Large polygon actually generates a visible fan');
  assert.ok(current.layer);
  assert.equal(JSON.stringify(ap.state.fanDesign), old, 'Generating never replaces the previous accepted plan');
  assert.equal(ap.applyFanDesign(), true);
  assert.equal(ap.runtime.fanDesigning, false);
  assert.equal(ap.state.fanDesign.portals.length, 76, 'Accepted geometry is not truncated to the old 60-portal limit');
  const expectedLinks = ap.state.fanDesign.links.length, expectedFields = ap.state.fanDesign.fields.length;
  ap.load();
  assert.equal(ap.state.fanDesign.portals.length, 76);
  assert.equal(ap.state.fanDesign.links.length, expectedLinks);
  assert.equal(ap.state.fanDesign.fields.length, expectedFields);
  ap.getLoadedPortals = () => []; ap.queueMissingNameRefresh = () => {}; realScan();
  assert.equal(Object.keys(ap.runtime.stats).length, 76);
  assert.equal(ap.runtime.links.length, expectedLinks);
  const visible = new Group(); ap.renderNativeFanPlan(visible);
  assert.equal(visible.layers.length, expectedLinks + expectedFields);
  assert.equal(context.window.plugin.keys.keys.A, 7);
}
{
  const { ap } = runtime();
  const large = [p('center', 0, 0), ...Array.from({ length: 199 }, (_, i) => p('leaf' + String(i).padStart(3, '0'), Math.cos(i * Math.PI * 2 / 199), Math.sin(i * Math.PI * 2 / 199)))];
  const result = ap.buildFanDesign(large, ['center'], {});
  assert.deepEqual(json(result.errors), []);
  assert.equal(result.fields.length, 199);
  assert.equal(result.links.length, 398);
  assert.equal(new Set(result.fields.map(field => field.map(p => p.guid).sort().join('|'))).size, 199);
}
{
  const { ap, context, storage } = runtime();
  const portals = [...triangle, p('D', 10, 0), p('E', 12, 0), p('F', 11, 1), p('G', 20, 0), p('H', 22, 0), p('I', 21, 1)];
  draft(ap, portals);
  const before = JSON.stringify(ap.state);
  let controls = new Map(), markup = '';
  const element = { scrollTop: 0,
    get innerHTML() { return markup; },
    set innerHTML(html) {
      markup = html;
      controls = new Map([...html.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)].map(match => [
        '#' + match[1], { value: match[0].match(/\bvalue="([^"]*)"/)?.[1] || '', disabled: /\bdisabled\b/.test(match[0]), textContent: '' }
      ]));
    },
    querySelector(key) { return controls.get(key) || null; }, querySelectorAll() { return []; }
  };
  context.document.getElementById = id => id === 'ap-fan-planner' ? element : null;
  ap.getFanCandidates = () => portals;
  ap.refreshFanPlanner();
  assert.ok(markup.includes('<fieldset class="ap-fan-anchor-options">'));
  assert.equal(controls.get('#ap-fan-count').value, 1);
  for (const count of [2, 3, 1]) {
    const input = controls.get('#ap-fan-count');
    input.value = String(count); input.oninput();
    assert.equal(ap.runtime.fanDraft.preview, null, 'Editing count invalidates old geometry immediately');
    assert.ok(!ap.runtime.fanDraft.layer);
    assert.equal(controls.get('#ap-fan-apply').disabled, true);
    assert.equal(ap.applyFanDesign(), false);
    controls.get('#ap-fan-suggest').onclick(); // No change/blur event required.
    assert.equal(ap.runtime.fanDraft.anchors.length, count, 'Use the exact freshly entered count');
    assert.equal(ap.runtime.fanDraft.preview.anchors.length, count);
    assert.deepEqual(json(ap.runtime.fanDraft.preview.errors), []);
    assert.ok(ap.runtime.fanDraft.preview.fields.length);
  }
  ap.runtime.fanDraft.pinned = ['D']; ap.runtime.fanDraft.assignments = { B: 'A' };
  let input = controls.get('#ap-fan-count'); input.value = '1'; input.onchange();
  assert.ok(ap.runtime.fanDraft.countError.includes('2 anchors'));
  assert.equal(ap.runtime.fanDraft.preview, null);
  assert.deepEqual(json(ap.runtime.fanDraft.pinned), ['D']);
  assert.deepEqual(json(ap.runtime.fanDraft.assignments), { B: 'A' });
  input = controls.get('#ap-fan-count'); input.value = '2'; input.onchange();
  assert.equal(ap.runtime.fanDraft.anchors.length, 2);
  assert.ok(ap.runtime.fanDraft.anchors.includes('D') && ap.runtime.fanDraft.anchors.includes('A'));
  for (const value of ['', '0', '-1', '1.5', '9', 'Infinity']) {
    input = controls.get('#ap-fan-count'); input.value = value; input.oninput();
    controls.get('#ap-fan-suggest').onclick();
    assert.ok(ap.runtime.fanDraft.countError.includes('between 1 and 8'));
    assert.equal(ap.runtime.fanDraft.preview, null);
    assert.ok(controls.get('#ap-fan-apply').disabled);
    controls.get('#ap-fan-preview').onclick();
    assert.equal(ap.applyFanDesign(), false, 'Invalid count cannot accept an older preview');
  }
  ap.runtime.fanDraft.excluded.I = true;
  input = controls.get('#ap-fan-count'); input.value = '8'; input.onchange();
  assert.ok(ap.runtime.fanDraft.countError.includes('between 1 and 7'), 'Range follows included portals');
  input = controls.get('#ap-fan-count'); input.value = '3'; input.oninput();
  controls.get('#ap-fan-load').onclick();
  assert.equal(ap.runtime.fanDraft.anchors.length, 3, 'Portal reload retains requested count while clearing manual choices');
  assert.equal(JSON.stringify(ap.state), before, 'Anchor proposals never persist geometry or directions');
  assert.equal(storage.size, 0);
  assert.equal(context.window.plugin.keys.keys.A, 7);
  for (const language of Object.keys(ap.LOCALES)) {
    ap.state.language = language;
    assert.ok(!ap.fanPlannerHtml().includes('{max}'));
    assert.ok(!ap.fanPlannerHtml().includes('{count}'));
  }
  assert.equal(ap.applyFanDesign(), true);
  assert.equal(ap.state.fanDesign.anchors.length, 3, 'Explicit acceptance preserves the selected anchor count');
  ap.load();
  assert.equal(ap.getNativeFanPlan().anchors.length, 3, 'Multiple selected anchors survive refresh');
  assert.equal(context.window.plugin.keys.keys.A, 7);
}
{
  const {ap,context,storage,drawn}=runtime();context.window.map.getPane=()=>({});
  const before=json(ap.state),keys=json(context.window.plugin.keys.keys);
  draft(ap);
  const target=ap.runtime.fanDraft.layer.layers.filter(layer=>layer.options.pane===ap.PLAN_PANE_NAME);
  assert.equal(target.length,4,'Draft links and fields share the accepted target pane.');
  assert.ok(target.every(layer=>layer.options.color===ap.MAP_COLORS.target));
  assert.ok(target.filter(layer=>!(layer instanceof Polygon)).every(layer=>layer.options.dashArray),'Draft links use the shared target pattern.');
  assert.ok(target.filter(layer=>layer instanceof Polygon).every(layer=>layer.options.fillOpacity>0),'Target fields stay filled.');
  assert.match(ap.fanPlannerHtml(),/Target plan \(geometric\)/);
  assert.ok(!ap.fanPlannerHtml().includes('Simulated build progress'),'A draft does not claim simulated progress.');
  assert.deepEqual(json(ap.state),before);assert.deepEqual(json(context.window.plugin.keys.keys),keys);assert.equal(storage.size,0);assert.equal(drawn.layers.length,0);
  const group=ap.runtime.fanDraft.layer;ap.clearFanPreview();assert.equal(group.layers.length,0);assert.equal(ap.runtime.fanDraft.layer,null);
}
console.log('Fan planner: shared violet draft/target geometry and legend, user-selected anchor counts, fresh generation, 76/200 portals, persistence and preserved inventory passed.');
