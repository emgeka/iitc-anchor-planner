import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceDir = path.dirname(fileURLToPath(import.meta.url));
const localeDir = path.join(sourceDir, 'locales');
const targetFile = path.join(sourceDir, 'iitc-anchor-planner.user.js');
const fallbackLanguage = 'en';
const checkOnly = process.argv.includes('--check');

function placeholders(value) {
  return [...String(value).matchAll(/\{([A-Za-z0-9_]+)\}/g)]
    .map((match) => match[1])
    .sort();
}

const localeFiles = fs.readdirSync(localeDir)
  .filter((name) => /^[a-z]{2}(?:-[A-Z]{2})?\.json$/.test(name))
  .sort();

if (!localeFiles.length) throw new Error('No locale files found.');

const locales = {};
for (const filename of localeFiles) {
  const language = filename.replace(/\.json$/, '');
  const values = JSON.parse(fs.readFileSync(path.join(localeDir, filename), 'utf8'));
  if (!values || Array.isArray(values) || typeof values !== 'object') {
    throw new Error(`${filename} must contain one JSON object.`);
  }
  for (const [key, value] of Object.entries(values)) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`${filename}: ${key} must be a non-empty string.`);
    }
  }
  locales[language] = values;
}

if (!locales[fallbackLanguage]) throw new Error(`Fallback locale ${fallbackLanguage}.json is missing.`);

const fallbackKeys = Object.keys(locales[fallbackLanguage]).sort();
for (const [language, values] of Object.entries(locales)) {
  const keys = Object.keys(values).sort();
  const missing = fallbackKeys.filter((key) => !Object.hasOwn(values, key));
  const extra = keys.filter((key) => !Object.hasOwn(locales[fallbackLanguage], key));
  if (missing.length || extra.length) {
    throw new Error(`${language}: locale keys differ (missing: ${missing.join(', ') || '-'}; extra: ${extra.join(', ') || '-'}).`);
  }
  for (const key of fallbackKeys) {
    const expected = placeholders(locales[fallbackLanguage][key]);
    const actual = placeholders(values[key]);
    if (expected.join('|') !== actual.join('|')) {
      throw new Error(`${language}: placeholders differ for ${key} (expected: ${expected.join(', ') || '-'}; actual: ${actual.join(', ') || '-'}).`);
    }
  }
}

const source = fs.readFileSync(targetFile, 'utf8');
const newline = source.includes('\r\n') ? '\r\n' : '\n';
const json = JSON.stringify(locales, null, 2).replace(/\n/g, `${newline}  `);
const block = `  // AP_LOCALES_START${newline}  ap.LOCALES = ${json};${newline}  // AP_LOCALES_END`;
const blockPattern = /  \/\/ AP_LOCALES_START[\s\S]*?  \/\/ AP_LOCALES_END/;

if (!blockPattern.test(source)) throw new Error('Locale bundle markers are missing from the userscript.');

const runtimeSource = source.replace(blockPattern, '');
const translationPrefixes = new Set(fallbackKeys.map((key) => key.split('.')[0]));
const referencedKeys = new Set(
  [...runtimeSource.matchAll(/['"]([a-z][A-Za-z0-9]*\.[A-Za-z0-9.]+)['"]/g)]
    .map((match) => match[1])
    .filter((key) => translationPrefixes.has(key.split('.')[0]))
);
const missingReferences = [...referencedKeys].filter((key) => {
  return !Object.hasOwn(locales[fallbackLanguage], key) &&
    !(Object.hasOwn(locales[fallbackLanguage], `${key}.one`) && Object.hasOwn(locales[fallbackLanguage], `${key}.other`));
});
if (missingReferences.length) {
  throw new Error(`Translation keys referenced by the userscript are missing: ${missingReferences.join(', ')}.`);
}
const unusedKeys = fallbackKeys.filter((key) => {
  if (referencedKeys.has(key)) return false;
  return !((key.endsWith('.one') || key.endsWith('.other')) && referencedKeys.has(key.replace(/\.(?:one|other)$/, '')));
});
if (unusedKeys.length) throw new Error(`Unused translation keys: ${unusedKeys.join(', ')}.`);

const bundledSource = source.replace(blockPattern, block);
if (checkOnly) {
  if (bundledSource !== source) throw new Error('Bundled locales are out of date. Run: node src/build-locales.mjs');
  console.log(`Locales valid and bundled: ${Object.keys(locales).join(', ')} (${fallbackKeys.length} keys)`);
} else {
  if (bundledSource !== source) fs.writeFileSync(targetFile, bundledSource, 'utf8');
  console.log(`Bundled locales: ${Object.keys(locales).join(', ')} (${fallbackKeys.length} keys)`);
}
