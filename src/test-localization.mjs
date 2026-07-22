import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const userscriptPath = path.join(sourceDir, 'iitc-anchor-planner.user.js');
const userscript = fs.readFileSync(userscriptPath, 'utf8');
const wrapperStart = userscript.indexOf('function wrapper(plugin_info) {');
const wrapperEnd = userscript.indexOf('var script = document.createElement', wrapperStart);

assert.notEqual(wrapperStart, -1, 'Userscript wrapper start is missing.');
assert.notEqual(wrapperEnd, -1, 'Userscript wrapper end is missing.');

const wrapperSource = userscript.slice(wrapperStart, wrapperEnd);

function createRuntime({ languages = [], language = '', pageLanguage = '', savedState = null } = {}) {
  const stored = new Map();
  if (savedState) stored.set('plugin-anchor-planner-v1', JSON.stringify(savedState));

  const context = {
    console,
    document: { documentElement: { lang: pageLanguage } },
    localStorage: {
      getItem(key) { return stored.has(key) ? stored.get(key) : null; },
      setItem(key, value) { stored.set(key, String(value)); }
    },
    navigator: { languages, language },
    window: { bootPlugins: [], portals: {} }
  };
  vm.runInNewContext(`${wrapperSource}\nwrapper({});`, context, { filename: userscriptPath });
  return { ap: context.window.plugin.anchorPlanner, stored };
}

{
  const { ap } = createRuntime({ languages: ['de-DE'], language: 'de-DE' });
  assert.equal(ap.getLanguage(), 'de');
  assert.equal(ap.t('action.scan'), 'Scannen');
  assert.equal(ap.tp('route.target', 1), '1 Ziel');
  assert.equal(ap.tp('route.target', 2), '2 Ziele');
}

{
  const { ap } = createRuntime({ languages: ['nl-NL'], language: 'nl-NL', pageLanguage: 'de' });
  assert.equal(ap.getLanguage(), 'de', 'Page language should be used after unsupported browser languages.');
}

{
  const { ap } = createRuntime({ languages: ['nl-NL'], language: 'nl-NL', pageLanguage: 'nl' });
  assert.equal(ap.getLanguage(), 'en', 'English should be the final fallback.');
  assert.equal(ap.t('action.scan'), 'Scan');
}

{
  const { ap } = createRuntime({ languages: ['nl-NL'], language: 'nl-NL' });
  ap.LOCALES.nl = { ...ap.LOCALES.en, 'language.name': 'Nederlands', 'action.scan': 'Scannen' };
  assert.equal(ap.getLanguage(), 'nl', 'A newly bundled base language should be detected without runtime changes.');
  assert.equal(ap.languageName('nl'), 'Nederlands');
  assert.equal(ap.t('action.scan'), 'Scannen');
  ap.state.language = 'nl';
  assert.match(ap.languageOptionsHtml(), /<option value="nl" selected>Nederlands<\/option>/, 'New locales must appear in the manual selector.');
  ap.state.language = 'NL';
  assert.equal(ap.getLanguage(), 'nl', 'Manual language codes should resolve case-insensitively.');
}

{
  const { ap } = createRuntime();
  assert.deepEqual(Object.keys(ap.LOCALES).sort(), ['de', 'en', 'es', 'fr', 'it', 'ja', 'pl', 'pt-BR', 'ru', 'zh-CN']);
  for (const language of Object.keys(ap.LOCALES)) {
    ap.state.language = language;
    assert.match(ap.languageOptionsHtml(), new RegExp(`<option value="${language}" selected>`));
  }
}

{
  const { ap, stored } = createRuntime({
    languages: ['de-DE'],
    savedState: { language: 'en', anchors: {}, endpointAssignments: {}, blockerRoutePortals: {} }
  });
  ap.load();
  assert.equal(ap.getLanguage(), 'en', 'A saved manual language must override automatic detection.');
  ap.save();
  assert.equal(JSON.parse(stored.get(ap.STORAGE_KEY)).language, 'en');
}

{
  const { ap } = createRuntime({ savedState: { language: 'xx' } });
  ap.load();
  assert.equal(ap.state.language, 'auto', 'Unsupported saved languages must migrate to automatic selection.');
}

{
  const { ap } = createRuntime();
  ap.state.language = 'en';
  assert.equal(ap.displayPortalTitle('Name nicht geladen'), 'Name not loaded');
  ap.state.language = 'de';
  assert.equal(ap.displayPortalTitle('Name not loaded'), 'Name nicht geladen');
}

{
  const { ap } = createRuntime();
  ap.runtime.stats = {
    portalA: {
      guid: 'portalA', title: 'Alpha', address: '', lat: 50, lng: 8,
      linkCount: 1, existingLinks: 0, blockedLinks: 0, openLinks: 1, requiredKeys: 1
    }
  };
  ap.state.lastScan = { plannedLinks: 1, existingPlannedLinks: 0, unconfirmedLinks: 1 };
  ap.state.language = 'en';
  const englishText = ap.buildPlanText();
  assert.match(englishText, /Plan: 1 link, 1 plan portal/);
  assert.match(englishText, /Existing links: 0 · unconfirmed: 1/);

  ap.state.language = 'de';
  const germanText = ap.buildPlanText();
  assert.match(germanText, /Plan: 1 Link, 1 Planportal/);
  assert.match(germanText, /Vorhandene Links: 0 · nicht bestätigt: 1/);

  const exported = ap.exportData();
  assert.deepEqual(Object.keys(exported), ['plugin', 'version', 'exportedAt', 'scan', 'blockedPlanLinks', 'anchors']);
  assert.deepEqual(Object.keys(exported.anchors[0]), [
    'guid', 'title', 'address', 'lat', 'lng', 'linkCount', 'existingLinks', 'blockedLinks',
    'openLinks', 'requiredKeys', 'ownedKeys', 'done', 'note', 'navigation'
  ]);
  assert.equal(Object.hasOwn(exported, 'language'), false, 'Language selection must not alter the JSON schema.');
}

console.log('Localization runtime checks passed: 10 locales, selector, detection, fallback, persistence, plurals, placeholders, text export, JSON schema');
