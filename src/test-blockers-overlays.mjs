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
  const renderOverlays = ap.renderOverlays;
  ap.state.language = 'en';
  ap.renderPanel = ap.renderOverlays = ap.refreshTaskList = ap.queueMissingNameRefresh = ap.refreshKeyList = () => {};
  context.window.plugin.keys = { keys: { B: 5 }, addKey(delta, guid) { this.keys[guid] = (this.keys[guid] || 0) + delta; } };
  return { ap, context, storage, renderOverlays };
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
{
  const {ap,context,storage,renderOverlays}=runtime();
  const first=planned(ap), blocker={guid:'shared',a:'X',b:'Y',latlngA:point(-1,1),latlngB:point(2,1),faction:'enl'};
  const second={...first,id:'C|D',a:'C',b:'D',latlngA:point(1,0),latlngB:point(1,2)};
  for(const link of [first,second]){link.blocked=true;link.blockers=[blocker];}
  ap.runtime.links=[first,second];
  ap.runtime.layerGroup={layers:[],clearLayers(){this.layers=[];}};
  const shape=(kind,coords,options)=>({kind,coords,options,addTo(group){group.layers.push(this);return this;}});
  context.L.polyline=(coords,options)=>shape('line',coords,options);
  context.L.circleMarker=(coords,options)=>shape('crossing',coords,options);
  context.window.map={setView(){},getZoom:()=>13};
  ap.addHtmlStatusMarker=()=>{};ap.getNextRouteTarget=()=>null;ap.getRouteTasks=()=>[];ap.getBlockerWorklist=()=>[];
  ap.renderOverlays=renderOverlays;
  const layers=()=>ap.runtime.layerGroup.layers;
  Object.keys(ap.runtime.stats).forEach(guid=>ap.ensureAnchorState(guid));
  const before=JSON.stringify(ap.state), stock=JSON.stringify(context.window.plugin.keys.keys), work=JSON.stringify(ap.runtime.links);
  assert.equal(ap.runtime.showAllBlockers,false);
  ap.renderOverlays();
  assert.equal(layers().filter(l=>l.kind==='crossing').length,0,'Default view has no clutter of crossing dots.');
  assert.equal(layers().filter(l=>l.options.color===ap.blockerColor(blocker)).length,1,'Shared blockers are drawn only once.');
  assert.ok(layers().every(l=>l.options.weight<=2 && l.options.opacity<=.8),'Default overlays remain subdued, including target lines.');
  function controls(){const toggle={attrs:{},setAttribute(k,v){this.attrs[k]=v;}},clear={disabled:false};return{toggle,clear,root:{querySelector(s){return s==='.ap-blocker-map-toggle'?toggle:s==='.ap-blocker-map-clear'?clear:null;}}};}
  const panel=controls(),preview=controls();ap.runtime.panel=panel.root;
  ap.renderPanel=()=>ap.wireBlockerMapControls(panel.root);
  ap.runtime.walkSimulation={element:preview.root};ap.wireBlockerMapControls(panel.root);ap.wireBlockerMapControls(preview.root);
  assert.equal(panel.clear.disabled,true);assert.equal(panel.toggle.attrs['aria-pressed'],'false');
  assert.match(ap.blockerMapControlsHtml(),/Show all blockers/);
  panel.toggle.onclick();
  assert.equal(ap.runtime.showAllBlockers,true);
  assert.equal(preview.toggle.attrs['aria-pressed'],'true','Panel changes synchronize preview controls.');
  assert.equal(layers().filter(l=>l.kind==='crossing').length,2,'The explicit full view restores every distinct crossing.');
  assert.ok(layers().some(l=>l.options.weight===5));
  preview.toggle.onclick();
  assert.equal(panel.toggle.attrs['aria-pressed'],'false','Preview changes synchronize panel controls.');
  assert.equal(layers().filter(l=>l.kind==='crossing').length,0);
  ap.focusBlocker(first,blocker);
  assert.equal(panel.clear.disabled,false);
  assert.equal(layers().filter(l=>l.kind==='crossing').length,1,'Quiet view shows only the selected crossing.');
  assert.ok(layers().some(l=>l.options.weight===7),'Selected blockers remain strongly highlighted.');
  preview.clear.onclick();
  assert.equal(ap.runtime.selectedBlocker,null);assert.equal(panel.clear.disabled,true);
  assert.equal(layers().filter(l=>l.kind==='crossing').length,0);
  assert.equal(JSON.stringify(ap.state),before);assert.equal(JSON.stringify(context.window.plugin.keys.keys),stock);
  assert.equal(JSON.stringify(ap.runtime.links),work,'Display modes must not alter detection or tasks.');assert.equal(storage.size,0);
  ap.runtime.walkSimulation=null;ap.runtime.showAllBlockers=true;ap.showWorkspaceHome();
  assert.equal(ap.runtime.showAllBlockers,false,'Home returns to the quiet default.');
}
function field(opacity) {
  const listeners=new Map();
  return {options:{fillOpacity:opacity,fillColor:'#00ff00',stroke:false,data:{points:['A','B','C']}},writes:0,
    setStyle(style){Object.assign(this.options,style);this.writes++;},
    on(name,fn){listeners.set(name,fn);},off(name,fn){if(listeners.get(name)===fn)listeners.delete(name);},
    add(){listeners.get('add')?.();},get listeners(){return listeners.size;}};
}
function fieldControls(){const button={attrs:{},setAttribute(k,v){this.attrs[k]=v;}};return {button,root:{querySelector:s=>s==='.ap-intel-field-toggle'?button:null}};}
{
  const {ap,context,storage}=runtime(),a=field(.25),b=field(.6),zero=field(0),plan=field(.12);
  context.window.fields={a,b,zero};
  context.window.links={existing:{options:{color:'green'}}};context.window.portals={A:{title:'A'}};
  const before=JSON.stringify(ap.state),inventory=JSON.stringify(context.window.plugin.keys.keys),original=JSON.stringify([a.options,b.options,zero.options]);
  const panel=fieldControls(),fan=fieldControls(),preview=fieldControls();
  ap.runtime.panel=panel.root;ap.runtime.walkSimulation={index:7,element:preview.root};
  context.document.getElementById=id=>id==='ap-fan-planner'?fan.root:null;
  [panel,fan,preview].forEach(c=>ap.wireIntelFieldControls(c.root));
  ap.syncIntelFieldVisibility();assert.equal(a.writes,0,'Fields remain untouched before explicit hiding.');
  panel.button.onclick();
  assert.equal(a.options.fillOpacity,0);assert.equal(b.options.fillOpacity,0);assert.equal(plan.options.fillOpacity,.12,'Own plan shading is not in the Intel registry and must remain visible.');
  assert.equal(Object.keys(context.window.fields).length,3,'Intel field entities remain available.');
  assert.equal(context.window.links.existing.options.color,'green');assert.equal(context.window.portals.A.title,'A');
  assert.equal(fan.button.attrs['aria-pressed'],'true');assert.equal(preview.button.attrs['aria-pressed'],'true');
  assert.equal(ap.runtime.walkSimulation.index,7,'Display toggling cannot restart simulation.');
  ap.syncIntelFieldVisibility();assert.equal(a.writes,1,'Repeated refreshes need not rewrite an already hidden fill.');
  preview.button.onclick();assert.equal(panel.button.attrs['aria-pressed'],'false');
  assert.equal(JSON.stringify([a.options,b.options,zero.options]),original,'Restore each original opacity and preserve all other native styles/data.');
  assert.equal(ap.runtime.hiddenIntelFields.size,0);assert.equal(a.listeners,0);
  assert.equal(JSON.stringify(ap.state),before);assert.equal(JSON.stringify(context.window.plugin.keys.keys),inventory);assert.equal(storage.size,0);
}
{
  const {ap,context}=runtime(),hooks={},events={};
  context.L.LayerGroup=class{clearLayers(){}};context.window.addHook=(name,fn)=>hooks[name]=fn;
  context.window.map={on:(name,fn)=>events[name]=fn,hasLayer:()=>true};
  context.window.fields={};ap.setupLayer();ap.runtime.hideIntelFieldFill=true;
  const added=field(.25);hooks.fieldAdded({field:added});
  assert.equal(added.options.fillOpacity,0,'fieldAdded precedes native registration/addition and still must hide the new field.');
  context.window.fields.new=added;
  added.options.fillOpacity=.4;added.add();assert.equal(added.options.fillOpacity,0,'A later native add/style pass still honors the switch.');
  events.overlayremove({layer:ap.runtime.layerGroup});assert.equal(added.options.fillOpacity,.4,'Disabling Anchor Planner restores Intel fills.');
  events.overlayadd({layer:ap.runtime.layerGroup});assert.equal(added.options.fillOpacity,0,'Re-enabling restores the requested display mode.');
  delete context.window.fields.new;ap.syncIntelFieldVisibility();assert.equal(added.options.fillOpacity,.4);assert.equal(ap.runtime.hiddenIntelFields.size,0);assert.equal(added.listeners,0,'Unload releases saved field objects and add listeners.');
  context.window.fields.next=field(.25);hooks.mapDataRefreshEnd();assert.equal(context.window.fields.next.options.fillOpacity,0,'Refresh catches native fields if an add hook was missed.');
  ap.showWorkspaceHome();assert.equal(context.window.fields.next.options.fillOpacity,.25);assert.equal(ap.runtime.hideIntelFieldFill,false);
}
{
  const {ap,context}=runtime(),native=field(.25);context.window.fields={native};ap.runtime.hideIntelFieldFill=true;
  ap.syncIntelFieldVisibility();native.options.fillOpacity=.75;ap.syncIntelFieldVisibility();
  ap.runtime.hideIntelFieldFill=false;ap.syncIntelFieldVisibility();assert.equal(native.options.fillOpacity,.75,'Restoration respects another plugin changing the fill style.');
  ap.runtime.hideIntelFieldFill=true;ap.syncIntelFieldVisibility();native.options.fillOpacity=.9;
  ap.runtime.hideIntelFieldFill=false;ap.syncIntelFieldVisibility();assert.equal(native.options.fillOpacity,.9,'Do not overwrite a newer style supplied just before restoring.');
  context.window.fields={unsupported:{options:{}},broken:{options:{fillOpacity:.25},setStyle(){throw Error('unsupported renderer');}}};
  ap.runtime.hideIntelFieldFill=true;assert.doesNotThrow(()=>ap.syncIntelFieldVisibility());
  assert.equal(ap.runtime.hiddenIntelFields.size,0);
}
console.log('Blocker/overlay checks: Intel-fill hide/restore/live hooks/cleanup, synchronized display controls, preserved native data/inventory, blocker modes/factions and geographic badges passed.');
