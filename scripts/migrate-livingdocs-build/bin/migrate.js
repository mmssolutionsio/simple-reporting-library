#! /usr/bin/env node

import configuration from '../dev/configuration.js';
import LivingdocsDesign from '../dev/livingdocs-design.js';
import logger from '../dev/logger.js';
import Migrate from '../dev/migrate.js';

console.log('migrate command here');

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

  const v2Design = Migrate.migrateDesign(designData);
  // logger.info(JSON.stringify(v2Design));
  const v2Components = Migrate.migrateComponents(componentData);

  Migrate.writeDesign(v2Design);
  Migrate.writeComponents(v2Components);

  Migrate.writeManualReviews();
} catch (error) {
  if (error.message) {
    logger.error(error.message);
  }

  // show js errors
  if (error.error) {
    logger.error(error.error);
  }
}
