export default configurationDefaults;
declare namespace configurationDefaults {
    let configurationSelector: string;
    namespace build {
        let design: string;
        let components: string;
        let requiredFolders: string[];
        let dist: string;
        let dest: string;
        let archiveName: string;
    }
    namespace migration {
        let design_1: string;
        export { design_1 as design };
        let components_1: string;
        export { components_1 as components };
        let dest_1: string;
        export { dest_1 as dest };
    }
}
