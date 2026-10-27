import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('./iitc-anchor-planner.user.js',import.meta.url),'utf8');
const wrapper=source.slice(source.indexOf('function wrapper(plugin_info) {'),source.lastIndexOf('var script = document.createElement'));
function point(lat,lng){return {lat,lng,distanceTo:p=>Math.hypot(lat-p.lat,lng-p.lng)*1000};}
function runtime(){
  const storage=new Map(),timers=new Map(),timerDelays=[],layers=[],mapEvents=[];let timerId=0;
  class Layer {constructor(){this.items=[];this.clears=0;layers.push(this);}addTo(){return this;}clearLayers(){this.items=[];this.clears++;}removeLayer(item){this.items=this.items.filter(i=>i!==item);}}
  const draw=(kind,coords,options={})=>({kind,coords,options,addTo(layer){layer.items.push(this);return this;},setLatLngs(p){this.coords=p;return this;},setLatLng(p){this.coords=p;return this;}});
  const nodes=()=>{const n={'.ap-walk-content':{innerHTML:'',textContent:''}};for(const s of ['previous','next','play','restart'])n['.ap-walk-'+s]={disabled:false,textContent:''};return {innerHTML:'',querySelector:s=>n[s]};};
  const context={console,navigator:{},document:{getElementById:()=>null,createElement:nodes},
    localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
    setTimeout:(fn,ms)=>{timerDelays.push(ms);timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),
    L:{latLng:point,LayerGroup:Layer,polyline:(p,o)=>draw('line',p,o),polygon:(p,o)=>draw('field',p,o),circleMarker:(p,o)=>draw('head',p,o)},
    window:{bootPlugins:[],innerWidth:360,portals:{},map:{getCenter:()=>point(9,9),getZoom:()=>13,stop:()=>mapEvents.push(['stop']),panTo:(p,options)=>mapEvents.push(['pan',p,options]),setView:(p,z)=>mapEvents.push(['restore',p,z]),removeLayer:()=>mapEvents.push(['remove'])},alert:m=>mapEvents.push(['alert',m])}};
  vm.runInNewContext(wrapper+'\nwrapper({});',context);const ap=context.window.plugin.anchorPlanner;
  const renderOverlays=ap.renderOverlays,realOwnership=ap.getPortalOwnership;
  // Baseline simulation fixtures have friendly portals; ownership-specific cases restore the real reader.
  ap.getPortalOwnership=()=>({faction:'res',action:'',source:'fixture'});
  ap.state.language='en';ap.renderPanel=()=>{};ap.renderOverlays=()=>{};ap.refreshTaskList=()=>{};
  context.window.dialog=d=>context.dialog=d;
  context.window.plugin.keys={keys:{B:1,C:2},addKey(){throw new Error('Simulation must never write Keys');}};
  ap.runtime.stats={A:{guid:'A',title:'Rathaus',lat:0,lng:0},B:{guid:'B',title:'Brunnen',lat:0,lng:1},C:{guid:'C',title:'Park',lat:1,lng:1}};
  function link(a,b){const x={id:ap.normalizedLinkId(a,b),a,b,titleA:ap.runtime.stats[a].title,titleB:ap.runtime.stats[b].title,latlngA:point(ap.runtime.stats[a].lat,ap.runtime.stats[a].lng),latlngB:point(ap.runtime.stats[b].lat,ap.runtime.stats[b].lng),existing:false,blockers:[]};ap.state.linkDirections[x.id]=a;return x;}
  const ab=link('A','B'),ac=link('A','C'),bc=link('B','C');ap.runtime.links=[ab,ac,bc];
  const blocker={id:'block',manual:false,blocker:{a:'X',b:'Y',titleA:'Blocker X',titleB:'Blocker Y'},links:[ab,ac]};
  const plan={stops:[{portal:{guid:'X',title:'Abbau',lat:0,lng:-1},planVisit:false,links:[],blockers:[blocker]},
    {portal:ap.runtime.stats.A,planVisit:true,links:[ab,ac],blockers:[]},
    {portal:ap.runtime.stats.B,planVisit:true,links:[bc],blockers:[]},
    {portal:ap.runtime.stats.A,planVisit:true,links:[],blockers:[]}],blockers:[blocker],unscheduled:[],unassigned:[]};
  ap.getWorkPlan=()=>plan;ap.getCurrentUserLocation=()=>({latlng:point(0,-2)});
  return {ap,context,storage,timers,timerDelays,layers,mapEvents,plan,ab,ac,bc,renderOverlays,realOwnership};
}
{
  const {ap,context,storage}=runtime(),before=JSON.stringify(ap.state),inventory=JSON.stringify(context.window.plugin.keys.keys);
  const model=ap.createWalkSimulation();
  assert.equal(model.frames.length,4,'Repeat visits and blocker-only stops retain task order.');
  assert.equal(model.frames[0].actions[0].kind,'blocker');assert.equal(model.frames[1].links.length,2);
  assert.equal(model.frames[2].links.length,3);assert.equal(model.frames[2].fields.length,1,'Last triangle edge closes one geometric preview.');
  assert.equal(model.frames[3].distance,4000);assert.equal(JSON.stringify(ap.state),before);assert.equal(JSON.stringify(context.window.plugin.keys.keys),inventory);assert.equal(storage.size,0);
  context.window.plugin.keys.keys.C=99;ap.runtime.stats.A.title='Changed';
  assert.equal(model.frames[1].title,'Rathaus','Frames stay frozen after real plan/name/stock changes.');
}
{
  const {ap,plan}=runtime();
  plan.stops.unshift({portal:ap.runtime.stats.C,routeTargetType:'start',planVisit:false,links:[],blockers:[]});
  ap.showWalkSimulation();
  const html=ap.runtime.walkSimulation.element.querySelector('.ap-walk-content').innerHTML;
  assert.match(html,/Route start/);
  assert.ok(!html.includes('prepare'),'An origin does not invent preparation work.');
}
{
  const {ap,context,mapEvents,storage}=runtime(),requests=new Map();let requestId=0;
  context.window.requestAnimationFrame=fn=>{requests.set(++requestId,fn);return requestId;};
  context.window.cancelAnimationFrame=id=>requests.delete(id);
  function tick(time){const [id,fn]=requests.entries().next().value;requests.delete(id);fn(time);}
  const before=JSON.stringify(ap.state),keys=JSON.stringify(context.window.plugin.keys.keys);
  ap.showWalkSimulation();const session=ap.runtime.walkSimulation;
  assert.equal(session.head.coords.lng,-2,'Initial travel starts at the real route origin.');
  tick(0);tick(2500);
  assert.equal(session.head.coords.lng,-1.25,'Marker moves along the segment rather than jumping to the stop.');
  assert.equal(session.pathLayers[0].coords.at(-1).lng,-1.25,'The trail ends at the moving marker.');
  tick(5000);assert.equal(session.travel,null);assert.equal(session.head.coords.lng,-1);
  const path=session.pathLayers[0];ap.seekWalkSimulation(1);
  assert.equal(session.head.coords.lng,-1,'Forward travel retains the departure point initially.');
  assert.equal(session.pathLayers[0],path,'Animate the existing trail in place.');
  tick(6000);tick(7500);assert.equal(session.head.coords.lng,-.25);assert.equal(path.coords.at(-1).lng,-.25);
  tick(9000);assert.equal(session.head.coords.lng,0);assert.equal(path.coords.at(-1).lng,0);
  ap.seekWalkSimulation(0);assert.equal(session.head.coords.lng,0,'Backward travel starts at the previous stop.');
  tick(10000);tick(11500);assert.equal(session.head.coords.lng,-.75);assert.equal(session.pathLayers[0].coords.at(-1).lng,-.75);
  tick(13000);assert.equal(session.head.coords.lng,-1);
  ap.seekWalkSimulation(1);const stale=requests.values().next().value;
  ap.seekWalkSimulation(2);const active=session.travel,head=JSON.stringify(session.head.coords);
  stale(20000);assert.equal(session.travel,active);assert.equal(JSON.stringify(session.head.coords),head,'Cancelled travel cannot overwrite a newer step.');
  context.dialog.closeCallback();assert.equal(requests.size,0);assert.equal(session.travel,null);
  assert.ok(mapEvents.some(e=>e[0]==='restore'));
  stale(30000);assert.equal(requests.size,0,'Late frames cannot revive a closed preview.');
  context.window.matchMedia=()=>({matches:true});ap.showWalkSimulation();assert.equal(requests.size,0,'Reduced motion also disables trail/marker interpolation.');
  assert.equal(ap.runtime.walkSimulation.head.coords.lng,-1);context.dialog.closeCallback();
  assert.equal(JSON.stringify(ap.state),before);assert.equal(JSON.stringify(context.window.plugin.keys.keys),keys);assert.equal(storage.size,0);
}
for(const reason of ['direction','keys','unknown','blocked','coordinates']){
  const {ap,context,plan,ab}=runtime();
  if(reason==='direction')delete ap.state.linkDirections[ab.id];
  if(reason==='keys')context.window.plugin.keys.keys.B=0;
  if(reason==='unknown')delete context.window.plugin.keys;
  if(reason==='blocked')plan.stops[0].blockers=[];
  if(reason==='coordinates'){delete ap.runtime.stats.B.lat;delete ab.latlngB;delete ap.runtime.links[2].latlngA;}
  const frames=ap.createWalkSimulation().frames;
  const action=frames[1].actions.find(a=>a.title.includes('Brunnen'));
  assert.notEqual(action.status,'walk.ready',reason);assert.ok(frames[1].links.length<2);
}
{
  const {ap,context,plan}=runtime();context.window.plugin.keys.keys.C=1;
  const frames=ap.createWalkSimulation().frames;
  assert.equal(frames[2].actions[0].status,'walk.missingKeys','Virtual earlier throws consume keys without changing real stock.');
  assert.equal(context.window.plugin.keys.keys.C,1);
  plan.unscheduled.push({});plan.unassigned.push({});assert.equal(ap.createWalkSimulation().unresolved,2);
}
{
  const {ap,context,timers,layers,mapEvents,storage,ab}=runtime();
  ap.showWalkSimulation();const first=ap.runtime.walkSimulation;
  assert.equal(context.dialog.width,340);assert.equal(first.index,0);assert.equal(layers.length,2);
  assert.equal(first.targetLayer.items.filter(i=>i.kind==='field').length,1,'The complete target field is visible before the first simulated throw.');
  const targetItems=first.targetLayer.items.slice();
  ap.seekWalkSimulation(2);assert.equal(first.index,2);assert.ok(first.element.querySelector('.ap-walk-content').innerHTML.includes('1 triangles'));
  assert.ok(first.layer.items.some(i=>i.kind==='field'));
  ap.seekWalkSimulation(1);assert.ok(!first.layer.items.some(i=>i.kind==='field'),'Previous removes future geometry.');
  assert.deepEqual(first.targetLayer.items,targetItems,'Rewinding progress keeps the complete target geometry.');
  ap.playWalkSimulation();assert.equal(first.playing,true);assert.equal(timers.size,1);
  ap.playWalkSimulation();assert.equal(first.playing,false);assert.equal(timers.size,0);
  ap.seekWalkSimulation(0);ap.playWalkSimulation();
  while(timers.size){const [id,fn]=timers.entries().next().value;timers.delete(id);fn();}
  assert.equal(first.index,3);assert.equal(first.playing,false);assert.equal(timers.size,0);
  ab.existing=true;ab.existingGuid='new';ap.updateKeyConsumption();assert.equal(storage.size,0,'Preview-generated observations cannot consume real Keys.');
  assert.equal(ap.observeNewPlanLinks(),false);
  const close=context.dialog.closeCallback;ap.playWalkSimulation();const stale=timers.values().next().value;
  close();assert.equal(ap.runtime.walkSimulation,null);assert.equal(timers.size,0);assert.equal(first.layer.items.length,0);
  assert.equal(first.targetLayer.items.length,0,'Closing also removes the preview target snapshot.');
  assert.ok(mapEvents.some(e=>e[0]==='restore'&&e[2]===13));
  stale();assert.equal(ap.runtime.walkSimulation,null,'Late timer callbacks cannot revive a closed preview.');
  ap.updateKeyConsumption();assert.equal(storage.size,0,'Late tile events after close stay isolated until a real scan.');
  ap.showWalkSimulation();const second=ap.runtime.walkSimulation;close();assert.equal(ap.runtime.walkSimulation,second,'Old dialog close cannot stop a new session.');
  context.dialog.closeCallback();
}
{
  const {ap,context,mapEvents}=runtime();
  ap.showWalkSimulation();const session=ap.runtime.walkSimulation;
  const firstHead=session.head,clears=session.layer.clears;
  ap.seekWalkSimulation(1);
  const previousLink=session.layer.items.find(i=>i.kind==='line'&&i.coords.length===2&&i.coords[0].lng===0);
  ap.seekWalkSimulation(2);
  assert.equal(session.layer.clears,clears,'Forward steps retain the existing overlay instead of rebuilding it.');
  assert.ok(session.layer.items.includes(previousLink),'Previously drawn links retain their Leaflet identity.');
  assert.equal(session.head,firstHead,'The current-stop marker is updated in place.');
  const moves=mapEvents.filter(e=>e[0]==='pan');
  assert.ok(moves.every(e=>e[2].animate&&e[2].duration>=2.5&&e[2].duration<=5),'Slower panning remains bounded, including distant stops.');
  const count=mapEvents.length,items=session.layer.items.slice();
  ap.playWalkSimulation();ap.playWalkSimulation();
  assert.equal(mapEvents.length,count,'Pause/resume does not repeat the camera move.');
  assert.deepEqual(session.layer.items,items);
  ap.seekWalkSimulation(1);assert.equal(session.layer.clears,clears+1,'Backward seeking rebuilds the correct prefix.');
  context.window.matchMedia=()=>({matches:true});ap.seekWalkSimulation(2);
  assert.equal(mapEvents.filter(e=>e[0]==='pan').at(-1)[2].animate,false,'Respect reduced-motion preference.');
  context.dialog.closeCallback();
  assert.deepEqual(mapEvents.slice(-4).map(e=>e[0]),['stop','remove','remove','restore'],'Stop camera animation before removing both preview layers and restoring the view.');
}
{
  const {ap,mapEvents,context,timers,timerDelays}=runtime();ap.showWalkSimulation();const session=ap.runtime.walkSimulation;
  ap.seekWalkSimulation(1);const shortDuration=mapEvents.filter(e=>e[0]==='pan').at(-1)[2].duration;
  session.model.frames[2].point={lat:0,lng:20};ap.seekWalkSimulation(2);
  const longDuration=mapEvents.filter(e=>e[0]==='pan').at(-1)[2].duration;
  assert.ok(longDuration>shortDuration,'Long travel gets more time than short travel.');assert.equal(longDuration,5);
  ap.playWalkSimulation();assert.ok(timerDelays.at(-1)>=longDuration*1000+1200,'Automatic next stop waits for movement and a reading pause.');
  assert.equal(timers.size,1);ap.playWalkSimulation();assert.equal(timers.size,0);
  session.model.frames[2].point={lat:0,lng:1};ap.seekWalkSimulation(1);ap.playWalkSimulation();
  const [id,advance]=timers.entries().next().value;timers.delete(id);advance();
  assert.ok(timerDelays.at(-1)>=mapEvents.filter(e=>e[0]==='pan').at(-1)[2].duration*1000+1200,'Following steps also wait for their own movement.');
  ap.playWalkSimulation();
  ap.seekWalkSimulation(2);const moves=mapEvents.filter(e=>e[0]==='pan').length;
  session.model.frames[3].point=session.model.frames[2].point;ap.seekWalkSimulation(3);
  assert.equal(mapEvents.filter(e=>e[0]==='pan').length,moves,'Repeat coordinates do not move the camera again.');
  ap.seekWalkSimulation(0);session.model.frames[1].point=null;ap.seekWalkSimulation(1);
  assert.equal(session.head,null);assert.ok(!session.layer.items.some(i=>i.kind==='head'),'Missing coordinates must not retain the previous stop marker.');
  context.dialog.closeCallback();
}
{
  const {ap,context}=runtime(),base=ap.createWalkSimulation().frames[1];
  const links=Array.from({length:5000},(_,i)=>[point(0,i/100),point(1,i/100)]);
  ap.createWalkSimulation=()=>({unresolved:0,frames:Array.from({length:100},(_,i)=>({...base,index:i,links:links.slice(0,(i+1)*50),fields:[],point:{lat:0,lng:i}}))});
  ap.showWalkSimulation();const session=ap.runtime.walkSimulation,firstLink=session.layer.items.find(i=>i.kind==='line'),clears=session.layer.clears;
  for(let i=1;i<100;i++)ap.seekWalkSimulation(i);
  assert.equal(session.layer.clears,clears,'A large preview never clears the overlay while moving forward.');
  assert.ok(session.layer.items.includes(firstLink));
  assert.equal(session.layer.items.length,5002,'Only 5000 links, one trail and one current marker are retained; no duplicates.');
  context.dialog.closeCallback();
}
{
  const {ap,context,plan}=runtime();plan.stops=[];ap.showWalkSimulation();
  assert.ok(ap.runtime.walkSimulation.element.querySelector('.ap-walk-content').innerHTML.includes('No remaining stops'));
  assert.equal(ap.runtime.walkSimulation.element.querySelector('.ap-walk-play').disabled,true);context.dialog.closeCallback();
  ap.runtime.finalScan={running:true};ap.showWalkSimulation();assert.equal(ap.runtime.walkSimulation,null,'Final check and simulation cannot compete for the map.');
}
{
  const {ap,context,storage}=runtime();
  context.window.map.getPane=()=>({});
  context.window.plugin.keys.keys={}; ap.state.linkDirections={};
  const stateBeforePreview=JSON.stringify(ap.state);
  ap.showWalkSimulation(); const session=ap.runtime.walkSimulation;
  assert.equal(session.model.target.links.length,3);
  assert.equal(session.model.target.fields.length,1,'Target fields do not depend on Keys or confirmed directions.');
  ap.seekWalkSimulation(2);
  assert.equal(session.layer.items.filter(i=>i.kind==='field').length,0,'Unavailable throws create no simulated field.');
  assert.equal(session.targetLayer.items.filter(i=>i.kind==='field').length,1);
  assert.ok(session.targetLayer.items.every(i=>i.options.pane===ap.PLAN_PANE_NAME));
  assert.ok(session.layer.items.filter(i=>i.kind==='line').every(i=>i.options.pane===ap.ROUTE_PANE_NAME));
  assert.notEqual(session.targetLayer.items[0].options.color,session.pathLayers[0].options.color);
  assert.match(session.element.innerHTML,/Target plan \(geometric\)/);
  assert.match(session.element.innerHTML,/Simulated build progress/);
  assert.equal(JSON.stringify(ap.state),stateBeforePreview);assert.equal(storage.size,0);
  const oldTarget=JSON.stringify(session.model.target);
  ap.runtime.links[0].latlngA.lat=20;ap.getPlanMapGeometry();
  assert.equal(JSON.stringify(session.model.target),oldTarget,'A later live plan change cannot mutate the preview target snapshot.');
  context.dialog.closeCallback();
}
{
  const {ap,context}=runtime(); context.window.map.getPane=()=>({});
  ap.showWalkSimulation(); const session=ap.runtime.walkSimulation; ap.seekWalkSimulation(2);
  const built=session.layer.items.find(i=>i.kind==='field'),route=session.pathLayers[0],target=session.targetLayer.items[0];
  assert.equal(built.options.pane,ap.BUILD_PANE_NAME);assert.equal(route.options.pane,ap.ROUTE_PANE_NAME);
  assert.notEqual(built.options.color,route.options.color);assert.notEqual(built.options.color,target.options.color);
  context.dialog.closeCallback();
}
{
  const {ap,ab,ac,bc}=runtime();
  assert.equal(ap.buildPlanMapGeometry([ab,ac,bc,ab]).fields.length,1,'Duplicate edges must not duplicate fields.');
  assert.equal(ap.buildPlanMapGeometry([ab,ac]).fields.length,0,'Open boundaries are not filled.');
  assert.equal(ap.buildPlanMapGeometry([{...ab,latlngB:null},ac,bc]).fields.length,0,'Missing coordinates cannot invent a triangle.');
  const collinear=[{...ab,latlngA:point(0,0),latlngB:point(0,1)},{...ac,latlngA:point(0,0),latlngB:point(0,2)},{...bc,latlngA:point(0,1),latlngB:point(0,2)}];
  assert.equal(ap.buildPlanMapGeometry(collinear).fields.length,0);
  const dense=[];for(let a=0;a<30;a++)for(let b=a+1;b<30;b++)dense.push({a:String(a),b:String(b),latlngA:point(a,a*a/100),latlngB:point(b,b*b/100)});
  const geometry=ap.buildPlanMapGeometry(dense);
  assert.equal(geometry.links.length,dense.length);assert.equal(geometry.fields.length,2000);assert.equal(geometry.limited,true);
  assert.match(ap.planMapLegendHtml(true,geometry),/field shading is limited/);
}
{
  const {ap,context,renderOverlays}=runtime();
  ap.runtime.layerGroup=new context.L.LayerGroup();ap.runtime.enabled=true;
  ap.addHtmlStatusMarker=()=>{};ap.getNextRouteTarget=()=>null;ap.getRouteTasks=()=>[];ap.getBlockerWorklist=()=>[];
  ap.renderOverlays=renderOverlays;ap.renderOverlays();
  assert.equal(ap.runtime.layerGroup.items.length,4,'The normal external plan overlay includes its three links and target field.');
  ap.showWalkSimulation();
  assert.equal(ap.runtime.layerGroup.items.length,0,'Use a single target snapshot during simulation, without double shading.');
  assert.equal(ap.runtime.walkSimulation.targetLayer.items.length,4);
  context.dialog.closeCallback();
  assert.equal(ap.runtime.layerGroup.items.length,4,'Closing restores the persistent target geometry.');
  ap.runtime.fanDesigning=true;ap.renderOverlays();assert.equal(ap.runtime.layerGroup.items.length,0,'A new fan draft must not inherit the active work plan overlay.');
  ap.runtime.fanDesigning=false;ap.runtime.enabled=false;ap.renderOverlays();assert.equal(ap.runtime.layerGroup.items.length,0,'Layer toggle still controls permanent plan visibility.');
}
{
  const {ap}=runtime();const external=ap.getPlanMapGeometry();
  ap.getActiveFanPlan=()=>({portals:[{guid:'X',lat:5,lng:5},{guid:'Y',lat:5,lng:6},{guid:'Z',lat:6,lng:6}],links:[['X','Y'],['X','Z'],['Y','Z']]});
  const native=ap.getPlanMapGeometry();assert.equal(native.fields.length,1);assert.equal(native.links[0][0].lat,5);
  assert.notEqual(native,external,'Changing plan source invalidates the geometry cache.');
  ap.getActiveFanPlan=()=>null;assert.equal(ap.getPlanMapGeometry().links[0][0].lat,0,'Returning to the external plan restores only that geometry.');
}
console.log('Walk simulation checks passed: independent target geometry, distinct route/build styles, bounded fields, immutable target, virtual keys, animation, rewind, cleanup and isolated real consumption.');

