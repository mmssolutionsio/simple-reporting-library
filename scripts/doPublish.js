import { execSync } from 'child_process';
import { preparePublish } from './preparePublish.js';
import { packageName } from './config.js';
import { getPackageVersion } from './utils.js';

function isVersionGreater(v1, v2) {
  const a = v1.split('.').map(Number);
  const b = v2.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return false;
}

export async function doPublish(version = null) {
  try {
    const publishVersion = await preparePublish(version);

    await execSync(`npm publish`, { stdio: 'inherit' });

    /*
    const tag = `v${publishVersion.split('.')[0]}-lts`;

    await execSync(`npm publish --tag ${tag}`, { stdio: 'inherit' });

    const latest = await getPackageVersion(packageName);

    if (isVersionGreater(publishVersion, latest)) {
      await execSync(
        `npm dist-tag add ${packageName}@${publishVersion} latest`,
        {
          stdio: 'inherit',
        },
      );
    }

     */

    console.log(
      `Package ${packageName}@${publishVersion} published successfully!`,
    );
  } catch (error) {
    console.error('Error during publishing:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    let version = null;
    const indexVersion = process.argv.indexOf('-v');
    if (indexVersion !== -1) {
      if (!process.argv[indexVersion + 1]) {
        throw new Error('Version argument is missing after -v');
      }

      const newVersion = process.argv[indexVersion + 1];
      if (/^\d+\.\d+\.\d+$/.test(newVersion)) {
        version = newVersion;
      } else {
        throw new Error(
          `Invalid version format ${newVersion}. Use $number.$number.$number`,
        );
      }
    }
    doPublish(version);
  } catch (error) {
    console.error(error);
  }
}
