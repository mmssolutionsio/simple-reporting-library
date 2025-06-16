import { writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { colors } from './colors.js';
import { readNsWowJson } from './utils.js';
import colorPalette from '@kne/color-palette';
import * as folders from '../srl/plugins/folders.js';
/**
 * Maps the values of an object or array recursively.
 *
 * @param {Object|Array} values - The object or array of values to map.
 * @returns {Object|Array} - The mapped object or array.
 */
function mapValues(values) {
  let r = {};
  if (Array.isArray(values)) {
    for (let x = 0; x < values.length; x++) {
      if (typeof values[x].name === 'undefined') {
        if (!Array.isArray(r)) {
          r = [];
        }
        r.push(mapValues(values[x]));
      } else {
        r[values[x].name] = mapValues(values[x]);
      }
    }
  } else if (typeof values === 'object') {
    for (const label in values) {
      if (label !== 'name') {
        r[label] = mapValues(values[label]);
      }
    }
  } else {
    if (values === '') {
      return `""`;
    }
    return values;
  }
  return r;
}

/**
 * Generates SCSS code to import and write typography mixins.
 *
 * @param {Object} typography - The typography configuration object.
 * @param {Object} typography.typography - The typography mixin definitions.
 * @returns {string} - The generated SCSS code.
 */
function writeTypographyScss(typography) {
  let r = [`@use "config";`, `@forward "../scss/typography";`];
  if (typography) {
    if (typography.typography) {
      let o = [];

      for (const typo in typography.typography) {
        o.push(`@mixin ${typo}($margins: false) {`);
        o.push(`  @include typography.get("${typo}", $margins);`);
        o.push(`}\n`);
      }
      if (o.length) {
        r.push(`@use "../scss/typography";\n`);
        r.push(o.join(`\n`));
      }
    }
  }
  return r.join(`\n`);
}

/**
 * Writes SCSS code for importing and forwarding colors from a config file.
 *
 * @param {Object} colors - The colors object containing color keys and their values.
 * @returns {string} - The SCSS code for importing and forwarding colors.
 */
function writeColorsScss(colors) {
  let r = [`@use "config";`, `@forward "../scss/colors";`];
  if (colors) {
    if (colors.colors) {
      let o = [];

      for (const color in colors.colors) {
        o.push(`@function ${color}() {`);
        o.push(`  @return colors.get("${color}");`);
        o.push(`}\n`);
      }

      if (o.length) {
        r.push(`@use "../scss/colors";\n`);
        r.push(o.join(`\n`));
      }
    }
  }
  return r.join(`\n`);
}

/**
 * Checks if there are any commas outside of parentheses in the given text.
 *
 * @param {string} text - The text to be checked.
 * @return {boolean} - True if there is at least one comma outside of parentheses, false otherwise.
 */
function hasCommasOutsideOfParentheses(text) {
  let depth = 0;
  for (let char of text) {
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === ',' && depth === 0) return true;
  }
  return false;
}

/**
 * Determines if there are points outside of parentheses in the given text.
 *
 * @param {string} text - The text to check.
 * @return {boolean} - True if there are points outside of parentheses, false otherwise.
 */
function hasPointsOutsideOfParentheses(text) {
  let depth = 0;
  for (let char of text) {
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === '.' && depth === 0) return true;
  }
  return false;
}

/**
 * Converts a JavaScript object into SCSS variables.
 *
 * @param {object} values - The JavaScript object containing the variable names and values.
 * @param {number} indent - The number of spaces to indent each line of the generated SCSS. Default is 2.
 * @returns {string} - The SCSS variables as a string.
 */
function makeScssVariables(values, indent = 2) {
  let r = [];
  if (typeof values === 'object') {
    r.push(`(`);
    let v = [];
    for (const variables in values) {
      if (Array.isArray(values)) {
        v.push(
          `${' '.repeat(indent + 2)}var${variables}: ${makeScssVariables(values[variables], indent + 2)}`,
        );
      } else {
        v.push(
          `${' '.repeat(indent + 2)}${variables}: ${makeScssVariables(values[variables], indent + 2)}`,
        );
      }
    }
    r.push(v.join(`,\n`));
    r.push(`${' '.repeat(indent)})`);
  } else {
    if (
      typeof values === 'string' &&
      values !== `""` &&
      (hasPointsOutsideOfParentheses(values) ||
        hasCommasOutsideOfParentheses(values))
    ) {
      values = `\"${values.replaceAll('"', '\\"')}\"`;
    }
    return values;
  }
  return r.join(`\n`);
}

/**
 * Generates configuration files for nswow.
 * @param {number} [verbose=0] - The verbosity level. Default is 0.
 * @returns {Promise<void>} - A promise that resolves once the files have been generated.
 */
