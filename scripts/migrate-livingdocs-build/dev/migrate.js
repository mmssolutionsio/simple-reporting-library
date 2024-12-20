import configuration from './configuration.js';
import lib from './lib.js';
import logger from './logger.js';
import fs from 'fs';

const migrationManualReviews = [];

class Migrate {
  static migrateDesign(oldDesignData) {
    let newDesignData = {
      v: 2,
      name: '',
      version: '',
      designSettings: {
        componentProperties: [],
        defaultComponents: {},
        prefilledComponents: {},
        componentGroups: [],
        fieldExtractor: {},
      },
    };

    // mapping
    newDesignData.name = oldDesignData.name;
    newDesignData.version = oldDesignData.version;

    newDesignData.designSettings.assets = oldDesignData.assets;
    newDesignData.designSettings.componentProperties =
      this.migrateComponentProperties(oldDesignData.componentProperties);
    newDesignData.designSettings.defaultComponents =
      oldDesignData.defaultComponents;
    newDesignData.designSettings.prefilledComponents =
      oldDesignData.prefilledComponents;
    newDesignData.designSettings.componentGroups = oldDesignData.groups;
    newDesignData.designSettings.fieldExtractor = oldDesignData.metadata;
    newDesignData.designSettings.defaultComponents =
      oldDesignData.defaultComponents;

    // delete removed properties
    delete oldDesignData.label;
    delete oldDesignData.license;
    delete oldDesignData.description;
    delete oldDesignData.author;
    delete oldDesignData.imageRatios;
    delete oldDesignData.defaultLayout;

    // delete already moved properties
    delete oldDesignData.name;
    delete oldDesignData.version;
    delete oldDesignData.assets;
    delete oldDesignData.componentProperties;
    delete oldDesignData.defaultComponents;
    delete oldDesignData.prefilledComponents;
    delete oldDesignData.groups;
    delete oldDesignData.metadata;
    delete oldDesignData.defaultComponents;
    delete oldDesignData.defaultContent;

    return newDesignData;
  }

  static migrateComponentProperties(oldProperties) {
    const newProperties = [];

    Object.keys(oldProperties).forEach((key) => {
      newProperties.push({
        name: key,
        ...oldProperties[key],
      });
    });

    return newProperties;
  }

  static migrateComponents(components) {
    components.map((component) => {
      const oldData = component.configurationData;
      // clean copy the old Data
      const newData = JSON.parse(JSON.stringify(oldData));

      if (!!newData.directives) {
        const directiveKeys = Object.keys(newData.directives);

        let newDirectives = [];
        if (directiveKeys) {
          // remap directive object
          directiveKeys.forEach((directiveKey) => {
            const oldDirective = oldData.directives[directiveKey];

            let newDirective = {
              name: directiveKey,
              ...oldDirective,
            };

            if (!newDirective.type) {
              newDirective.type = this.getDirectiveType(
                oldDirective,
                component.path,
                directiveKey,
              );
            }

            if (newDirective.imageRatios) {
              newDirective.imageRatios.forEach((imageRatio) => {
                const regex = new RegExp(/[\d]{1,}\:[\d]{1,}/gm);
                const regexResult = regex.test(imageRatio.trim());
                if (!regexResult) {
                  migrationManualReviews.push({
                    path: component.path,
                    directive: 'imageRatio:  ' + imageRatio + '  ',
                  });
                }
              });

              if (newDirective.allowOriginalRatio) {
                newDirective.recommendedRatios = newDirective.imageRatios;
                delete newDirective.imageRatios;
              }

              delete newDirective.allowOriginalRatio;
            }

            newDirectives.push(newDirective);
          });
        }

        newData.directives = newDirectives;
      }

      component.configurationData = newData;

      return component;
    });

    return components;
  }

  static getDirectiveType(directive, componentPath, directiveKey) {
    if (
      directive.allowedChildren ||
      directive.defaultComponents ||
      directive.defaultContent
    ) {
      return 'container';
    } else if (
      directive.plainText ||
      directive.excludeFromTextCount ||
      directive.maxLength ||
      directive.recommendedMaxLength
    ) {
      return 'editable';
    } else if (directive.imageRatios || directive.allowOriginalRatio) {
      return 'image';
    } else if (directive.service || directive.services) {
      return 'include';
    }

    migrationManualReviews.push({
      path: componentPath,
      directive: directiveKey,
    });

    return '';
  }

  static writeDesign(newDesign) {
    if (lib.bFileExists(configuration.migration.dest + '/config.json')) {
      fs.rmSync(configuration.migration.dest + '/config.json');
    }

    fs.mkdirSync(configuration.migration.dest, { recursive: true });

    fs.writeFileSync(
      configuration.migration.dest + '/config.json',
      JSON.stringify(newDesign, null, '\t'),
      {
        encoding: 'utf8',
        flag: 'a+',
        mode: 0o666,
      },
    );
  }

  static writeComponents(newComponents) {
    newComponents.forEach((component) => {
      const pathEndIndex = configuration.migration.components.indexOf('*');
      const toReplace = configuration.migration.components.substring(
        0,
        pathEndIndex,
      );
      const newFullPath = component.path.replace(
        toReplace,
        configuration.migration.dest + '/components/',
      );
      const newPath = newFullPath.split('/');

      newPath.splice(-1);

      fs.mkdirSync(newPath.join('/'), { recursive: true });

      fs.writeFileSync(newFullPath, this.makeComponentFileString(component));
    });
  }

  static makeComponentFileString(component) {
    let data = `<script type="ld-conf">\n${JSON.stringify(component.configurationData, null, '\t')}\n</script>\n`;
    data += component.html;

    return data;
  }

  static writeManualReviews() {
    if (migrationManualReviews.length == 0) {
      console.info('probably no manual reviews required');
      return;
    }

    migrationManualReviews.forEach((review) => {
      logger.warn(
        `component ${review.path} directive ${review.directive} requires manual review`,
      );
    });

    const textOutput = migrationManualReviews
      .map(
        (review) =>
          `component ${review.path} directive ${review.directive} requires manual review`,
      )
      .join('\n');
    fs.writeFileSync('./manual-review.txt', textOutput, {
      encoding: 'utf8',
      flag: 'a+',
      mode: 0o666,
    });
    logger.warn(
      `found [${migrationManualReviews.length}] issues, building a design without manual review will fail. ./manual-review.txt`,
    );
  }
}

export default Migrate;
