import { beaver } from './beaver.js';
import { map, mapLdd, mapJs } from './build.js';

/**
 * Configures the nswow-watcher for the server to monitor changes in specific files.
 * When a change, add, or unlink event is triggered, corresponding actions are executed.
 *
 * @param {Object} server - The server object.
 */
function nswowWatcher() {
  return {
    name: 'nswow-watcher',
    configureServer(server) {
      server.watcher.on('change', (path) => {
        if (path.endsWith('/nswow.config.json')) {
          beaver();
        }

        if (path.endsWith('/properties.json')) {
          mapLdd();
        }
      });
      server.watcher.on('add', (path) => {
        if (
          path.endsWith('/general.scss') ||
          path.endsWith('/app.scss') ||
          path.endsWith('/ldd.scss') ||
          path.endsWith('/pdf.scss') ||
          path.endsWith('/word.scss')
        ) {
          map();
        }

        if (path.endsWith('/app.js') || path.endsWith('/app.ts')) {
          mapJs();
        }
      });
      server.watcher.on('unlink', (path) => {
        if (
          path.endsWith('/general.scss') ||
          path.endsWith('/app.scss') ||
          path.endsWith('/ldd.scss') ||
          path.endsWith('/pdf.scss') ||
          path.endsWith('/word.scss') ||
          path.endsWith('/properties.json')
        ) {
          map();
        }

        if (path.endsWith('/app.js') || path.endsWith('/app.ts')) {
          mapJs();
        }
      });
    },
  };
}

export { nswowWatcher };