async function beaver(verbose = 0) {
  const configJson = await readNsWowJson();
  const nswowPath = folders.srlSystem;

  if (typeof verbose === 'boolean') {
    verbose = verbose ? 1 : 0;
  }

  if (typeof configJson.system === 'undefined') {
    configJson.system = {};
  }

  if (typeof configJson.system.environment === 'undefined') {
    configJson.system.environment = process.env.NODE_ENV;
  }

  if (typeof configJson.fonts !== 'undefined') {
    const fontBasePath = configJson.fonts['font-base-path'] ?? '';
    if (fontBasePath.length) {
      configJson.fonts['font-base-path'] = '.' + path.normalize(fontBasePath);
    }
    if (typeof configJson.fonts.fonts !== 'undefined') {
      for (let x = 0; x < configJson.fonts.fonts.length; x++) {
        let font = configJson.fonts.fonts[x];
        if (typeof font === 'string') {
          configJson.fonts.fonts[x] = JSON.parse(
            readFileSync(
              path.join( process.cwd(), fontBasePath, font, 'styles.json')
            ),
          );
        }
      }
    }
  }

  const map = {};

  for (const file in configJson) {
    map[file] = {};
    for (const variable in configJson[file]) {
      map[file][variable] = mapValues(configJson[file][variable]);
    }
  }

  if (map?.colors?.colors?.shade) {
    const shade = map.colors.colors.shade.color;
    if (!map.colors.colors['shade-50']) {
      map.colors.colors['shade-50'] = { color: colorPalette(shade, 0.5) };
    }
    if (!map.colors.colors['shade-100']) {
      map.colors.colors['shade-100'] = { color: colorPalette(shade, 1) };
    }
    if (!map.colors.colors['shade-200']) {
      map.colors.colors['shade-200'] = { color: colorPalette(shade, 2) };
    }
    if (!map.colors.colors['shade-300']) {
      map.colors.colors['shade-300'] = { color: colorPalette(shade, 3) };
    }
    if (!map.colors.colors['shade-400']) {
      map.colors.colors['shade-400'] = { color: colorPalette(shade, 4) };
    }
    if (!map.colors.colors['shade-500']) {
      map.colors.colors['shade-500'] = { color: colorPalette(shade, 5) };
    }
    if (!map.colors.colors['shade-600']) {
      map.colors.colors['shade-600'] = { color: colorPalette(shade, 6) };
    }
    if (!map.colors.colors['shade-700']) {
      map.colors.colors['shade-700'] = { color: colorPalette(shade, 7) };
    }
    if (!map.colors.colors['shade-800']) {
      map.colors.colors['shade-800'] = { color: colorPalette(shade, 8) };
    }
    if (!map.colors.colors['shade-900']) {
      map.colors.colors['shade-900'] = { color: colorPalette(shade, 9) };
    }
    if (!map.colors.colors['shade-950']) {
      map.colors.colors['shade-950'] = { color: colorPalette(shade, 9.5) };
    }
  }

  let configOutput = [];
  [
    'system',
    'fonts',
    'meta',
    'grid',
    'colors',
    'typography',
    'spacer',
    'helpers',
  ].forEach((file) => {
    if (typeof map[file] !== 'undefined') {
      const o = [];
      o.push(
        `@use "../scss/${file}/variables.scss" as ${file}Variables with (`,
      );
      let v = [];
      for (const variable in map[file]) {
        v.push(`  $${variable}: ${makeScssVariables(map[file][variable])}`);
      }
      o.push(v.join(`,\n`));
      o.push(');\n');
      configOutput.push(o.join(`\n`));
    }
  });

  configOutput = configOutput.join(`\n`);
  const configFile = path.join(nswowPath, 'config.scss');
  writeFileSync(configFile, configOutput);

  const typographyFile = path.join(nswowPath, 'typography.scss');
  const typographyOutput = writeTypographyScss(map.typography);
  writeFileSync(typographyFile, typographyOutput);

  const colorsFile = path.join(nswowPath, 'colors.scss');
  const colorsOutput = writeColorsScss(map.colors);
  writeFileSync(colorsFile, colorsOutput);

  console.log(verbose)

  if (verbose > 0) {
    console.log(colors.info(`\nThe following files has been written.\n`));

    console.log(
      colors.bgWhite(colors.file(path.relative(process.cwd(), configFile))),
    );
    if (verbose > 1) {
      console.log(colors.prompt(`\n` + configOutput + `\n`));
    }

    console.log(
      colors.bgWhite(colors.file(path.relative(process.cwd(), typographyFile))),
    );
    if (verbose > 1) {
      console.log(colors.prompt(`\n` + typographyOutput + `\n`));
    }

    console.log(
      colors.bgWhite(colors.file(path.relative(process.cwd(), colorsFile))),
    );
    if (verbose > 1) {
      console.log(colors.prompt(`\n` + colorsOutput + `\n`));
    }
    console.log('');
  }
}

export { beaver };
