import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
/**
 * The colors module provides ANSI styling and coloring for terminal output.
 *
 * @module colors
 * @requires colors/safe
 */
const colors = require('colors/safe');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'cyan',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
  folder: 'brightRed',
  file: 'brightBlue',
});

export default colors;
export { colors };
