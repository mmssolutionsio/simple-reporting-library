export default lib;
declare namespace lib {
  export { bFileExists };
  export { removeFolder };
  export { removeFile };
  export { getAllComponentPaths };
  export { minifyHtml };
  export { mergeDesignV1 };
  export { mergeDesignV2 };
  export { testComponentExistV1 };
  export { testComponentExistV2 };
  export { testPropertyExistV1 };
  export { testPropertyExistV2 };
  export { testComponentsAllUsedV1 };
  export { testComponentsAllUsedV2 };
  export { testDesignPropertiesV1 };
  export { testDesignPropertiesV2 };
}
declare function bFileExists(path: any): any;
declare function removeFolder(path: any): void;
declare function removeFile(path: any): void;
declare function getAllComponentPaths(componentPath: any): string[];
declare function minifyHtml(s: any): any;
declare function mergeDesignV1(designData: any, components: any): any;
declare function mergeDesignV2(designData: any, components: any): any;
declare function testComponentExistV1(designData: any, components: any): void;
declare function testComponentExistV2(
  designData: any,
  components: any,
): boolean;
declare function testPropertyExistV1(designData: any, components: any): void;
declare function testPropertyExistV2(designData: any, components: any): void;
declare function testComponentsAllUsedV1(
  designData: any,
  components: any,
): void;
declare function testComponentsAllUsedV2(
  designData: any,
  components: any,
): void;
declare function testDesignPropertiesV1(designData: any, components: any): void;
declare function testDesignPropertiesV2(designData: any, components: any): void;
