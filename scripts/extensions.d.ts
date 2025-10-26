export default extensions;
export namespace extensions {
    let group: string;
}
export function getExtensions(): Promise<{
    group: string;
}>;
export function registerExtensions(): Promise<{
    group: string;
}>;
