export default LivingdocsDesignValidator;
export class LivingdocsDesignValidator {
    /**
     *
     */
    constructor(lddDesign: any);
    lddDesign: any;
    /**
     *
     * @returns {boolean} wether or not a design is valid
     */
    IsDesignValid(): boolean;
    /**
     * Test if all component properties are declared
     * @returns {boolean}
     */
    usedPropertiesAreDeclared(): boolean;
    /**
     * Test if each components belong to at least one group
     * @returns {boolean}
     */
    everyComponentHasAGroup(): boolean;
    /**
     * Test if there are any duplicate component names
     * @returns {boolean}
     */
    hasNoDuplicateComponentNames(): boolean;
    /**
     * Test if there are any duplicate groups
     * @returns {boolean}
     */
    hasNoDuplicateGroupLabels(): boolean;
    /**
     * Test if any component uses a declared property, log a warning if unused
     * @returns {void}
     */
    allComponentPropertiesAreUsed(): void;
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
    everyDeclaredDirectiveExistsOnComponent(): boolean;
    delcaredDirectivesExistsOnComponent(component: any): boolean;
    /**
     *
     * @returns {boolean} true when parents exist
     */
    everyAllowedParentExistsInDesign(): boolean;
    /**
     * Test if referenced defaultContent and allowedChildren exist
     * @param {object} directive
     * @returns {boolean}
     */
    _checkContainerDirective(directive: object): boolean;
}
