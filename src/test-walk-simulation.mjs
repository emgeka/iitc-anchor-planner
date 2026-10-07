import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('./iitc-anchor-planner.user.js',import.meta.url),'utf8');
const wrapper=source.slice(source.indexOf('function wrapper(plugin_info) {'),source.lastIndexOf('var script = document.createElement'));
function point(lat,lng){return {lat,lng,distanceTo:p=>Math.hypot(lat-p.lat,lng-p.lng)*1000};}
function runtime(){
  const storage=new Map(),timers=new Map(),layers=[],mapEvents=[];let timerId=0;
  class Layer {constructor(){this.items=[];this.clears=0;layers.push(this);}addTo(){return this;}clearLayers(){this.items=[];this.clears++;}removeLayer(item){this.items=this.items.filter(i=>i!==item);}}
  const draw=(kind,coords)=>({kind,coords,addTo(layer){layer.items.push(this);return this;},setLatLngs(p){this.coords=p;return this;},setLatLng(p){this.coords=p;return this;}});
  const nodes=()=>{const n={'.ap-walk-content':{innerHTML:'',textContent:''}};for(const s of ['previous','next','play','restart'])n['.ap-walk-'+s]={disabled:false,textContent:''};return {innerHTML:'',querySelector:s=>n[s]};};
  const context={console,navigator:{},document:{getElementById:()=>null,createElement:nodes},
    localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
    setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),
    L:{latLng:point,LayerGroup:Layer,polyline:p=>draw('line',p),polygon:p=>draw('field',p),circleMarker:p=>draw('head',p)},
    window:{bootPlugins:[],innerWidth:360,portals:{},map:{getCenter:()=>point(9,9),getZoom:()=>13,stop:()=>mapEvents.push(['stop']),panTo:(p,options)=>mapEvents.push(['pan',p,options]),setView:(p,z)=>mapEvents.push(['restore',p,z]),removeLayer:()=>mapEvents.push(['remove'])},alert:m=>mapEvents.push(['alert',m])}};
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
{
  const {ap,plan}=runtime();
  plan.stops.unshift({portal:ap.runtime.stats.C,routeTargetType:'start',planVisit:false,links:[],blockers:[]});
  ap.showWalkSimulation();
  const html=ap.runtime.walkSimulation.element.querySelector('.ap-walk-content').innerHTML;
  assert.match(html,/Route start/);
  assert.ok(!html.includes('prepare'),'An origin does not invent preparation work.');
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
  assert.ok(moves.every(e=>e[2].animate&&e[2].duration===0.9),'Force smooth panning even for stops beyond the viewport.');
  const count=mapEvents.length,items=session.layer.items.slice();
  ap.playWalkSimulation();ap.playWalkSimulation();
  assert.equal(mapEvents.length,count,'Pause/resume does not repeat the camera move.');
  assert.deepEqual(session.layer.items,items);
  ap.seekWalkSimulation(1);assert.equal(session.layer.clears,clears+1,'Backward seeking rebuilds the correct prefix.');
  context.window.matchMedia=()=>({matches:true});ap.seekWalkSimulation(2);
  assert.equal(mapEvents.filter(e=>e[0]==='pan').at(-1)[2].animate,false,'Respect reduced-motion preference.');
  context.dialog.closeCallback();
  assert.equal(mapEvents.at(-3)[0],'stop','Stop camera animation before removing the preview and restoring the view.');
}
{
  const {ap,mapEvents,context}=runtime();ap.showWalkSimulation();const session=ap.runtime.walkSimulation;
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
console.log('Walk simulation checks passed: stop/blocker order, repeat visits, virtual keys, missing data, triangle closure, immutable snapshot, step/play/pause/restart, stale timers, layer/view cleanup and isolated real consumption.');
