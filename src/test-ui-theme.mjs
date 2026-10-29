import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./iitc-anchor-planner.user.js', import.meta.url), 'utf8');
const wrapper = source.slice(source.indexOf('function wrapper(plugin_info) {'), source.indexOf('var script = document.createElement'));
function runtime(width = 360) {
  const opened = [], returned = { dialog() {} };
  const context = { window: { innerWidth: width, bootPlugins: [], dialog(settings) { opened.push(settings); return returned; } },
    navigator: {}, document: { documentElement: {}, getElementById() { return null; } },
    localStorage: { getItem() { return null; }, setItem() { throw Error('Styling cannot persist state'); } },
    setTimeout() {}, clearTimeout() {}, console };
  vm.runInNewContext(wrapper + '\nwrapper({});', context);
  const ap = context.window.plugin.anchorPlanner;
  ap.state.language = 'en';
  return { ap, opened, context, returned };
}
{
  const { ap, opened, returned } = runtime();
  const callback = () => {}, buttons = { Custom: () => {} };
  const options = { id: 'example', title: 'Example', html: '<div id="preserved">Content</div>', width: 720,
    classes: { 'ui-dialog': 'existing', 'ui-dialog-titlebar': 'title-role' }, dialogClass: 'legacy existing',
    closeCallback: callback, buttons, modal: true, closeOnEscape: false };
  const before = JSON.stringify(options), state = JSON.stringify(ap.state);
  assert.equal(ap.openDialog(options), returned, 'Keep the original IITC handle and lifecycle');
  const actual = opened[0];
  assert.equal(actual.width, 340, 'All callers fit a narrow viewport');
  assert.equal(actual.maxWidth, undefined, 'Viewport limits the opening size, not later expansion');
  assert.equal(actual.resizable, true);
  assert.deepEqual(actual.classes['ui-dialog'].split(' ').sort(), ['ap-dialog', 'existing', 'legacy']);
  assert.equal(actual.dialogClass, actual.classes['ui-dialog'], 'Old and current IITC get the same widget scope');
  assert.equal(actual.classes['ui-dialog-titlebar'], 'title-role');
  assert.ok(actual.html.includes('<div id="preserved">Content</div>'));
  assert.ok(actual.html.startsWith('<div class="ap-ui ap-dialog-body">'));
  assert.equal(actual.closeCallback, callback);
  assert.equal(actual.buttons, buttons);
  assert.equal(actual.modal, true);
  assert.equal(actual.closeOnEscape, false);
  assert.equal(JSON.stringify(options), before, 'Do not mutate the caller options or nested classes');
  assert.equal(JSON.stringify(ap.state), state);
}
{
  const { ap, opened } = runtime(1280);
  const tokens = new Set(['original']), handler = () => 'unchanged';
  const element = { classList: { add(value) { tokens.add(value); } }, onclick: handler };
  ap.openDialog({ html: element, width: 720 });
  assert.equal(opened[0].html, element, 'Keep the exact node with file inputs and event handlers');
  assert.equal(opened[0].html.onclick, handler);
  assert.deepEqual([...tokens], ['original', 'ap-ui', 'ap-dialog-body']);
  assert.equal(opened[0].width, 720);
  const legacy = { className: 'original', onclick: handler };
  ap.openDialog({ html: legacy, maxWidth: 420 });
  assert.equal(legacy.className, 'original ap-ui ap-dialog-body');
  assert.equal(opened[1].width, 420);
  assert.equal(legacy.onclick, handler);
}
{
  const { ap, opened, context } = runtime();
  for (const width of [280, 360, 600, 1280]) {
    context.window.innerWidth = width;
    ap.openDialog({ html: 'Small', width: 720 });
    assert.ok(opened.at(-1).width <= width - 20);
  }
  delete context.window.innerWidth;
  ap.openDialog({ html: 'Unknown viewport', width: 720 });
  assert.equal(opened.at(-1).width, 600);
  const count = opened.length;
  delete context.window.dialog;
  assert.equal(ap.openDialog({ html: 'Unavailable' }), null);
  assert.equal(opened.length, count);
}
{
  const { ap, opened } = runtime();
  const state = JSON.stringify(ap.state);
  ap.showTaskList(); ap.showNextTask(); ap.showPluginSettings(); ap.showExport();
  assert.equal(opened.length, 4);
  for (const settings of opened) {
    assert.ok(settings.classes['ui-dialog'].split(' ').includes('ap-dialog'));
    assert.ok(settings.html.includes('ap-ui ap-dialog-body'));
    assert.ok(settings.width <= 340);
  }
  assert.ok(opened[0].html.includes('id="ap-task-list"'));
  assert.ok(opened[1].html.includes('id="ap-next-work"'));
  assert.ok(opened[2].html.includes('id="ap-global-language"'));
  assert.ok(opened[3].html.includes('data-pane="json" style="display:none"'), 'Preserve dynamic export visibility');
  assert.equal(ap.runtime.taskListOpen, true);
  opened[0].closeCallback(); assert.equal(ap.runtime.taskListOpen, false);
  opened[1].closeCallback(); assert.equal(ap.runtime.nextTaskOpen, false);
  assert.equal(JSON.stringify(ap.state), state);
}
console.log('Shared UI: scoped current/legacy IITC dialog integration, viewport widths, preserved nodes/options/callbacks, main dialog coverage and unchanged state passed.');

