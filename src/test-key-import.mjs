import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('./iitc-anchor-planner.user.js', import.meta.url), 'utf8');
const wrapper = source.slice(source.indexOf('function wrapper(plugin_info) {'), source.lastIndexOf('var script = document.createElement'));
const storage = new Map();
const context = { console, setTimeout, clearTimeout, AbortController, window: { bootPlugins: [] }, document: {}, navigator: {},
  localStorage: { getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v) } };
vm.runInNewContext(wrapper + '\nwrapper({});', context);
const ap = context.window.plugin.anchorPlanner;
ap.state.language = 'en';
ap.runtime.stats = { A: {guid:'A',title:'Rathaus',requiredKeys:2}, B: {guid:'B',title:'Brunnen am Markt',requiredKeys:1}, C: {guid:'C',title:'Stadtpark',requiredKeys:3} };
ap.state.anchors.A = { ownedKeys:99, note:'preserve' };
assert.equal(ap.getOwnedKeys('A'), null);
assert.equal(ap.getStatus('A', {requiredKeys:2,openLinks:1}).key, 'unknown');
ap.state.lastScan = { plannedLinks:2 };
assert.equal(ap.getReadiness(Object.values(ap.runtime.stats)).key,'check');
assert.equal(ap.getReadiness(Object.values(ap.runtime.stats)).missingKeys,0,'Unknown stock is not a deficit.');
ap.save(); assert.ok(!storage.get(ap.STORAGE_KEY).includes('ownedKeys'));
const changes=[];
context.window.plugin.keys = { keys: {A:4,B:6,C:7}, addKey(delta,guid) { changes.push([delta,guid]); this.keys[guid]=(this.keys[guid]||0)+delta; } };
assert.equal(ap.getOwnedKeys('A'),4,'Keys is the only inventory source.');
assert.equal(ap.setOwnedKeys('A',2),true); assert.deepEqual(changes[0],[-2,'A']);
assert.equal(ap.setOwnedKeys('A',-1),false); assert.equal(ap.setOwnedKeys('A',1.5),false);
const portals=Object.values(ap.runtime.stats);
const hits=ap.parseKeyText('Rathaus\nx12\nBrunnen am Markt x5\nStadtpark\n120 m',portals);
assert.equal(hits.length,2); assert.equal(hits[0].count,12); assert.equal(hits[1].count,5);
assert.equal(ap.parseKeyText('Rathaus\nx12',[...portals,{guid:'D',title:'Rathaus'}]).length,0,'Duplicate names remain ambiguous.');
assert.equal(ap.parseKeyText('Brunnen am...\n×3',portals)[0].count,3);
assert.equal(ap.parseKeyText('Unrelated\nx8',portals).length,0);
assert.equal(ap.parseKeyText('Rathaus\nUnrelated portal\nx8',portals).length,0,'Never borrow a count across another name.');
const cards = ap.parseKeyText('3Rathaus\nAlte Straße, 12345 Beispielstadt..\n8,6km ZU x7\n6 Brunnen am...\nAm Markt 4, 12345 Beispielstadt\n6,0 km x6\nStadtpark\nAm Park 10, 12345..\n9,3km ZN x10',portals);
assert.deepEqual(Array.from(cards,c=>c.count),[7,6,10],'Level badges, address rows and distance/icon prefixes belong to one inventory card.');
assert.equal(ap.parseKeyText('Rathaus\nBrunnen am...\nAm Markt, 12345 Stadt\nx6',portals)[0].guid,'B','Stop before the next recognized truncated title.');
assert.equal(ap.parseKeyText('6Rathaus\nx7',[...portals,{guid:'D',title:'6Rathaus'}]).length,0,'A real digit-prefixed name and a level badge must not be silently confused.');
const colors=new Uint8ClampedArray([255,255,255,255,120,120,120,255,50,140,240,255,0,0,0,255]);
assert.deepEqual(Array.from(ap.maskKeyPixels(colors,180)).filter((v,i)=>i%4===0),[0,255,255,255]);
assert.deepEqual(Array.from(ap.maskKeyPixels(colors,100)).filter((v,i)=>i%4===0),[0,0,255,255]);
let rows=ap.mergeKeyObservations([...hits,{guid:'A',count:13,evidence:'other frame'}],portals);
assert.equal(rows[0].selected,false); assert.equal(rows[0].conflict,true);
assert.equal(rows[2].count,null); assert.equal(rows[2].selected,false);
const signature=ap.keyImportSignature();
assert.equal(ap.applyKeyImport(rows,signature),1); assert.equal(ap.getOwnedKeys('A'),2); assert.equal(ap.getOwnedKeys('B'),5); assert.equal(ap.getOwnedKeys('C'),7);
rows[0].selected=true; rows[0].count=0;
assert.equal(ap.applyKeyImport(rows,signature),2); assert.equal(ap.getOwnedKeys('A'),0,'Explicit reviewed zero is supported.');
rows[0].count=1.1; assert.throws(()=>ap.applyKeyImport(rows,signature));
ap.runtime.stats.C.title='Changed'; assert.throws(()=>ap.applyKeyImport(rows,signature));
delete context.window.plugin.keys; assert.throws(()=>ap.applyKeyImport([],ap.keyImportSignature()));
// Decoder/worker lifecycle: cancellation and errors must release resources.
let revoked=0,terminated=0,drawn=0;
class Media extends EventTarget { set src(value) { queueMicrotask(()=>this.dispatchEvent(new Event('load'))); } naturalWidth=800; naturalHeight=1000; }
context.URL={createObjectURL:()=> 'blob:test',revokeObjectURL:()=>revoked++};
context.document.createElement=tag=>tag==='img'?new Media():{getContext:()=>({drawImage(){drawn++;}})};
const worker={recognize:async()=>({data:{text:'Rathaus\nx8'}}),terminate:async()=>{terminated++;}};
ap.loadKeyOcr=async()=>({createWorker:async()=>worker});
rows=await ap.scanKeyFiles([{type:'image/png',size:100}],portals,'eng',new AbortController(),()=>{});
assert.equal(rows[0].count,8); assert.equal(revoked,1); assert.equal(terminated,1); assert.equal(drawn,1);
const job=new AbortController(); worker.recognize=async()=>{job.abort();return {data:{text:'Rathaus\nx99'}};};
await assert.rejects(ap.scanKeyFiles([{type:'image/png',size:100}],portals,'eng',job,()=>{}));
assert.equal(revoked,2); assert.equal(terminated,2);
await assert.rejects(ap.scanKeyFiles([{type:'image/png',size:151*1024*1024}],portals,'eng',new AbortController(),()=>{}));
assert.equal(terminated,3);
class Video extends EventTarget {
  duration=2; videoWidth=800; videoHeight=1000;
  set src(value) { queueMicrotask(()=>this.dispatchEvent(new Event('loadeddata'))); }
  set currentTime(value) { queueMicrotask(()=>this.dispatchEvent(new Event('seeked'))); }
  pause() {} removeAttribute() {} load() {}
}
context.document.createElement=tag=>tag==='video'?new Video():{getContext:()=>({drawImage(){drawn++;}})};
worker.recognize=async()=>({data:{text:'Rathaus\nx9'}});
rows=await ap.scanKeyFiles([{type:'video/webm',size:100}],portals,'eng',new AbortController(),()=>{});
assert.equal(rows[0].count,9); assert.equal(terminated,4); assert.equal(revoked,3); assert.equal(drawn,4);
const hooks={}; let updates=0;
context.window.addHook=(name,fn)=>hooks[name]=fn; ap.refreshKeys=()=>updates++;
ap.setupKeysIntegration(); hooks.pluginKeysUpdateKey(); hooks.pluginKeysRefreshAll();
await new Promise(resolve=>setTimeout(resolve,150)); assert.equal(updates,1,'Keys changes are coalesced.');
context.window.plugin.keys={keys:{A:12},addKey(){}};
context.confirm=()=>true; ap.renderPanel=()=>{}; ap.renderOverlays=()=>{};
ap.clearData(); assert.equal(context.window.plugin.keys.keys.A,12,'Plan reset preserves Keys inventory.');
console.log('Keys/import checks passed: sole source, unknown stock, delta API, reviewed selections, zero, ambiguity, conflicts, stale plans, image decoding and cancellation cleanup.');
