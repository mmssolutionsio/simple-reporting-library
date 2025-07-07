import { execSync } from 'child_process';
import { preparePublish } from './preparePublish.js';
import { packageName } from './config.js';
import { getPackageVersion } from './utils.js';

export async function doPublish() {
  try {
    const version = await preparePublish();
    await execSync(`prettier --write --list-different .`, { stdio: 'inherit' });

    const tag = `v${version.split('.')[0]}-lts`;

    await execSync(`npm publish --tag ${tag}`, { stdio: 'inherit' });

    const latest = await getPackageVersion(packageName);

    if (version > latest) {
      await execSync(`npm dist-tag add ${packageName}@${version} latest`, {
        stdio: 'inherit',
      });
    }

    console.log(`Package ${packageName}@${version} published successfully!`);
  } catch (error) {
    console.error('Error during publishing:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  doPublish();
}
