/**
 * Entfernt @media aus exakt einer CSS-Datei und ersetzt diese Datei durch das Ergebnis.
 * @param {string} cssPath absoluter oder relativer Pfad zur .css Datei
 */
export function stripMediaFromCssFile(cssPath: string): Promise<{
    file: string;
    removed: number;
}>;
export type RemoveMediaPayload = {
    params: string;
    atRule: import("postcss").AtRule;
    fullRuleText: string;
};
export type RemoveAllMediaPluginOptions = {
    onRemoveMedia?: (payload: RemoveMediaPayload) => void;
    shouldLogRemovedMedia?: (params: string, atRule: import("postcss").AtRule) => boolean;
};
