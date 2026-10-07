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
  assert.equal(plan.stops.length, 2, 'A receiving-only portal has no redundant later visit.');
  assert.equal(ap.ensureAnchorState('B').done, false, 'Removal does not complete the receiving portal.');
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
  ap.runtime.stats.B.title = '<script>alert(1)</script>';
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
function routeDistance(plan,origin){let from=origin,total=0;for(const stop of plan.stops){const to=point(stop.portal.lat,stop.portal.lng);total+=from.distanceTo(to);from=to;}return total;}
function assertDependencies(ap,plan){
  const removed=new Set(),links=new Set();
  for(const stop of plan.stops){
    for(const item of stop.blockers){assert.ok(!removed.has(item.id),'Each removal is scheduled once.');removed.add(item.id);}
    for(const task of stop.links){assert.ok(!links.has(task.id),'Each throw is assigned once.');links.add(task.id);
      for(const b of task.blockers)assert.ok(removed.has(b.guid)||ap.getWorkBlockers().find(i=>i.id===b.guid).manual,'Removal precedes the dependent throw.');}
  }
}
{
  // Anonymous translated geometry: two throw sources, a distant target, two blocker clusters.
  const {ap}=runtime();portal(ap,'A',0,0);portal(ap,'B',.080,-.024);portal(ap,'C',.015,.019);
  const coords={S:[.019,.008],X:[.027,.012],Y:[.026,.012],Z:[.020,.015],P:[.047,-.011],Q:[.043,-.018],U:[.048,-.014],V:[.047,-.015],N:[.047,-.013],M:[.047,-.0145]};
  function edge(id,a,b){const [ax,ay]=coords[a],[bx,by]=coords[b];return {guid:id,a,b,titleA:a,titleB:b,latlngA:point(ay,ax),latlngB:point(by,bx)};}
  const ab=link(ap,'A','B',[edge('wild1','P','Q'),edge('wild2','U','V'),edge('wild3','N','M')]);direction(ap,ab,'A');
  const cb=link(ap,'C','B',[edge('spring1','S','X'),edge('spring2','S','Y'),edge('spring3','S','Z')]);direction(ap,cb,'C');link(ap,'A','C',[],true);
  const origin=point(.054,.044),location={latlng:origin};
  const base=ap.sortedStats(false).slice().sort((a,b)=>origin.distanceTo(point(a.lat,a.lng))-origin.distanceTo(point(b.lat,b.lng)));
  const old=ap.buildWorkPlanForOrder(base,origin,location,null),before=JSON.stringify(ap.state);
  const plan=ap.buildWorkPlan(location),cost=routeDistance(plan,origin),oldCost=routeDistance(old,origin);
  assert.ok(cost<=oldCost,'Joint optimization never lengthens the route after redundant targets are removed.');
  assert.ok(!plan.stops.some(s=>s.portal.guid==='B'),'The distant receiving-only target has no work stop.');
  assert.equal(plan.unscheduled.length,0);assert.equal(plan.unassigned.length,0);assertDependencies(ap,plan);
  assert.equal(JSON.stringify(ap.state),before,'Order and endpoint suggestions do not overwrite saved choices, directions or completion.');
  assert.deepEqual(ap.buildWorkPlan(location).stops.map(s=>s.portal.guid),plan.stops.map(s=>s.portal.guid),'Search is deterministic.');
  assert.ok(plan.optimization.evaluations<=160);
  ap.getCurrentUserLocation=()=>location;
  const frames=ap.createWalkSimulation();
  assert.deepEqual(Array.from(frames.frames,f=>f.title),Array.from(plan.stops,s=>s.portal.title),'Walk Sim follows the same optimized route.');
  ap.state.workRouteMode='manual';
  const manual=ap.buildWorkPlan(location);
  assert.deepEqual(Array.from(manual.stops.filter(s=>s.planVisit),s=>s.portal.guid),['A','C'],'Manual order among actionable portals remains authoritative.');
  assertDependencies(ap,manual);assert.equal(manual.optimization,undefined);
  ap.state.workRouteMode='location';
  const noGPS=ap.buildWorkPlan(null);assert.deepEqual(Array.from(noGPS.stops.filter(s=>s.planVisit),s=>s.portal.guid),['A','C']);
  const signature=ap.runtime.links.map(l=>l.id).sort().join(';');ap.state.blockerTasks.spring1={plan:signature,target:'X',done:false};
  const fixed=ap.buildWorkPlan(location);assert.equal(fixed.stops.find(s=>s.blockers.some(b=>b.id==='spring1')).portal.guid,'X','Optimization preserves explicit endpoints.');
  ap.state.blockerRoutePortals.Y=true;
  const selected=ap.buildWorkPlan(location);assert.equal(selected.stops.find(s=>s.blockers.some(b=>b.id==='spring2')).portal.guid,'Y','Legacy selected endpoints also remain authoritative.');
  ap.state.blockerTasks.wild1={plan:signature,done:true};
  const reported=ap.buildWorkPlan(location);assert.ok(!reported.stops.flatMap(s=>s.blockers).some(b=>b.id==='wild1'));assertDependencies(ap,reported);
}
{
  const {ap}=runtime();portal(ap,'A',1);portal(ap,'B',2);
  const edges=[['X',.25,-.1],['Y',.5,.1],['Z',.75,-.1]].map(([b,x,y],i)=>({guid:'star'+i,a:'S',b,titleA:'S',titleB:b,latlngA:point(.2,.5),latlngB:point(y,x)}));
  const ab=link(ap,'A','B',edges);direction(ap,ab,'A');
  const plan=ap.buildWorkPlan({latlng:point(0,0)}),removals=plan.stops.filter(s=>s.blockers.length);
  assert.equal(removals.length,1,'Joint endpoint selection recognizes the cheaper shared removal portal.');
  assert.equal(removals[0].portal.guid,'S');assert.equal(removals[0].blockers.length,3);assertDependencies(ap,plan);
}
{
  const {ap}=runtime();for(let i=0;i<41;i++)portal(ap,'P'+i,i/100);
  link(ap,'P0','P40');const plan=ap.buildWorkPlan({latlng:point(0,-1)});
  assert.equal(plan.optimization,undefined,'Large plans use the valid bounded fallback.');assert.equal(plan.stops.length,1,'Unused portals are skipped even in bounded fallback.');
}
{
  const {ap}=runtime();portal(ap,'A',1);portal(ap,'B',3);
  const shared=blocker('shared','X',.5,'Y',8);const ab=link(ap,'A','B',[shared]);
  const plan=ap.buildWorkPlan({latlng:point(0,0)});assertDependencies(ap,plan);
  assert.equal(ap.getLinkDirection(ab),null,'Routing never silently confirms an unknown direction.');
  ap.runtime.stats.B.lat=null;
  assert.equal(ap.buildWorkPlan({latlng:point(0,0)}).optimization,undefined,'Missing coordinates do not create a falsely shorter route.');
}
{
  const {ap,context,storage}=runtime();portal(ap,'A',0);portal(ap,'B',1);
  const ab=link(ap,'A','B',[blocker('early','B',1,'Z',20)]);direction(ap,ab,'A');
  ap.setBlockerTask('early','B',false);ap.getCurrentUserLocation=()=>null;
  const directions=JSON.stringify(ap.state.linkDirections);
  assert.equal(ap.startWorkRouteAtPortal('A'),true,'A plan portal can start the route without GPS.');
  const plan=ap.getWorkPlan();assert.equal(plan.stops[0].portal.guid,'A');
  assert.equal(plan.stops[0].routeTargetType,'start');assert.equal(plan.stops[0].links.length,0,'The first visit cannot throw through uncleared blockers.');
  assert.ok(plan.stops.slice(1).some(s=>s.portal.guid==='A'&&s.planVisit&&s.links.includes(ab)),'Return to the source for its throw.');
  assertDependencies(ap,plan);
  assert.equal(ap.getNextRouteTarget(null).guid,'A');
  assert.equal(ap.getRouteEstimate(null).distance,routeDistance(plan,point(0,0)),'Estimate starts at the portal, not at GPS.');
  const frames=ap.createWalkSimulation();assert.equal(frames.origin.lng,0);assert.equal(frames.frames[0].title,'A');assert.equal(frames.frames[0].distance,0);
  assert.ok(ap.taskListHtml().includes('From portal: A'));assert.ok(ap.taskListHtml().includes('Route from this portal'));assert.ok(ap.taskListHtml().includes('Plan preview'));
  ap.getCurrentUserLocation=()=>({latlng:point(0,10)});
  assert.equal(ap.getWorkPlan(),plan,'Live GPS cannot move a fixed portal origin.');
  assert.equal(ap.getRouteEstimate(ap.getCurrentUserLocation()).distance,routeDistance(plan,point(0,0)));
  const saved=JSON.parse(storage.get(ap.STORAGE_KEY));assert.equal(saved.workRouteStart,'A');assert.equal(saved.workRouteMode,'portal');assert.equal(Object.hasOwn(saved,'location'),false);
  const resumed=runtime(saved).ap;resumed.load();assert.equal(resumed.state.workRouteMode,'portal');assert.equal(resumed.state.workRouteStart,'A');
  assert.match(resumed.workRouteLabel(null),/Start portal unavailable/,'Missing portal is labeled rather than silently substituting GPS.');
  resumed.runtime.stats=ap.runtime.stats;resumed.runtime.links=ap.runtime.links;resumed.getCurrentUserLocation=()=>null;
  assert.equal(resumed.getWorkPlan().stops[0].portal.guid,'A','The stored origin becomes active again once the plan is scanned.');
  const startButton={getAttribute:()=> 'A'},controls={};
  ap.wireTaskList({querySelector:s=>controls[s]||(controls[s]={}),querySelectorAll:s=>s==='.ap-task-start'?[startButton]:[]});
  controls['#ap-task-reroute'].onclick();assert.equal(ap.state.workRouteMode,'location');
  startButton.onclick();assert.equal(ap.state.workRouteMode,'portal');assert.equal(ap.state.workRouteStart,'A','Portal-row action is wired to its own GUID.');
  assert.equal(ap.startWorkRouteAtPortal('unknown'),false);assert.equal(ap.state.workRouteStart,'A');
  delete ap.runtime.stats.A.lat;
  assert.equal(ap.startWorkRouteAtPortal('A'),false);assert.equal(ap.getRouteEstimate(ap.getCurrentUserLocation()),null);
  ap.runtime.stats.A.lat=0;
  ap.startWorkRouteAtPortal('B');assert.equal(ap.getWorkPlan().stops[0].portal.guid,'B','A second selection replaces the fixed start.');
  ap.ensureAnchorState('B').done=true;ap.runtime.workPlan=null;ap.getWorkPlan();assert.equal(ap.ensureAnchorState('B').done,true,'Starting at a completed portal does not undo completion.');
  ap.rerouteWorkPlan(false);assert.equal(ap.state.workRouteMode,'location');assert.equal(ap.state.workRouteStart,'');
  const gpsPlan=ap.getWorkPlan();assert.equal(gpsPlan.origin.lng,10,'Route from location explicitly resumes GPS routing.');
  const alerts=[];context.window.alert=m=>alerts.push(m);ap.getCurrentUserLocation=()=>null;
  assert.equal(ap.rerouteWorkPlan(false),false);assert.equal(alerts.length,1,'Missing GPS gives feedback instead of inventing a location.');
  ap.startWorkRouteAtPortal('A');ap.rerouteWorkPlan(true);assert.equal(ap.state.workRouteMode,'manual');assert.equal(ap.state.workRouteStart,'');
  assert.equal(JSON.stringify(ap.state.linkDirections),directions);assert.equal(ap.ensureAnchorState('A').done,false);
  ap.startWorkRouteAtPortal('A');context.confirm=()=>true;
  context.window.plugin.keys={keys:{A:7,B:10}};const keys=JSON.stringify(context.window.plugin.keys.keys);
  ap.clearData();assert.equal(ap.state.workRouteStart,'');assert.equal(ap.state.workRouteMode,'location');
  assert.equal(JSON.stringify(context.window.plugin.keys.keys),keys,'Clearing the portal origin does not clear Keys.');
}
{
  const {ap}=runtime();portal(ap,'A',0);portal(ap,'B',9);portal(ap,'C',1);
  const ab=link(ap,'A','B'),cb=link(ap,'C','B');link(ap,'A','C',[],true);
  direction(ap,ab,'A');direction(ap,cb,'C');
  const before=JSON.stringify(ap.state);
  for(const mode of ['manual','location']){
    ap.state.workRouteMode=mode;ap.runtime.workPlan=null;
    const plan=ap.getWorkPlan({latlng:point(0,-1)});
    assert.ok(!plan.stops.some(s=>s.portal.guid==='B'),'Receiving-only portal is not a detour.');
    assert.equal(plan.stops.flatMap(s=>s.links).length,2);
    assert.ok(plan.stops.every(s=>s.links.length||s.blockers.length));
    assertDependencies(ap,plan);
    ap.getCurrentUserLocation=()=>({latlng:point(0,-1)});
    assert.ok(!ap.createWalkSimulation().frames.some(f=>f.title==='B'));
  }
  ap.state.workRouteMode='location';assert.equal(JSON.stringify(ap.state),before,'Routing alone preserves plan state.');
  ap.startWorkRouteAtPortal('B');
  assert.equal(ap.getWorkPlan().stops.filter(s=>s.portal.guid==='B').length,1);
  assert.equal(ap.getWorkPlan().stops[0].routeTargetType,'start');
  assert.match(ap.taskListHtml(),/Route start/);
  assert.equal(ap.createWalkSimulation().frames[0].routeTargetType,'start');
  ap.state.workRouteMode='manual';ap.state.workRouteStart='';
  ab.blockers=[blocker('atReceiver','B',9,'Z',20)];
  ap.setBlockerTask('atReceiver','B',false);ap.runtime.workPlan=null;
  const withRemoval=ap.getWorkPlan();
  assert.equal(withRemoval.stops.filter(s=>s.portal.guid==='B').length,1,'Receiver remains when it carries actual removal work.');
  assert.equal(withRemoval.stops.find(s=>s.portal.guid==='B').blockers.length,1);assertDependencies(ap,withRemoval);
  ab.blockers=[];direction(ap,ab,'B');ap.runtime.workPlan=null;
  assert.ok(ap.getWorkPlan().stops.some(s=>s.portal.guid==='B'&&s.links.includes(ab)),'Direction reversal makes receiver an actionable source.');
  delete ap.state.linkDirections[ab.id];ap.runtime.workPlan=null;
  assert.equal(ap.getWorkPlan().unassigned.length,0,'Unconfirmed directions remain visible as link tasks.');
  ab.existing=true;cb.existing=true;ap.runtime.workPlan=null;
  assert.equal(ap.getWorkPlan().stops.length,0,'A complete plan has no invented visits.');
}
console.log('Work-plan checks passed: actionable stops, explicit origins, direction changes, fixed portal starts, GPS/manual switching, joint optimization and dependency safety.');
