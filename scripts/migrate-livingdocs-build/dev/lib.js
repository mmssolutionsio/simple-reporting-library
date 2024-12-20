import fs from 'fs';
import { globbySync } from 'globby';
import logger from './logger.js';

const bFileExists = (path) => {
  return fs.existsSync(path);
};

function getAllComponentPaths(componentPath) {
  const files = globbySync(componentPath);
  return files;
}

function removeFolder(path) {
  if (bFileExists(path)) {
    fs.rmSync(path, { recursive: true });
  }
}

function removeFile(path) {
  if (bFileExists(path)) {
    fs.rmSync(path);
  }
}

function minifyHtml(s) {
  return s
    ? s
        .replace(/\>[\r\n ]+\</g, '><') // Removes new lines and irrelevant spaces which might affect layout, and are better gone
        .replace(/(<.*?>)|\s+/g, (m, $1) => ($1 ? $1 : ' '))
        .trim()
    : '';
}

function testComponentExistV1(designData, components) {
  const componentNames = components.map(
    (component) => component.configurationData.name,
  );
  designData.groups.forEach((componentGroup) => {
    componentGroup.components.forEach((c) => {
      if (!componentNames.includes(c)) {
        throw {
          message: `component "${c}" in componentGroup "${componentGroup.label}" does not exist`,
        };
      }
    });
  });
}

function testComponentExistV2(designData, components) {
  designData.designSettings.componentGroups.forEach((componentGroup) => {
    componentGroup.components.forEach((componentName) => {
      if (
        !components.find((component) => {
          return component.configurationData.name === componentName;
        })
      ) {
        throw {
          message: `component "${componentName}" in componentGroup "${componentGroup.label}" does not exist`,
        };
      }
    });
  });

  return true;
}

function testPropertyExistV1(designData, components) {
  const allProperties = Object.keys(designData.componentProperties);

  for (let index = 0; index < components.length; index++) {
    const component = components[index];

    if (
      component.configurationData.properties &&
      component.configurationData.properties.length > 0
    ) {
      component.configurationData.properties.forEach((cProperty) => {
        if (!allProperties.includes(cProperty)) {
          throw {
            message: `property "${cProperty}" in component "${component.configurationData.name}" is not present in design`,
          };
        }
      });
    }
  }
}

function testPropertyExistV2(designData, components) {
  const allProperties = designData.designSettings.componentProperties.map(
    (p) => p.name,
  );
  for (let index = 0; index < components.length; index++) {
    const component = components[index];

    if (
      component.configurationData.properties &&
      component.configurationData.properties.length > 0
    ) {
      component.configurationData.properties.forEach((cProperty) => {
        if (!allProperties.includes(cProperty)) {
          throw {
            message: `property "${cProperty}" in component "${component.configurationData.name}" is not present in design`,
          };
        }
      });
    }
  }
}

function testComponentsAllUsedV1(designData, components) {
  const componentGroupComponents = [
    ...designData.groups.map((componentGroup) => componentGroup.components),
  ].flat(1);

  components.forEach((component) => {
    if (
      !componentGroupComponents.find(
        (c) => c === component.configurationData.name,
      )
    ) {
      logger.warn(
        `component ${component.path} is unused in config.json, will not be packed into zip`,
      );
    }
  });
}

function testComponentsAllUsedV2(designData, components) {
  const componentGroupComponents = [
    ...designData.designSettings.componentGroups.map(
      (componentGroup) => componentGroup.components,
    ),
  ].flat(1);

  components.forEach((component) => {
    if (
      !componentGroupComponents.find(
        (c) => c === component.configurationData.name,
      )
    ) {
      logger.warn(
        `component ${component.path} is unused in config.json, will not be packed into zip`,
      );
    }
  });
}

function testDesignPropertiesV1(designData, components) {
  Object.keys(designData.componentProperties).forEach((componentProperty) => {
    if (!propertyExistInComponentsV1(componentProperty, components)) {
      logger.info(`property "${componentProperty}" is never used`);
    }
  });
}

function testDesignPropertiesV2(designData, components) {
  designData.designSettings.componentProperties.forEach((componentProperty) => {
    if (!propertyExistInComponentsV2(componentProperty.name, components)) {
      logger.info(`property "${componentProperty.name}" is never used`);
    }
  });
}

function propertyExistInComponentsV1(property, components) {
  for (let index = 0; index < components.length; index++) {
    const component = components[index];
    if (
      component.configurationData.properties &&
      component.configurationData.properties.includes(property)
    ) {
      return true;
    }
  }

  return false;
}

function propertyExistInComponentsV2(property, components) {
  for (let index = 0; index < components.length; index++) {
    const component = components[index];
    if (
      component.configurationData.properties &&
      component.configurationData.properties.includes(property)
    ) {
      return true;
    }
  }

  return false;
}

function mergeDesignV1(designData, components) {
  const newDesignData = JSON.parse(JSON.stringify(designData));
  const designComponents = designData.groups
    .map((componentGroup) => componentGroup.components)
    .flat(1);

  newDesignData.components = components
    .filter((component) => {
      return designComponents.includes(component.configurationData.name);
    })
    .map((component) => {
      return {
        ...component.configurationData,
        html: minifyHtml(component.html),
      };
    });

  return newDesignData;
}

function mergeDesignV2(designData, components) {
  const newDesignData = JSON.parse(JSON.stringify(designData));
  const designComponents = designData.designSettings.componentGroups
    .map((componentGroup) => componentGroup.components)
    .flat(1);

  newDesignData.components = components
    .filter((component) => {
      return designComponents.includes(component.configurationData.name);
    })
    .map((component) => {
      return {
        ...component.configurationData,
        html: minifyHtml(component.html),
      };
    });

  return newDesignData;
}

const lib = {
  bFileExists,
  removeFolder,
  removeFile,
  getAllComponentPaths,
  minifyHtml,
  mergeDesignV1,
  mergeDesignV2,
  testComponentExistV1,
  testComponentExistV2,
  testPropertyExistV1,
  testPropertyExistV2,
  testComponentsAllUsedV1,
  testComponentsAllUsedV2,
  testDesignPropertiesV1,
  testDesignPropertiesV2,
};

export default lib;
