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
  assert.equal(actual.maxWidth, 340);
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
