export default LivingdocsDesign;
declare class LivingdocsDesign {
  static loadDesign(configuration: any): any;
  static loadComponents(configuration: any): {
    path: string;
    configurationData: any;
    html: string;
  }[];
}
