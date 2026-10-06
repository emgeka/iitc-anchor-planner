import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('./iitc-anchor-planner.user.js',import.meta.url),'utf8');
const wrapper=source.slice(source.indexOf('function wrapper(plugin_info) {'),source.lastIndexOf('var script = document.createElement'));
function runtime(storage=new Map(),inventory={A:4,B:5,C:3}){
  const writes=[];
  const context={console,setTimeout,clearTimeout,navigator:{},document:{getElementById:()=>null},
    window:{bootPlugins:[],portals:{}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}};
  vm.runInNewContext(wrapper+'\nwrapper({});',context);
  const ap=context.window.plugin.anchorPlanner;
  context.window.plugin.keys={keys:inventory,addKey(delta,guid){writes.push([guid,delta]); this.keys[guid]=(this.keys[guid]||0)+delta;}};
  ap.state.language='en'; ap.renderPanel=()=>{}; ap.renderOverlays=()=>{}; ap.refreshTaskList=()=>{}; ap.queueMissingNameRefresh=()=>{};
  ap.runtime.stats={A:{guid:'A',title:'Rathaus'},B:{guid:'B',title:'Brunnen'},C:{guid:'C',title:'Park'}};
  const ab={id:ap.normalizedLinkId('A','B'),a:'A',b:'B',titleA:'Rathaus',titleB:'Brunnen',existing:false,existingGuid:'',blockers:[]};
  ap.runtime.links=[ab]; ap.state.linkDirections[ab.id]='A';
  return {ap,context,storage,writes,ab};
}
{
  const {ap,writes,ab}=runtime();
  ab.existing=true; ab.existingGuid='old'; ap.updateKeyConsumption();
  assert.equal(writes.length,0,'First-scan existing links establish a baseline.');
  ab.existing=false; ap.updateKeyConsumption(); ab.existing=true; ap.updateKeyConsumption();
  assert.equal(writes.length,0,'Coverage gaps cannot charge a previously seen Intel identity.');
}
{
  const {ap,context,storage,writes,ab}=runtime();
  ap.updateKeyConsumption(); ab.existing=true; ab.existingGuid='new'; ap.updateKeyConsumption(); ap.recalculateDirectedKeys();
  assert.deepEqual(writes,[['B',-1]]); assert.equal(ap.getOwnedKeys('A'),4); assert.equal(ap.getOwnedKeys('B'),4);
  assert.equal(ap.runtime.stats.B.requiredKeys,0); assert.ok(ap.keyUsageMessage(ab).includes('1 key deducted at Brunnen'));
  ap.updateKeyConsumption(); assert.equal(writes.length,1);
  const second=runtime(storage,context.window.plugin.keys.keys); second.ab.existing=true; second.ab.existingGuid='new'; second.ap.updateKeyConsumption();
  assert.equal(second.writes.length,0,'Reload cannot charge the same link twice.');
  ap.applyKeyBatch([{guid:'B',count:12}],'import'); const backup=ap.readKeyUndo();
  ap.updateKeyConsumption(); assert.equal(ap.getOwnedKeys('B'),12,'A later inventory import is authoritative.');
  ab.existing=false; ap.updateKeyConsumption(); ab.existing=true; ab.existingGuid='rebuilt'; ap.updateKeyConsumption();
  assert.equal(ap.getOwnedKeys('B'),11,'New Intel identity after an open observation consumes another key.');
  assert.equal(ap.readKeyUndo().id,backup.id,'Consumption preserves import/reset undo.');
  assert.equal(ap.keyUndoRows(backup)[0].conflict,true,'Undo detects consumption after import.');
  context.confirm=()=>true; ap.clearData(); ap.runtime.links=[ab]; ap.updateKeyConsumption();
  assert.equal(ap.getOwnedKeys('B'),11,'Plan reset preserves debit identities.');
}
{
  const {ap,writes,ab}=runtime(); ap.state.linkDirections[ab.id]='B';
  ap.updateKeyConsumption(); ab.existing=true; ab.existingGuid='reverse'; ap.updateKeyConsumption();
  assert.deepEqual(writes,[['A',-1]],'Reverse direction consumes the key at A.');
}
for(const reason of ['direction','missingPlugin','zero','invalid','missingIdentity']){
  const {ap,context,writes,ab}=runtime(); ap.updateKeyConsumption();
  if(reason==='direction')delete ap.state.linkDirections[ab.id];
  if(reason==='missingPlugin')delete context.window.plugin.keys;
  if(reason==='zero')context.window.plugin.keys.keys.B=0;
  if(reason==='invalid')context.window.plugin.keys.keys.B=NaN;
  ab.existing=true; ab.existingGuid=reason==='missingIdentity'?'':'new'; ap.updateKeyConsumption();
  assert.equal(writes.length,0,reason); assert.ok(ap.keyUsageMessage(ab).includes('Check key inventory'));
  context.window.plugin.keys={keys:{B:8},addKey(){throw new Error('Must not retry');}}; ap.state.linkDirections[ab.id]='A';
  ap.updateKeyConsumption(); assert.equal(ap.getOwnedKeys('B'),8,'Fixes/imports never trigger delayed automatic consumption.');
  ap.markKeyUsageReviewed(ab.id); assert.equal(ap.keyUsageMessage(ab),'');
}
{
  const {ap,context,writes,ab}=runtime(); ap.updateKeyConsumption();
  context.localStorage.setItem=()=>{throw new Error('quota');};
  ab.existing=true; ab.existingGuid='new'; ap.updateKeyConsumption();
  assert.equal(writes.length,0,'No Keys mutation before durable event recording.'); assert.ok(ap.runtime.keyUsageError);
}
{
  const {ap,context,storage,writes,ab}=runtime(); ap.updateKeyConsumption();
  const original=context.window.plugin.keys.addKey;
  context.window.plugin.keys.addKey=function(delta,guid){original.call(this,delta,guid);throw new Error('after mutation');};
  ab.existing=true; ab.existingGuid='new'; ap.updateKeyConsumption(); assert.equal(ap.getOwnedKeys('B'),4);
  assert.ok(ap.keyUsageMessage(ab).includes('Check key inventory'));
  const second=runtime(storage,context.window.plugin.keys.keys); second.ab.existing=true; second.ab.existingGuid='new'; second.ap.updateKeyConsumption();
  assert.equal(second.writes.length,0); assert.equal(writes.length,1,'Failed/partial writes must not be retried after reload.');
}
{
  const {ap,context,storage,ab}=runtime(); ap.updateKeyConsumption();
  const original=context.localStorage.setItem; let calls=0;
  context.localStorage.setItem=(k,v)=>{if(++calls===2)throw new Error('final journal failure');original(k,v);};
  ab.existing=true; ab.existingGuid='new'; ap.updateKeyConsumption(); assert.equal(ap.getOwnedKeys('B'),4);
  const second=runtime(storage,context.window.plugin.keys.keys); second.ab.existing=true; second.ab.existingGuid='new'; second.ap.updateKeyConsumption();
  assert.equal(second.writes.length,0); assert.ok(second.ap.keyUsageMessage(second.ab).includes('Check key inventory'),'Persisted attempt requires review after interruption.');
}
{
  const {ap,storage,writes,ab}=runtime(); storage.set(ap.STORAGE_KEY+'.keyUsage','{"links":{"bad":{"open":"yes"}}}');
  ab.existing=true; ab.existingGuid='new'; ap.updateKeyConsumption();
  assert.equal(writes.length,0); assert.ok(ap.runtime.keyUsageError,'Corrupt journals cannot silently re-enable debits.');
}
{
  const {ap,writes,ab}=runtime(); ap.updateKeyConsumption();
  ap.findBlockersForPlannedLink=()=>[];
  const observed={guid:'coverage-link',a:'A',b:'B'};
  ap.applyExistingLinkCoverage({map:{[ab.id]:observed},list:[observed],count:1,unresolved:0});
  assert.deepEqual(writes,[['B',-1]],'Final coverage updates also record consumption.');
  ap.applyExistingLinkCoverage({map:{[ab.id]:observed},list:[observed],count:1,unresolved:0}); assert.equal(writes.length,1);
}
{
  const {ap,writes,ab}=runtime(); ap.updateKeyConsumption(); ap.findBlockersForPlannedLink=()=>[];
  const observed={guid:'map-link',a:'A',b:'B'};
  ap.collectExistingLinkIds=()=>({map:{[ab.id]:observed},list:[observed],count:1,unresolved:0});
  assert.equal(ap.observeNewPlanLinks(),true); assert.equal(ab.existing,true); assert.deepEqual(writes,[['B',-1]]);
  ap.collectExistingLinkIds=()=>({map:{},list:[],count:0,unresolved:0});
  assert.equal(ap.observeNewPlanLinks(),false); assert.equal(ab.existing,true,'Unloaded Intel does not reopen a known link during passive map refresh.');
}
{
  const {ap,writes,ab}=runtime(); const cb={id:ap.normalizedLinkId('C','B'),a:'C',b:'B',existing:false,existingGuid:''};
  ap.runtime.links.push(cb); ap.state.linkDirections[cb.id]='C'; ap.updateKeyConsumption();
  ab.existing=true; ab.existingGuid='one'; cb.existing=true; cb.existingGuid='two'; ap.updateKeyConsumption();
  assert.deepEqual(writes,[['B',-1],['B',-1]]); assert.equal(ap.getOwnedKeys('B'),3,'Shared targets accumulate one key per newly observed link.');
}
console.log('Automatic key consumption checks passed: first-scan baseline, target/reverse directions, durable deduplication, rebuilds, import/undo interaction, skipped/failed writes, review, reload, coverage and live map observations.');