{
  const {ap,context,storage}=runtime();
  const points=[{guid:'A',title:'A',lat:0,lng:0},{guid:'B',title:'B',lat:0,lng:.02},...[1,2,3].map(i=>({guid:'S'+i,title:'Spine '+i,lat:i*.005,lng:.01}))];
  const design=ap.buildSpineDesign(points,['A','B']);
  ap.state.fanDesign=ap.normalizeFanDesign({mode:'spine',spine:design.spine,anchors:['A','B'],assignments:{},portals:points,links:design.links.map(e=>[e.a.guid,e.b.guid]),fields:design.fields.map(f=>f.map(p=>p.guid))});
  ap.state.planSource='fan';ap.runtime.stats=Object.fromEntries(points.map(p=>[p.guid,{...p,openLinks:1,linkCount:1}]));
  ap.runtime.links=design.links.map(e=>({id:e.id,a:e.a.guid,b:e.b.guid,titleA:e.a.title,titleB:e.b.title,latlngA:point(e.a.lat,e.a.lng),latlngB:point(e.b.lat,e.b.lng),existing:false,blockers:[]}));
  ap.state.linkDirections={};ap.runtime.links.forEach(e=>ap.state.linkDirections[e.id]=e.a);
  context.window.plugin.keys.keys={A:10,B:10,S1:10,S2:10,S3:10};
  ap.getWorkPlan=()=>ap.buildWorkPlan(null);
  points.forEach(p=>ap.ensureAnchorState(p.guid));
  const before=JSON.stringify(ap.state),keys=JSON.stringify(context.window.plugin.keys.keys);
  const model=ap.createWalkSimulation();
  assert.equal(model.frames.at(-1).links.length,9);assert.equal(model.frames.at(-1).fields.length,7,'Ordered nested spine makes basal layers and side fields');
  assert.equal(JSON.stringify(ap.state),before);assert.equal(JSON.stringify(context.window.plugin.keys.keys),keys);assert.equal(storage.size,0);
  context.window.plugin.keys.keys.B=0;
  const failed=ap.createWalkSimulation();assert.equal(failed.frames.at(-1).links.length,0);assert.equal(failed.frames.at(-1).fields.length,0);
  assert.ok(failed.frames.slice(1).flatMap(f=>f.actions).some(a=>a.status==='spine.prerequisite'));
  context.window.plugin.keys.keys.B=10; delete ap.state.linkDirections[ap.runtime.links[0].id];
  assert.equal(ap.createWalkSimulation().frames.at(-1).links.length,0,'An unconfirmed prerequisite blocks later virtual spine throws');
}


