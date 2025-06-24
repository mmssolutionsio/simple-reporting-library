import { createLogger } from 'vite';
const logger = createLogger();

let lddDesign = null;

const directiveHtmlRegex =
  /doc-(container|editable|html|image|include|link|style|toggle|video)=[\\"']{1,}([a-zA-Z\-\_\d]{1,}?)[\\"']{1,}/gm;

export function IsLddDesignValid(designToValidate) {
  if (!designToValidate) {
    throw new Error('no ldd design given');
  }

  lddDesign = designToValidate;

  // checks that only throw a warning
  allComponentPropertiesAreUsed();

  // checks that should fail the build
  return (
    hasNoDuplicateComponentNames() &&
    hasNoDuplicateGroupNames() &&
    usedPropertiesAreDeclared() &&
    everyComponentHasAGroup() &&
    everyDeclaredDirectiveExistsOnComponent()
  );
}

/**
 * Test if there are any duplicate component names
 * @returns {boolean}
 */
function hasNoDuplicateComponentNames() {
  const { components } = lddDesign;

  const usedNames = [];

  for (let i = 0; i < components.length; i++) {
    const { name } = components[i];

    if (usedNames.includes(name)) {
      logger.error(`component name ${name} is a duplicate`);
    } else {
      usedNames.push(name);
    }
  }

  return usedNames.length == components.length;
}

/**
 * Test if there are any duplicate groups
 * @returns {boolean}
 */
function hasNoDuplicateGroupNames() {
  const { groups } = lddDesign;
  const usedNames = [];

  for (let i = 0; i < groups.length; i++) {
    const name = groups[i];

    if (usedNames.includes(name)) {
      logger.error(`group name ${name} is a duplicate`);
    } else {
      usedNames.push(name);
    }
  }

  return usedNames.length == groups.length;
}

/**
 * Test if any component uses a declared property, log a warning if unused
 * @returns {void}
 */
function allComponentPropertiesAreUsed() {
  const { componentProperties, components } = lddDesign;

  const propertyNames = Object.keys(componentProperties);

  const unusedProps = propertyNames.filter(
    (prop) => !components.find((c) => c.properties?.includes(prop)),
  );

  unusedProps.forEach((c) =>
    logger.warn(`component property "${c}" is unused and can be removed`),
  );
}

/**
 * Test if all component properties are declared
 * @returns {boolean}
 */
function usedPropertiesAreDeclared() {
  const { componentProperties, components } = lddDesign;

  const compPropertiesUsed = [
    ...new Set(components.map((c) => c.properties ?? []).flat(1)),
  ];

  const notExistingProperties = compPropertiesUsed.filter(
    (x) => !componentProperties[x],
  );

  if (notExistingProperties.length) {
    notExistingProperties.forEach((x) =>
      logger.error(`component property "${x}" is not declared`),
    );

    return false;
  }

  return true;
}

/**
 * Test if each components belong to at least one group
 * @returns {boolean}
 */
function everyComponentHasAGroup() {
  const { groups, components } = lddDesign;

  const componentsNotInGroups = components.filter(
    (comp) => !groups.find((g) => g.components.includes(comp.name)),
  );

  if (componentsNotInGroups.lenght > 0) {
    componentsNotInGroups.forEach((element) => {
      logger.warn(
        warn(
          `component "${element.name}" is not in any group and will not show in the editor`,
        ),
      );
    });
    return false;
  }

  return true;
}

/**
 * Test if every doc-directive and json declaration exist
 * common user failures are:
 * - duplicate directive value
 * - diplicate usage of doc-link
 * - declared but not used directive value
 * - allowedParent does not exist
 * - allowedChildren component/s do not exist
 * - defaultContent component does not exist
 * @returns {boolean}
 */
function everyDeclaredDirectiveExistsOnComponent() {
  const { components } = lddDesign;

  return components
    .map((c) => delcaredDirectivesExistsOnComponent(c))
    .every((x) => x);
}

function delcaredDirectivesExistsOnComponent(component) {
  const { html, directives } = component;

  let isValid = true;

  const regResult = html.matchAll(directiveHtmlRegex);

  const htmlDirectiveTypes = []; // used to find duplicates
  const htmlDirectiveNames = []; // used to find duplicates

  const directiveNames = !!directives ? Object.keys(directives) : [];

  const htmlFoundDirectives = directiveNames.length
    ? directiveNames
        .map((d) => ({ [d]: false }))
        .reduce((a, b) => ({ ...a, ...b }))
    : {};

  regResult.forEach((finding) => {
    const htmlDirective = finding[1];
    const directiveName = finding[2];

    htmlDirectiveTypes.push(htmlDirective);
    htmlDirectiveNames.push(directiveName);

    htmlFoundDirectives[directiveName] = true;
  });

  const duplicateDirectiveNames = htmlDirectiveNames.filter(
    (x, i) => htmlDirectiveNames.indexOf(x) !== i,
  );

  duplicateDirectiveNames.forEach((duplicate) => {
    logger.error(
      `directive value "${duplicate}" duplicate in component "${component.name}"`,
    );

    isValid = false;
  });

  if (htmlDirectiveTypes.filter((x) => x === 'link').length > 1) {
    logger.error(
      `directive doc-link used multiple times in component "${component.name}"`,
    );

    isValid = false;
  }

  if (!directives) {
    return isValid;
  }

  // check if all declared directives a referenced
  for (let k = 0; k < directiveNames.length; k++) {
    const directiveName = directiveNames[k];
    const directive = directives[directiveName];

    if (
      directive.allowedChildren?.length > 0 ||
      directive.defaultContent?.length > 0
    ) {
      if (!_checkContainerDirective(directive)) {
        logger.error(
          `directive "${directiveName}" in component "${component.name}" references non-existing component/s`,
        );

        isValid = false;
      }
    }
  }

  directiveNames
    .filter((directiveName) => htmlFoundDirectives[directiveName] !== true)
    .forEach((dn) => {
      logger.error(
        `directive "${dn}" in component "${component.name}" is declared but not referenced in html`,
      );

      isValid = false;
    });

  return isValid;
}

/**
 * Test if referenced defaultContent and allowedChildren exist
 * @param {object} directive
 * @returns {boolean}
 */
function _checkContainerDirective(directive) {
  const { allowedChildren, defaultContent } = directive;
  const { components } = lddDesign;

  return (
    (allowedChildren
      ? allowedChildren.every((x) => !!components.find((c) => c.name == x))
      : true) &&
    (defaultContent
      ? defaultContent
          .map((dc) => !!components.find((c) => c.name == dc.component))
          .every((x) => x)
      : true)
  );
}
