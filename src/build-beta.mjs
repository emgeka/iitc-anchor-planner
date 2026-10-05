import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'src/iitc-anchor-planner.user.js'), 'utf8');
const version = source.match(/^\/\/ @version\s+(\S+)$/m)?.[1];
assert.equal(version, source.match(/ap\.VERSION\s*=\s*'([^']+)'/)?.[1], 'Version mismatch.');
if (!/^\d+\.\d+\.\d+-beta\.\d+$/.test(version)) {
  if (process.argv.includes('--check')) { console.log('Stable source: no beta build to check.'); process.exit(0); }
  throw new Error('Beta builds require an explicit X.Y.Z-beta.N source version.');
}
const url = 'https://raw.githubusercontent.com/emgeka/iitc-anchor-planner/beta/beta-builds/iitc-anchor-planner-beta.user.js';
const beta = source
  .replace(/^\/\/ @name\s+.+$/m, '// @name           IITC plugin: Anchor Planner Beta')
  .replace(/^\/\/ @updateURL\s+.+$/m, '// @updateURL      ' + url)
  .replace(/^\/\/ @downloadURL\s+.+$/m, '// @downloadURL    ' + url);
assert.match(beta, /@name\s+IITC plugin: Anchor Planner Beta/);
for (const key of ['updateURL', 'downloadURL']) assert.equal(beta.match(new RegExp(`^// @${key}\\s+(\\S+)$`, 'm'))?.[1], url);
const output = path.join(root, 'beta-builds');
if (!process.argv.includes('--check')) fs.mkdirSync(output, { recursive: true });
for (const name of ['iitc-anchor-planner-beta.user.js', 'iitc-anchor-planner-beta.txt']) {
  const file = path.join(output, name);
  if (process.argv.includes('--check')) assert.equal(fs.readFileSync(file, 'utf8'), beta, `${name} is stale.`);
  else fs.writeFileSync(file, beta);
}
console.log(`Beta ${process.argv.includes('--check') ? 'build verified' : 'build generated'}: ${version}; separate beta update channel.`);
