#! /usr/bin/env node
import LivingdocsDesign from '../dev/livingdocs-design.js';
import configuration from '../dev/configuration.js';
import logger from '../dev/logger.js';
import Build from '../dev/build.js';

/**
 * Builds the Livingdocs design and components based on the configuration.
 *
 * @returns {boolean} - Indicates whether the build was successful or not.
 */
async function build() {
  try {
    const designData = LivingdocsDesign.loadDesign(configuration);
    const componentData = LivingdocsDesign.loadComponents(configuration);

    if (!designData) {
      throw {
        message: 'design is empty',
      };
    }

    if (!componentData) {
      throw {
        message: 'no components found',
      };
    }

    if (!!designData && designData['v'] === 2) {
      logger.info(`Building ${designData.name} on V2`);
      Build.BuildV2(designData, componentData);
    } else {
      logger.info(`Building ${designData.name} on V1`);
      Build.BuildV1(designData, componentData);
    }

    Build.zipArchive();
  } catch (error) {
    if (error.message) {
      logger.error(error.message);
    }

    // show js errors
    if (error.error) {
      logger.error(error.error);
    }
  }

  return true;
}

export default build;
export { build };
