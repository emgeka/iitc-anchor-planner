import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(root, 'iitc-anchor-planner.user.js'), 'utf8');
const wrapper = source.slice(source.indexOf('function wrapper(plugin_info) {'), source.indexOf('var script = document.createElement'));
function point(lat, lng) {
  if (typeof lat === 'object') ({ lat, lng } = lat);
  return { lat: Number(lat), lng: Number(lng), distanceTo(other) { return Math.hypot(this.lat - other.lat, this.lng - other.lng) * 111000; } };
}
function runtime(saved = null) {
  const storage = new Map(saved ? [['plugin-anchor-planner-v1', JSON.stringify(saved)]] : []);
  const context = { console, L: { latLng: point }, window: { bootPlugins: [], portals: {} }, navigator: {},
    document: { documentElement: {}, getElementById() { return null; } },
    localStorage: { getItem(key) { return storage.get(key) || null; }, setItem(key, value) { storage.set(key, value); } } };
  vm.runInNewContext(wrapper + '\nwrapper({});', context);
  const ap = context.window.plugin.anchorPlanner;
  const refreshTaskList = ap.refreshTaskList;
  ap.state.language = 'en';
  ap.renderOverlays = () => {};
  ap.renderPanel = () => {};
  ap.refreshTaskList = () => {};
  return { ap, context, storage, refreshTaskList };
}
function portal(ap, guid, x, y = 0) {
  ap.runtime.stats[guid] = { guid, title: guid, lat: y, lng: x, linkCount: 1, openLinks: 1, requiredKeys: 1 };
  ap.ensureAnchorState(guid).routeOrder = Object.keys(ap.runtime.stats).length - 1;
}
function link(ap, a, b, blockers = [], existing = false) {
  const item = { id: ap.normalizedLinkId(a, b), a, b, titleA: a, titleB: b, latlngA: point(ap.runtime.stats[a].lat, ap.runtime.stats[a].lng), latlngB: point(ap.runtime.stats[b].lat, ap.runtime.stats[b].lng), blockers, blocked: blockers.length > 0, existing };
  ap.runtime.links.push(item);
  return item;
}
function blocker(id, a, ax, b, bx) {
  return { guid: id, a, b, titleA: a, titleB: b, latlngA: point(0, ax), latlngB: point(0, bx) };
}
function direction(ap, item, from) { ap.state.linkDirections[item.id] = from; }

