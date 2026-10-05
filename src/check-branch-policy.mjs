import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}
const branch = argument('--branch');
const stableRef = argument('--stable-ref') || 'origin/main';
assert.ok(branch && /^(main|beta|(?:feature|hotfix|maintenance)\/[a-z0-9][a-z0-9/-]*|release\/\d+\.\d+\.\d+)$/.test(branch),
  'Specify --branch main, beta, feature/<topic>, hotfix/<topic>, maintenance/<topic>, or release/<version>.');
assert.ok(!stableRef.startsWith('-'), 'Stable reference must not be an option.');

const source = fs.readFileSync(path.join(root, 'src/iitc-anchor-planner.user.js'));
const text = source.toString('utf8');
const version = text.match(/^\/\/ @version\s+(\S+)$/m)?.[1];
const runtimeVersion = text.match(/ap\.VERSION\s*=\s*'([^']+)'/)?.[1];
assert.ok(version, 'Userscript version is missing.');
assert.equal(version, runtimeVersion, 'Userscript and runtime versions differ.');
const stableUrl = 'https://raw.githubusercontent.com/emgeka/iitc-anchor-planner/main/releases/iitc-anchor-planner.user.js';
for (const key of ['updateURL', 'downloadURL']) {
  assert.equal(text.match(new RegExp(`^// @${key}\\s+(\\S+)$`, 'm'))?.[1], stableUrl,
    `Canonical source @${key} must keep the stable URL; beta distribution needs a separate build.`);
}

if (branch === 'main' || branch.startsWith('release/')) {
  if (branch.startsWith('release/')) assert.equal(branch.slice('release/'.length), version,
    'Release branch must match the plugin version.');
  for (const file of [
    `releases/iitc-anchor-planner-v${version}.user.js`,
    `releases/iitc-anchor-planner-v${version}.txt`,
    'releases/iitc-anchor-planner.user.js',
    'releases/iitc-anchor-planner.txt'
  ]) {
    assert.ok(source.equals(fs.readFileSync(path.join(root, file))),
      `Stable source and ${file} must be byte-identical.`);
  }
} else {
  execFileSync('git', ['rev-parse', '--verify', `${stableRef}^{commit}`], { cwd: root, stdio: 'pipe' });
  execFileSync('git', ['diff', '--exit-code', stableRef, '--', 'releases/'], { cwd: root, stdio: 'inherit' });
  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'releases/'],
    { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(untracked, '', 'Development branches must not add untracked release files.');
}
console.log(`Branch policy passed for ${branch}; plugin version ${version}.`);
