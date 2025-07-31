export default Migrate;
declare class Migrate {
    static migrateDesign(oldDesignData: any): {
        v: number;
        name: string;
        version: string;
        designSettings: {
            componentProperties: any[];
            defaultComponents: {};
            prefilledComponents: {};
            componentGroups: any[];
            fieldExtractor: {};
        };
    };
    static migrateComponentProperties(oldProperties: any): any[];
    static migrateComponents(components: any): any;
    static getDirectiveType(directive: any, componentPath: any, directiveKey: any): "include" | "" | "image" | "editable" | "container";
    static writeDesign(newDesign: any): void;
    static writeComponents(newComponents: any): void;
    static makeComponentFileString(component: any): string;
    static writeManualReviews(): void;
}
