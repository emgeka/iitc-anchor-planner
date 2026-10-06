import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('./iitc-anchor-planner.user.js',import.meta.url),'utf8');
const wrapper=source.slice(source.indexOf('function wrapper(plugin_info) {'),source.lastIndexOf('var script = document.createElement'));
function point(lat,lng){return {lat,lng,distanceTo:p=>Math.hypot(lat-p.lat,lng-p.lng)*1000};}
function runtime(){
  const storage=new Map(),timers=new Map(),layers=[],mapEvents=[];let timerId=0;
  class Layer {constructor(){this.items=[];layers.push(this);}addTo(){return this;}clearLayers(){this.items=[];}}
  const draw=(kind,coords)=>({addTo(layer){layer.items.push({kind,coords});return this;}});
  const nodes=()=>{const n={'.ap-walk-content':{innerHTML:'',textContent:''}};for(const s of ['previous','next','play','restart'])n['.ap-walk-'+s]={disabled:false,textContent:''};return {innerHTML:'',querySelector:s=>n[s]};};
  const context={console,navigator:{},document:{getElementById:()=>null,createElement:nodes},
    localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
    setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),
    L:{latLng:point,LayerGroup:Layer,polyline:p=>draw('line',p),polygon:p=>draw('field',p),circleMarker:p=>draw('head',p)},
    window:{bootPlugins:[],innerWidth:360,portals:{},map:{getCenter:()=>point(9,9),getZoom:()=>13,panTo:p=>mapEvents.push(['pan',p]),setView:(p,z)=>mapEvents.push(['restore',p,z]),removeLayer:()=>mapEvents.push(['remove'])},alert:m=>mapEvents.push(['alert',m])}};
  vm.runInNewContext(wrapper+'\nwrapper({});',context);const ap=context.window.plugin.anchorPlanner;
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
  return {ap,context,storage,timers,layers,mapEvents,plan,ab,ac,bc};
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
  assert.equal(context.dialog.width,340);assert.equal(first.index,0);assert.equal(layers.length,1);
  ap.seekWalkSimulation(2);assert.equal(first.index,2);assert.ok(first.element.querySelector('.ap-walk-content').innerHTML.includes('1 triangles'));
  assert.ok(first.layer.items.some(i=>i.kind==='field'));
  ap.seekWalkSimulation(1);assert.ok(!first.layer.items.some(i=>i.kind==='field'),'Previous removes future geometry.');
  ap.playWalkSimulation();assert.equal(first.playing,true);assert.equal(timers.size,1);
  ap.playWalkSimulation();assert.equal(first.playing,false);assert.equal(timers.size,0);
  ap.seekWalkSimulation(0);ap.playWalkSimulation();
  while(timers.size){const [id,fn]=timers.entries().next().value;timers.delete(id);fn();}
  assert.equal(first.index,3);assert.equal(first.playing,false);assert.equal(timers.size,0);
  ab.existing=true;ab.existingGuid='new';ap.updateKeyConsumption();assert.equal(storage.size,0,'Preview-generated observations cannot consume real Keys.');
  assert.equal(ap.observeNewPlanLinks(),false);
  const close=context.dialog.closeCallback;ap.playWalkSimulation();const stale=timers.values().next().value;
  close();assert.equal(ap.runtime.walkSimulation,null);assert.equal(timers.size,0);assert.equal(first.layer.items.length,0);
  assert.ok(mapEvents.some(e=>e[0]==='restore'&&e[2]===13));
  stale();assert.equal(ap.runtime.walkSimulation,null,'Late timer callbacks cannot revive a closed preview.');
  ap.updateKeyConsumption();assert.equal(storage.size,0,'Late tile events after close stay isolated until a real scan.');
  ap.showWalkSimulation();const second=ap.runtime.walkSimulation;close();assert.equal(ap.runtime.walkSimulation,second,'Old dialog close cannot stop a new session.');
  context.dialog.closeCallback();
}
{
  const {ap,context,plan}=runtime();plan.stops=[];ap.showWalkSimulation();
  assert.ok(ap.runtime.walkSimulation.element.querySelector('.ap-walk-content').innerHTML.includes('No remaining stops'));
  assert.equal(ap.runtime.walkSimulation.element.querySelector('.ap-walk-play').disabled,true);context.dialog.closeCallback();
  ap.runtime.finalScan={running:true};ap.showWalkSimulation();assert.equal(ap.runtime.walkSimulation,null,'Final check and simulation cannot compete for the map.');
}
console.log('Walk simulation checks passed: stop/blocker order, repeat visits, virtual keys, missing data, triangle closure, immutable snapshot, step/play/pause/restart, stale timers, layer/view cleanup and isolated real consumption.');
