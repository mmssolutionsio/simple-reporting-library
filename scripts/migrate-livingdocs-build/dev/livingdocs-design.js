import fs from 'fs';
import lib from './lib.js';
import logger from './logger.js';
import * as cheerio from 'cheerio';

class LivingdocsDesign {
  static loadDesign(configuration) {
    logger.debug('loading design ' + configuration.build.design);
    if (!lib.bFileExists(configuration.build.design)) {
      throw {
        message: 'design not found at ' + configuration.build.design,
      };
    }

    try {
      const designJSON = JSON.parse(
        fs.readFileSync(configuration.build.design, {
          encoding: 'utf8',
          flag: 'r',
        }),
      );

      return designJSON;
    } catch (error) {
      throw {
        message: 'design could not be loaded at ' + configuration.build.design,
        error: error,
      };
    }
  }

  static loadComponents(configuration) {
    logger.debug('loading components ' + configuration.build.components);
    const componentPaths = lib.getAllComponentPaths(
      configuration.build.components,
    );
    const components = [];

    for (let index = 0; index < componentPaths.length; index++) {
      const path = componentPaths[index];

      const raw = fs.readFileSync(path);

      const htmlObj = cheerio.load(raw.toString());
      let configurationData = null;

      // check component configuration for syntax errors
      try {
        configurationData = JSON.parse(
          htmlObj(configuration.configurationSelector).html(),
        );
      } catch (error) {
        throw {
          message: `JSON error in component ${path}`,
        };
      }

      htmlObj(configuration.configurationSelector).remove();

      const children = htmlObj('body > *:not(script)');

      // check html for children count
      if (children.length === 1) {
        components.push({
          path: path,
          configurationData: configurationData,
          html: htmlObj.html(children[0]),
        });
      } else {
        throw {
          message: `template ${path} contains ${children.length} root elements. Components only work with one root element.`,
        };
      }
    }

    return components;
  }
}

export default LivingdocsDesign;