{
  const { ap } = runtime({ anchors: { A: { ownedKeys: 4, done: true, note: 'keep', routeOrder: 2 } } });
  ap.load();
  ap.ensureAnchorState('A');
  assert.equal(ap.state.anchors.A.ownedKeys, undefined);
  assert.equal(ap.getOwnedKeys('A'), null, 'Legacy stock is ignored; Keys is required.');
  assert.equal(ap.state.anchors.A.note, 'keep');
  assert.equal(Object.keys(ap.state.linkDirections).length, 0, 'Old plans migrate with open direction.');
}
{
  const { ap } = runtime(); portal(ap, 'A', 0); portal(ap, 'B', 1); portal(ap, 'C', 2);
  const ab = link(ap, 'A', 'B'); link(ap, 'B', 'C');
  ap.recalculateDirectedKeys();
  assert.equal(ap.runtime.stats.B.requiredKeys, 2);
  direction(ap, ab, 'A'); ap.recalculateDirectedKeys();
  assert.equal(ap.runtime.stats.A.requiredKeys, 0);
  assert.equal(ap.getStatus('A', ap.runtime.stats.A).key, 'ready', 'An outgoing-only portal is not an already-built portal.');
  assert.equal(ap.runtime.stats.B.requiredKeys, 2);
  assert.equal(ap.runtime.stats.C.uncertainKeys, 1);
  direction(ap, ab, 'B'); ap.recalculateDirectedKeys();
  assert.equal(ap.runtime.stats.A.requiredKeys, 1);
  assert.equal(ap.runtime.stats.B.requiredKeys, 1);
  ab.existing = true; ap.recalculateDirectedKeys();
  assert.equal(ap.runtime.stats.A.requiredKeys, 0, 'Existing links consume no new key.');
  assert.equal(ap.setLinkDirection(ab.id, 'bogus'), false);
}
{
  const { ap } = runtime(); portal(ap, 'A', 1); portal(ap, 'B', 3); portal(ap, 'C', 4);
  const shared = blocker('block', 'X', 0.5, 'Y', 9);
  const ab = link(ap, 'A', 'B', [shared]); const ac = link(ap, 'A', 'C', [shared]);
  direction(ap, ab, 'A'); direction(ap, ac, 'A');
  const plan = ap.buildWorkPlan({ latlng: point(0, 0) });
  assert.equal(plan.stops[0].portal.guid, 'X', 'Choose the cheap endpoint before dependent construction.');
  assert.equal(plan.stops.flatMap(s => s.blockers).length, 1, 'A blocker shared by two links is scheduled once.');
  assert.equal(plan.stops[0].blockers[0].links.length, 2);
  assert.equal(plan.stops.find(s => s.portal.guid === 'A').links.length, 2);
  const estimated = ap.getRouteEstimate({ latlng: point(0, 0) });
  assert.equal(estimated.targetCount, plan.stops.length);
  assert.equal(ap.getNextRouteTarget({ latlng: point(0, 0) }).guid, 'X');
}
{
  const { ap } = runtime(); ap.state.workRouteMode = 'manual';
  portal(ap, 'A', 0); portal(ap, 'B', 2); portal(ap, 'C', 4);
  const late = blocker('late', 'X', 3, 'Y', 20);
  link(ap, 'A', 'B'); const bc = link(ap, 'B', 'C', [late]); direction(ap, bc, 'C');
  const plan = ap.buildWorkPlan({ latlng: point(0, -1) });
  const ids = plan.stops.map(s => s.portal.guid);
  assert.ok(ids.indexOf('X') > ids.indexOf('B'), 'A late blocker is handled on the way, not globally first.');
  assert.ok(ids.indexOf('X') < ids.indexOf('C'));
}
{
  const { ap } = runtime(); ap.state.workRouteMode = 'manual';
  portal(ap, 'A', 0); portal(ap, 'B', 1); portal(ap, 'C', 2);
  const atA = blocker('atA', 'A', 0, 'Z', 10);
  const atA2 = blocker('atA2', 'A', 0, 'W', 15);
  const bc = link(ap, 'B', 'C', [atA, atA2]); direction(ap, bc, 'C');
  const plan = ap.buildWorkPlan(null);
  assert.equal(plan.stops[0].portal.guid, 'A');
  assert.equal(plan.stops[0].blockers.length, 2, 'Both removals are bundled at the existing visit.');
  assert.equal(plan.stops.filter(s => s.portal.guid === 'A').length, 1);
}
{
  const { ap } = runtime(); ap.state.workRouteMode = 'manual';
  portal(ap, 'A', 0); portal(ap, 'B', 1);
  const early = blocker('early', 'B', 1, 'Z', 20);
  const ab = link(ap, 'A', 'B', [early]); direction(ap, ab, 'A');
  const plan = ap.buildWorkPlan(null);
  assert.equal(plan.stops[0].portal.guid, 'B');
  assert.equal(plan.stops[0].planVisit, false);
  assert.equal(plan.stops[2].portal.guid, 'B');
  assert.equal(plan.stops[2].planVisit, true, 'Early removal must not complete or consume the later plan visit.');
}
{
  const { ap } = runtime(); portal(ap, 'A', 1); portal(ap, 'B', 2);
  const block = blocker('x', 'X', 0, 'Y', 8); link(ap, 'A', 'B', [block]);
  assert.equal(ap.setBlockerTask('x', 'Y', false), true);
  assert.equal(ap.buildWorkPlan({ latlng: point(0, 0) }).stops[0].portal.guid, 'Y', 'Explicit choice overrides shorter alternative.');
  assert.equal(ap.setBlockerTask('x', null, true), true);
  assert.equal(ap.buildWorkPlan(null).stops.flatMap(s => s.blockers).length, 0);
  assert.equal(ap.runtime.links[0].blocked, true, 'Manual completion never removes Intel blockers.');
  assert.match(ap.taskListHtml(), /confirmation pending/);
  assert.equal(ap.setBlockerTask('x', null, false), true);
  assert.equal(ap.buildWorkPlan(null).stops.flatMap(s => s.blockers).length, 1);
  portal(ap, 'C', 3); link(ap, 'B', 'C');
  assert.equal(ap.getWorkBlockers()[0].target, '', 'Choices are invalidated when the plan geometry changes.');
}
{
  const { ap } = runtime(); portal(ap, 'A', 0); portal(ap, 'B', 0.001); link(ap, 'A', 'B');
  const first = ap.getWorkPlan({ latlng: point(0, 0) });
  assert.equal(ap.getWorkPlan({ latlng: point(0, 0.0006) }), first, 'Sub-100m GPS jitter must not flip the order.');
  const moved = ap.getWorkPlan({ latlng: point(0, 0.002) });
  assert.notEqual(moved, first);
  assert.equal(moved.stops[0].portal.guid, 'B');
  ap.state.workRouteMode = 'manual'; ap.runtime.workPlan = null;
  assert.equal(ap.getWorkPlan({ latlng: point(0, 0.002) }).stops[0].portal.guid, 'A', 'Saved manual order remains authoritative.');
}
{
  const { ap } = runtime(); portal(ap, 'A', 1); portal(ap, 'B', 2);
  const block = blocker('invalid', 'X', 0, 'Y', 8); block.latlngA = null; block.latlngB = null;
  const ab = link(ap, 'A', 'B', [block]); direction(ap, ab, 'A');
  assert.equal(ap.buildWorkPlan(null).unscheduled.length, 1, 'Missing coordinates must not create a fictitious 0/0 stop.');
  ap.ensureAnchorState('A').done = true;
  assert.equal(ap.buildWorkPlan(null).unassigned.length, 1, 'A completed source with unbuilt links remains visible for review.');
  assert.equal(ap.buildWorkPlan(null).unscheduled.length, 1, 'Its blocker remains a visible unresolved task.');
}
{
  const { ap } = runtime(); portal(ap, 'A', 1); portal(ap, 'B', 2);
  ap.runtime.stats.A.title = '<script>alert(1)</script>';
  const ab = link(ap, 'A', 'B'); direction(ap, ab, 'B');
  const exported = ap.exportData();
  assert.equal(exported.plannedLinks[0].from, 'B');
  assert.equal(exported.plannedLinks[0].to, 'A');
  assert.equal(Object.hasOwn(exported, 'location'), false);
  const html = ap.taskListHtml();
  assert.ok(!html.includes('<script>'));
  assert.match(html, /&lt;script&gt;/);
  for (const locale of Object.keys(ap.LOCALES)) {
    ap.state.language = locale;
    assert.ok(!ap.taskListHtml().includes('{count}'));
  }
}
{
  const { ap } = runtime(); portal(ap, 'A', 0); portal(ap, 'B', 1);
  const ab = link(ap, 'B', 'A');
  ap.recalculateDirectedKeys();
  assert.equal(ap.getSuggestedLinkDirection(ab).from, 'A', 'Suggestion follows plan visit order, not drawing order.');
  assert.match(ap.taskLinkHtml(ab, 0), /value="A" selected>Suggested: A → B/);
  assert.equal(ap.getLinkDirection(ab), null, 'A preselection does not silently confirm a direction.');
  assert.equal(ap.runtime.stats.A.uncertainKeys, 1);
  assert.equal(ap.exportData().plannedLinks[0].from, null);
  ap.state.anchors.B.routeOrder = -1; ap.runtime.workPlan = null;
  assert.equal(ap.getSuggestedLinkDirection(ab).from, 'B');
  const accept = { getAttribute(name) { return name === 'data-link' ? '0' : 'B'; } };
  ap.wireTaskList({ querySelector() { return {}; }, querySelectorAll(selector) { return selector === '.ap-task-accept-direction' ? [accept] : []; } });
  accept.onclick();
  assert.equal(ap.getLinkDirection(ab).from, 'B', 'Accept button saves the displayed proposal.');
  ap.setLinkDirection(ab.id, 'A');
  assert.match(ap.taskLinkHtml(ab, 0), /value="A" selected>A → B/);
  assert.ok(!ap.taskLinkHtml(ab, 0).includes('ap-task-accept-direction'));
  assert.equal(ap.runtime.stats.A.requiredKeys, 0);
  assert.equal(ap.runtime.stats.B.requiredKeys, 1);
  ap.setLinkDirection(ab.id, '');
  ap.state.anchors.A.done = true; ap.state.anchors.B.done = true; ap.runtime.workPlan = null;
  assert.equal(ap.getSuggestedLinkDirection(ab), null);
  assert.match(ap.taskLinkHtml(ab, 0), /value="" selected>Direction open/);
  ab.existing = true;
  assert.equal(ap.getSuggestedLinkDirection(ab), null);
}
{
  const { ap } = runtime(); portal(ap, 'A', 1); portal(ap, 'B', 3);
  const ab = link(ap, 'A', 'B', [blocker('earlyB', 'B', 3, 'X', 20)]);
  ap.setBlockerTask('earlyB', 'B', false);
  assert.equal(ap.getWorkPlan().stops[0].planVisit, false);
  assert.equal(ap.getSuggestedLinkDirection(ab).from, 'A', 'An early blocker visit must not become the suggested throwing visit.');
}
{
  const { ap, context, refreshTaskList } = runtime();
  function button(id, open) {
    const row = { hidden: !open }, icon = { textContent: '' };
    return { row, attrs: { 'data-stop': id, 'aria-expanded': String(open) },
      getAttribute(name) { return this.attrs[name]; }, setAttribute(name, value) { this.attrs[name] = value; },
      closest() { return { querySelector() { return row; } }; }, querySelector() { return icon; } };
  }
  const original = [button('plan:A', false), button('plan:B', true)];
  const reordered = [button('plan:B', false), button('plan:A', true)];
  let buttons = original;
  const element = { scrollTop: 87, querySelectorAll(selector) { return selector === '.ap-task-expand' ? buttons : []; },
    set innerHTML(value) { buttons = reordered; this.scrollTop = 0; } };
  context.document.getElementById = () => element;
  ap.runtime.taskListOpen = true; ap.taskListHtml = () => ''; ap.wireTaskList = () => {};
  refreshTaskList();
  assert.equal(reordered[0].getAttribute('aria-expanded'), 'true', 'Expanded state follows stop identity after rerouting.');
  assert.equal(reordered[0].row.hidden, false);
  assert.equal(reordered[1].row.hidden, true, 'A manually collapsed row stays collapsed.');
  assert.equal(element.scrollTop, 87);
}
console.log('Work-plan checks passed: directed keys, shared blockers, insertion deadlines, bundled work, repeat visits, manual/Intel separation, migration, GPS stability, missing data, direction suggestions, compact table refresh and localized UI.');
