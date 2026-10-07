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
  ap.scan = () => { scans++; };
  ap.renderPanel = ap.renderOverlays = ap.refreshTaskList = () => {};
  ap.collectExistingLinkIds = () => ({ map: {}, list: [] });
  return { ap, context, drawn, storage, alerts, saves: () => saves, scans: () => scans };
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
  assert.ok(ap.buildFanDesign([...many, p('extra', 3, 3)], ['0'], {}).errors.includes('fan.limit'));
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
  assert.equal(drawn.layers.length, 4);
  assert.ok(drawn.layers.includes(old));
  assert.equal(saves(), 1);
  assert.equal(scans(), 1);
  assert.deepEqual(json(ap.state.linkDirections), { keep: 'X' });
  assert.equal(context.window.plugin.keys.keys.A, 7);
  draft(ap); assert.equal(ap.applyFanDesign(), true);
  assert.equal(drawn.layers.length, 4, 'Repeated acceptance does not duplicate lines');
  ap.load(); assert.deepEqual(json(ap.state.fanDesign.anchors), ['A']);
}
{
  const { ap, drawn, context, alerts } = runtime();
  const old = new Line([point(5, 5), point(6, 6)]); drawn.addLayer(old);
  draft(ap);
  context.window.plugin.drawTools.save = () => { throw new Error('storage full'); };
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
  assert.equal(ap.applyFanDesign(), false, 'New conflicting drawings invalidate a previously valid preview');
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
  assert.equal(ap.extractSegments(area).length, 0, 'Selection outline is not a generated plan link');
  ap.load(); assert.equal(ap.extractSegments(area).length, 0);
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
  assert.equal(ap.runtime.fanDraft.preview, null, 'Changing source discards stale geometry');
  assert.ok(ap.fanPlannerHtml().includes('id="ap-fan-apply" disabled'));
  ap.runtime.fanDraft = null; ap.previewFanDesign();
}
{
  const { ap, context } = runtime();
  context.window.innerWidth = 360;
  ap.getFanCandidates = () => triangle;
  const dialogs = [];
  context.window.dialog = options => dialogs.push(options);
  ap.showFanPlanner();
  assert.equal(dialogs[0].width, 340);
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
console.log('Fan planner: independent anchors, assignment, geometry, bounded suggestions, preview isolation, Draw Tools preservation/rollback, selection areas and persistence passed.');