// Presentation preferences: safe defaults, persistence, escaping and field styles
// must not change plan geometry, directions, keys or manual completion.
{
  const {ap,context}=runtime(1280);
  assert.equal(ap.state.verboseHints,false);
  assert.equal(ap.state.planFieldFill,'normal');
  assert.ok(!ap.helpHtml('Example').includes(' open'));
  ap.state.verboseHints=true;assert.ok(ap.helpHtml('Example').includes(' open'));
  assert.ok(ap.helpHtml('<script>').includes('&lt;script&gt;'));
  context.window.PLAYER={team:'RESISTANCE'};
  context.window.portals={A:{options:{team:'ENLIGHTENED'}},B:{options:{team:'MACHINA'}},N:{options:{team:0}}};
  assert.match(ap.portalNameHtml('A','<img onerror=x>'),/ap-owner-enl/);
  assert.ok(!ap.portalNameHtml('A','<img onerror=x>').includes('<img'));
  assert.match(ap.portalNameHtml('B','B'),/ap-owner-mac/);
  assert.match(ap.portalNameHtml('N','N'),/ap-owner-neutral/);
  assert.match(ap.portalNameHtml('U','U'),/<sup/);
  assert.match(ap.factionBadgeHtml(),/ap-owner-res/);
  delete context.window.PLAYER;assert.match(ap.factionBadgeHtml(),/\?/);
  let stored=null;context.localStorage.setItem=(key,value)=>{stored=value};context.localStorage.getItem=()=>stored;
  const geometry=JSON.stringify(ap.runtime.links),anchors=JSON.stringify(ap.state.anchors);
  ap.state.planFieldFill='subtle';assert.equal(ap.planFillOpacity(.12),.04);assert.ok(Math.abs(ap.planFillOpacity(.2)-.2/3)<1e-10);
  ap.save();ap.state.verboseHints=false;ap.state.planFieldFill='normal';ap.load();
  assert.equal(ap.state.verboseHints,true);assert.equal(ap.state.planFieldFill,'subtle');
  assert.equal(JSON.stringify(ap.runtime.links),geometry);assert.equal(JSON.stringify(ap.state.anchors),anchors);
  ap.state.planFieldFill='off';assert.equal(ap.planFillOpacity(.12),0);assert.equal(ap.planFillOpacity(.2),0);
  stored=JSON.stringify({verboseHints:'yes',planFieldFill:'bad'});ap.load();assert.equal(ap.state.verboseHints,false);assert.equal(ap.state.planFieldFill,'normal');
}
console.log('Presentation preferences: persistence, independent owners, safe names, unknown indication and unchanged plan state passed.');

{
  const {ap,context}=runtime(1280);context.window.innerHeight=800;
  const events={},tokens=new Set(),captures=new Set();let grip=null,observerCallback,disconnected=0,removed=0,options={};
  context.window.ResizeObserver=class {constructor(fn){observerCallback=fn;}observe(){}disconnect(){disconnected++;}};
  context.window.addEventListener=()=>{};context.window.removeEventListener=()=>{removed++;};
  const root={style:{},classList:{add:c=>tokens.add(c),contains:c=>tokens.has(c)},querySelector:()=>grip,
    getBoundingClientRect(){const width=parseFloat(this.style.width)||540,height=parseFloat(this.style.height)||400,left=parseFloat(this.style.left)||100,top=parseFloat(this.style.top)||80;return {width,height,left,top,right:left+width,bottom:top+height};},
    ownerDocument:{createElement(){return {setAttribute(){},setPointerCapture:id=>captures.add(id),hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id)};}},appendChild:n=>{grip=n;}};
  const handle={on:(name,fn)=>{events[name]=fn;},dialog:(method,value)=>{if(method==='option')options=value;}};
  const before=JSON.stringify(ap.state);ap.wireDialogResize(handle,root);
  const event={button:0,pointerId:1,clientX:0,clientY:0,preventDefault(){},stopPropagation(){}};
  grip.onpointerdown(event);grip.onpointermove({...event,clientX:140,clientY:80});
  assert.equal(root.style.width,'680px');assert.equal(root.style.height,'480px');assert.equal(options.width,680);
  assert.ok(tokens.has('ap-user-sized'));assert.ok(captures.has(1));
  grip.onpointercancel(event);assert.equal(captures.size,0);grip.onpointermove({...event,clientX:900});assert.equal(root.style.width,'680px');
  grip.onkeydown({...event,key:'ArrowLeft'});assert.equal(root.style.width,'660px');
  grip.onkeydown({...event,key:'ArrowDown'});assert.equal(root.style.height,'500px');
  grip.onpointerdown(event);grip.onpointermove({...event,clientX:9000,clientY:9000});
  assert.equal(root.style.width,'1260px');assert.equal(root.style.height,'780px');
  assert.equal(root.style.left,'10px');assert.equal(root.style.top,'10px');
  root.style.height='auto';observerCallback();assert.equal(root.style.height,'780px','A widget size reset after expand restores the chosen size');assert.equal(JSON.stringify(ap.state),before,'Window resizing must not persist or alter plan/inventory state');
  events['dialogclose.ap-window']();assert.equal(disconnected,1);assert.equal(removed,1);
}
console.log('Window sizing: pointer drag/cancel, keyboard, viewport limits, widget size synchronization and observer cleanup passed.');
