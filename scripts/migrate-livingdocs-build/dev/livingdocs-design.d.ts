export default LivingdocsDesign;
declare class LivingdocsDesign {
    static loadDesign(configuration: any): any;
    static loadComponents(configuration: any): {
        path: any;
        configurationData: any;
        html: any;
    }[];
}
