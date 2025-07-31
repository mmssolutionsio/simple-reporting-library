/**
 * Configures the nswow-watcher for the server to monitor changes in specific files.
 * When a change, add, or unlink event is triggered, corresponding actions are executed.
 *
 * @param {Object} server - The server object.
 */
export function nswowWatcher(): {
    name: string;
    configureServer(server: any): void;
};
