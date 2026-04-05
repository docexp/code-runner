// Local semantic-release plugin: resolves workspace: dependency specifiers
// to the actual release version in all publishable package.json files.
// This runs during the prepare phase, after all @semantic-release/npm
// prepare steps have bumped individual versions.
import { readFileSync, writeFileSync } from 'fs';

const PUBLISHABLE_PACKAGES = [
  'packages/runners/js',
  'packages/runners/python',
  'packages/runners/go',
  'packages/runners/rust',
  'packages/runners/java',
  'packages/adapters/react',
];

export async function prepare(_, context) {
  const {
    nextRelease: { version },
    logger,
  } = context;

  for (const pkg of PUBLISHABLE_PACKAGES) {
    const pkgPath = `${pkg}/package.json`;
    const json = JSON.parse(readFileSync(pkgPath, 'utf8'));
    let changed = false;

    for (const section of ['dependencies', 'peerDependencies', 'devDependencies']) {
      if (json[section]) {
        for (const dep of Object.keys(json[section])) {
          if (json[section][dep].startsWith('workspace:')) {
            json[section][dep] = version;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      writeFileSync(pkgPath, JSON.stringify(json, null, 2) + '\n');
      logger.log(`Resolved workspace deps in ${pkgPath} → ${version}`);
    }
  }
}
