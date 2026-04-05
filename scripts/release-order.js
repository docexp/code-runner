#!/usr/bin/env node
/**
 * Outputs publishable workspace packages in topological order
 * (dependencies before dependents) by reading package.json files.
 *
 * "Publishable" means the package.json has a "publishConfig" field.
 * Dependency edges are inferred from "workspace:*" entries in
 * "dependencies" and "peerDependencies".
 *
 * Usage:
 *   node scripts/release-order.js
 *
 * Output: one repo-relative package path per line, e.g.:
 *   packages/core
 *   packages/runners/js
 *   ...
 *   packages/adapters/react
 */

'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const rootPkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

// -------------------------------------------------------------------
// 1. Expand workspace glob patterns into absolute package paths
// -------------------------------------------------------------------
const workspaceGlobs = rootPkg.workspaces ?? [];

function expandGlob(pattern) {
  if (pattern.endsWith('/*')) {
    const dir = path.join(root, pattern.slice(0, -2));
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .map(name => path.join(dir, name))
      .filter(p => fs.existsSync(path.join(p, 'package.json')));
  }
  const p = path.join(root, pattern);
  return fs.existsSync(path.join(p, 'package.json')) ? [p] : [];
}

const allPkgPaths = workspaceGlobs.flatMap(expandGlob);

// -------------------------------------------------------------------
// 2. Build name → path map; only keep publishable packages
// -------------------------------------------------------------------
const nameToPath = {}; // "@cheetah-coder/core" → "/abs/packages/core"
const pathToMeta = {}; // "/abs/packages/core" → { workspaceDeps: [...names] }

for (const pkgPath of allPkgPaths) {
  const pkgJson = JSON.parse(
    fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf8')
  );
  if (!pkgJson.name || !pkgJson.publishConfig) continue; // skip non-publishable

  nameToPath[pkgJson.name] = pkgPath;

  const allDeps = { ...pkgJson.dependencies, ...pkgJson.peerDependencies };
  const workspaceDeps = Object.entries(allDeps)
    .filter(([, v]) => v === 'workspace:*')
    .map(([name]) => name);

  pathToMeta[pkgPath] = { workspaceDeps };
}

const publishable = Object.keys(pathToMeta);

// -------------------------------------------------------------------
// 3. Topological sort (Kahn's algorithm)
// -------------------------------------------------------------------
const inDegree = Object.fromEntries(publishable.map(p => [p, 0]));
const adjList  = Object.fromEntries(publishable.map(p => [p, []]));

for (const pkgPath of publishable) {
  for (const depName of pathToMeta[pkgPath].workspaceDeps) {
    const depPath = nameToPath[depName];
    if (!depPath || !pathToMeta[depPath]) continue; // external dep, skip
    adjList[depPath].push(pkgPath); // depPath must come before pkgPath
    inDegree[pkgPath]++;
  }
}

const queue  = publishable.filter(p => inDegree[p] === 0);
const sorted = [];

while (queue.length > 0) {
  const p = queue.shift();
  sorted.push(p);
  for (const dependent of adjList[p]) {
    if (--inDegree[dependent] === 0) queue.push(dependent);
  }
}

if (sorted.length !== publishable.length) {
  process.stderr.write('ERROR: Circular dependency detected in workspace packages\n');
  process.exit(1);
}

// -------------------------------------------------------------------
// 4. Print repo-relative paths, one per line
// -------------------------------------------------------------------
for (const p of sorted) {
  process.stdout.write(path.relative(root, p) + '\n');
}
