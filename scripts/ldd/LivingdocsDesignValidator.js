const directiveHtmlRegex =
  /doc-(container|editable|html|image|include|link|style|toggle|video)=[\\"']{1,}([a-zA-Z\-\_\d]{1,}?)[\\"']{1,}/gm;

class LivingdocsDesignValidator {
  /**
   *
   */
  constructor(lddDesign) {
    if (!lddDesign) {
      throw new Error('no ldd design given');
    }

    this.lddDesign = lddDesign;
  }

  /**
   *
   * @returns {boolean} wether or not a design is valid
   */
  IsDesignValid() {
    // checks that only throw a warning
    this.allComponentPropertiesAreUsed();

    // checks that can fail the build
    return (
      this.hasNoDuplicateComponentNames() &&
      this.hasNoDuplicateGroupLabels() &&
      this.usedPropertiesAreDeclared() &&
      this.everyAllowedParentExistsInDesign() &&
      this.everyComponentHasAGroup() &&
      this.everyDeclaredDirectiveExistsOnComponent()
    );
  }

  /**
   * Test if all component properties are declared
   * @returns {boolean}
   */
  usedPropertiesAreDeclared() {
    const { componentProperties, components } = this.lddDesign;

    const compPropertiesUsed = [
      ...new Set(components.map((c) => c.properties ?? []).flat(1)),
    ];

    const notExistingProperties = compPropertiesUsed.filter(
      (x) => !componentProperties[x],
    );

    if (notExistingProperties.length) {
      throw new Error(
        `component properties [${notExistingProperties}] are not declared`,
      );
    }

    return true;
  }

  /**
   * Test if each components belong to at least one group
   * @returns {boolean}
   */
  everyComponentHasAGroup() {
    const { groups, components } = this.lddDesign;

    const componentsNotInGroups = components.filter(
      (comp) => !groups.find((g) => g.components.includes(comp.name)),
    );

    if (componentsNotInGroups.length) {
      throw new Error(
        `components [${componentsNotInGroups.map((c) => c.name)}] are not in any group and will not show in the editor`,
      );
    }

    return true;
  }

  /**
   * Test if there are any duplicate component names
   * @returns {boolean}
   */
  hasNoDuplicateComponentNames() {
    const { components } = this.lddDesign;
    const usedNames = [];
    const duplicates = [];

    for (let i = 0; i < components.length; i++) {
      const { name } = components[i];

      if (usedNames.includes(name)) {
        duplicates.push(name);
      } else {
        usedNames.push(name);
      }
    }

    if (duplicates.length) {
      throw new Error(`duplicate component names [${duplicates}]`);
    }

    return true;
  }

  /**
   * Test if there are any duplicate groups
   * @returns {boolean}
   */
  hasNoDuplicateGroupLabels() {
    const { groups } = this.lddDesign;
    const usedLabels = [];
    const duplicates = [];

    for (let i = 0; i < groups.length; i++) {
      const { label } = groups[i];

      if (usedLabels.includes(label)) {
        duplicates.push(label);
      } else {
        usedLabels.push(label);
      }
    }

    if (duplicates.length) {
      throw new Error(`duplicate group label [${duplicates}]`);
    }

    return true;
  }

  /**
   * Test if any component uses a declared property, log a warning if unused
   * @returns {void}
   */
  allComponentPropertiesAreUsed() {
    const { componentProperties, components } = this.lddDesign;
    const propertyNames = Object.keys(componentProperties);

    const unusedProps = propertyNames.filter(
      (prop) => !components.find((c) => c.properties?.includes(prop)),
    );

    if (unusedProps.length) {
      console.warn(
        `component properties [${unusedProps}] are unused and can be removed`,
      );
    }
  }

  /**
   * Test if every doc-directive and json declaration exist
   * common user failures are:
   * - duplicate directive value
   * - diplicate usage of doc-link
   * - declared but not used directive value
   * - allowedChildren component/s do not exist
   * - defaultContent component does not exist
   * @returns {boolean}
   */
  everyDeclaredDirectiveExistsOnComponent() {
    const { components } = this.lddDesign;
    return components
      .map((c) => this.delcaredDirectivesExistsOnComponent(c))
      .every((x) => x);
  }

  // TODO: split into multiple methods to validate different directives
  delcaredDirectivesExistsOnComponent(component) {
    const { html, directives } = component;
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

    if (duplicateDirectiveNames.length) {
      throw new Error(
        `duplicate directive values [${duplicateDirectiveNames}] in component "${component.name}"`,
      );
    }

    if (htmlDirectiveTypes.filter((x) => x === 'link').length > 1) {
      throw new Error(
        `directive doc-link used multiple times in component "${component.name}"`,
      );
    }

    if (!directives) {
      return true;
    }

    // check if all declared directives a referenced
    for (let k = 0; k < directiveNames.length; k++) {
      const directiveName = directiveNames[k];
      const directive = directives[directiveName];

      if (
        directive.allowedChildren?.length ||
        directive.defaultContent?.length
      ) {
        if (!this._checkContainerDirective(directive)) {
          throw new Error(
            `directive "${directiveName}" in component "${component.name}" references non-existing component/s`,
          );
        }
      }
    }

    const usedButNotReferenced = directiveNames.filter(
      (directiveName) => htmlFoundDirectives[directiveName] !== true,
    );

    if (usedButNotReferenced.length) {
      throw new Error(
        `directives [${usedButNotReferenced}] in component "${component.name}" is declared but not referenced in html`,
      );
    }

    return true;
  }

  /**
   *
   * @returns {boolean} true when parents exist
   */
  everyAllowedParentExistsInDesign() {
    const { components } = this.lddDesign;
    const nonexistingParents = [];

    const componentsWithParents = components.filter(
      (x) => !!x.allowedParents && Array.isArray(x.allowedParents),
    );

    for (let index = 0; index < componentsWithParents.length; index++) {
      const component = componentsWithParents[index];

      // root is a valid parent as it is the editor container
      nonexistingParents.push(
        ...component.allowedParents
          .filter((x) => x != 'root')
          .filter((x) => !components.find((y) => y.name == x)),
      );
    }

    if (nonexistingParents.length) {
      throw new Error(
        `allowed parents [${nonexistingParents}] do not exist in design`,
      );
    }

    return true;
  }

  /**
   * Test if referenced defaultContent and allowedChildren exist
   * @param {object} directive
   * @returns {boolean}
   */
  _checkContainerDirective(directive) {
    const { allowedChildren, defaultContent } = directive;
    const { components } = this.lddDesign;

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
}

export { LivingdocsDesignValidator };
export default LivingdocsDesignValidator;