console.log("Spine ordered fields, prerequisite propagation and real inventory isolation passed.");

{
  const {ap,context,storage,ab,realOwnership}=runtime();ap.getPortalOwnership=realOwnership;context.window.PLAYER={team:'RESISTANCE'};
  ap.runtime.links=[ab];ap.runtime.stats={A:{guid:'A',title:'Source',lat:0,lng:0,openLinks:1,linkCount:1},B:{guid:'B',title:'Enemy target',lat:0,lng:1,openLinks:1,linkCount:1}};
  for(const guid of ['A','B'])ap.ensureAnchorState(guid);
  context.window.portals={A:{options:{team:'ENLIGHTENED'}},B:{options:{team:'ENLIGHTENED'}}};
  ap.getWorkPlan=()=>ap.buildWorkPlan(null);const before=JSON.stringify(ap.state),portals=JSON.stringify(context.window.portals),keys=JSON.stringify(context.window.plugin.keys.keys);
  let model=ap.createWalkSimulation();assert.equal(model.frames.flatMap(f=>f.actions).filter(a=>a.kind==='portal').length,2);assert.equal(model.frames.at(-1).links.length,1);
  const targetCapture=model.frames.findIndex(f=>f.actions.some(a=>a.kind==='portal'&&a.title.includes('Enemy target'))),throwFrame=model.frames.findIndex(f=>f.links.length);
  assert.ok(targetCapture<=throwFrame,'A destination-only enemy portal must be captured before the simulated link');
  context.window.portals.B.options.team=999;model=ap.createWalkSimulation();assert.equal(model.frames.at(-1).links.length,0);assert.ok(model.frames.flatMap(f=>f.actions).some(a=>a.status==='portal.notReady'));
  context.window.portals.B.options.team='MACHINA';context.window.plugin.keys.keys.B=0;model=ap.createWalkSimulation();
  assert.equal(model.frames.flatMap(f=>f.actions).filter(a=>a.kind==='portal'&&a.status==='portal.simulated').length,2,'Captures are independent of missing link keys');assert.equal(model.frames.at(-1).links.length,0);
  context.window.portals.B.options.team='ENLIGHTENED';context.window.plugin.keys.keys.B=1;
  // Removing a blocker at A alone cannot capture B: bypass route insertion deliberately.
  ap.getWorkPlan=()=>({stops:[{portal:ap.runtime.stats.A,portalTask:{action:'capture',faction:'enl'},links:[ab],blockers:[]}],blockers:[],unscheduled:[],unassigned:[]});
  assert.equal(ap.createWalkSimulation().frames[0].links.length,0);
  assert.equal(JSON.stringify(ap.state),before);assert.equal(JSON.stringify(context.window.portals),portals);assert.equal(JSON.stringify(context.window.plugin.keys.keys),keys);assert.equal(storage.size,0);
}
console.log('Portal preview: explicit virtual capture, target prerequisites, unknown rejection, independent keys and no real ownership/completion writes passed.');
