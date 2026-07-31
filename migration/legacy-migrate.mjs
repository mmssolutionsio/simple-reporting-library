#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, extname, isAbsolute, join, relative } from 'node:path/posix';

const root = process.cwd().replaceAll('\\', '/');
const livingdocsRoot = join(root, 'livingdocs');
const deprecatedGroup = '998.deprecated';
const deprecatedClass = 'deprecated';
const controlFilePath = join(root, 'migration', 'control.md');
const contentMigrationFilePath = join(
  root,
  'migration',
  'content-migration.json',
);

const knownLdConfKeys = [
  'name',
  'label',
  'properties',
  'directives',
  'allowedParents',
  'allowedChildren',
  'defaultComponents',
  'defaultContent',
  'html',
];

const options = parseArgs(process.argv.slice(2));
await migrateProject(options);

async function migrateProject(options = {}) {
  const context = createContext(options);
  const config = readOptionalJson(context.configPath) ?? {};
  const mappings = readOptionalJson(context.mappingsPath) ?? {};

  if (!existsSync(context.sourceRoot)) {
    throw new Error(`Migration source folder not found: ${context.sourceRoot}`);
  }

  const plan = createMigrationPlan(context, config, mappings);
  printPlan(context, plan);

  if (context.dryRun) {
    writeControlFile(context, plan);
    writeContentMigrationFile(context, plan);
    console.log('Dry run only. No Livingdocs files were written.');
    return plan;
  }

  writeProperties(context, plan.properties);
  writeComponents(context, plan.components);
  writeScss(context, plan.scss);
  mergeLivingdocsConfig(plan);
  writeControlFile(context, plan);
  writeContentMigrationFile(context, plan);

  console.log(
    `Migration finished. Components: ${plan.components.length}, properties: ${Object.keys(plan.properties).length}`,
  );
  console.log('Run your project mapper/build afterwards, for example: srl map');
  return plan;
}

function parseArgs(args) {
  const options = {
    source: 'migration',
    dryRun: false,
    force: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '-f' || arg === '--force') {
      options.force = true;
    } else if (arg === '-s' || arg === '--source') {
      options.source = args[index + 1];
      index += 1;
    } else if (arg.startsWith('--source=')) {
      options.source = arg.slice('--source='.length);
    } else if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Legacy migration standalone

Usage:
  node migration/legacy-migrate.mjs --source migration --dry-run
  node migration/legacy-migrate.mjs --source migration --force

Options:
  -s, --source <source>  Migration source folder. Default: migration
  --dry-run             Write only migration/control.md
  -f, --force           Overwrite existing generated files
  -h, --help            Show this help
`);
}

function createContext(options) {
  const sourceRoot = normalizePath(resolveProjectPath(options.source));
  const legacyRoot = existsSync(join(sourceRoot, 'legacy'))
    ? join(sourceRoot, 'legacy')
    : sourceRoot;

  return {
    sourceRoot,
    legacyRoot,
    dryRun: Boolean(options.dryRun),
    force: Boolean(options.force),
    configPath: firstExisting([
      join(sourceRoot, 'config.json'),
      join(legacyRoot, 'config.json'),
      join(legacyRoot, 'src', 'config.json'),
    ]),
    mappingsPath: firstExisting([
      join(sourceRoot, 'mapping.json'),
      join(sourceRoot, 'mappings.json'),
      join(legacyRoot, 'mapping.json'),
      join(legacyRoot, 'mappings.json'),
      join(root, 'mapping.json'),
      join(root, 'mappings.json'),
    ]),
    componentsRoot: firstExisting([
      join(sourceRoot, 'components'),
      join(legacyRoot, 'components'),
      join(legacyRoot, 'src', 'components'),
    ]),
    scssRoot: firstExisting([
      join(sourceRoot, 'scss'),
      join(legacyRoot, 'scss'),
      join(legacyRoot, 'src', 'scss'),
    ]),
  };
}

function createMigrationPlan(context, config, mappings) {
  const componentEntries = normalizeDeprecatedComponents(
    context,
    config,
    mappings,
  );
  const contentMigrationEntries = normalizeContentMigrationEntries(
    context,
    mappings,
  );
  const existingComponents = collectExistingComponents();
  const existingComponentNames = new Set(existingComponents.keys());
  const skippedComponents = [];
  const migratableComponents = [];

  for (const component of componentEntries) {
    const mapped = component.mapped ?? {};
    const componentName = resolveDeprecatedName(component, mapped);
    const source = resolveComponentSource(
      context.componentsRoot,
      component,
      mapped,
      componentName,
    );
    const template = resolveComponentTemplate(
      source,
      componentName,
      component,
      mapped,
    );
    const html = addRootClass(template.html, deprecatedClass);
    const ldConf = createLdConf(
      template.ldConf,
      component,
      mapped,
      componentName,
    );
    sanitizeDeprecatedLdConf(ldConf, mapped);

    if (existingComponentNames.has(componentName)) {
      skippedComponents.push(componentName);
      continue;
    }

    existingComponentNames.add(componentName);
    migratableComponents.push({
      component,
      mapped,
      name: componentName,
      source,
      html,
      ldConf,
    });
  }

  const components = migratableComponents.map(
    ({ component, mapped, name, source, html, ldConf }, index) => {
      const order = String(index + 1).padStart(3, '0');
      const componentScss = resolveComponentScss(
        context.scssRoot,
        component,
        mapped,
      );

      return {
        name,
        order,
        targetFolder: join(livingdocsRoot, deprecatedGroup, `${order}.${name}`),
        html,
        htmlFileName: `${name}.html`,
        ldConf,
        source,
        scss: componentScss,
      };
    },
  );

  return {
    imageRatios: config.imageRatios ?? mappings.imageRatios ?? {},
    properties: normalizeProperties(config, mappings),
    components,
    skippedComponents,
    contentMigration: createContentMigration(contentMigrationEntries),
    scss: normalizeScss(context, mappings),
  };
}

function hasInlineTemplate(component, mapped) {
  return (
    typeof mapped.html === 'string' ||
    typeof component.html === 'string' ||
    typeof component.template === 'string'
  );
}

function resolveTargetName(component, mapped) {
  return (
    mapped.targetName ??
    mapped.target ??
    mapped.newName ??
    mapped.name ??
    component.targetName ??
    component.target ??
    component.newName ??
    component.name
  );
}

function resolveDeprecatedName(component, mapped) {
  return mapped.deprecatedName ?? mapped.legacyName ?? component.name;
}

function sanitizeDeprecatedLdConf(ldConf, mapped) {
  if (mapped.keepAllowedParents !== true) {
    delete ldConf.allowedParents;
  }
}

function collectExistingComponents() {
  const components = new Map();
  collectExistingComponentsInFolder(livingdocsRoot, components);
  return components;
}

function collectExistingComponentsInFolder(folder, components) {
  if (!existsSync(folder)) return;

  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);

    if (entry.isDirectory()) {
      if (folder === livingdocsRoot && entry.name === deprecatedGroup) continue;
      collectExistingComponentsInFolder(path, components);
      continue;
    }

    if (entry.name !== 'ld-conf.json') continue;

    try {
      const ldConf = JSON.parse(readFileSync(path, 'utf8'));
      if (typeof ldConf.name === 'string') {
        components.set(ldConf.name, {
          ldConf,
          html: readSiblingHtml(path),
        });
      }
    } catch (error) {
      console.warn(
        `Could not parse existing ${relative(root, path)}: ${error.message}`,
      );
    }
  }
}

function readSiblingHtml(ldConfPath) {
  const folder = join(ldConfPath, '..');
  const htmlFile = readdirSync(folder).find((file) =>
    ['.html', '.vue'].includes(extname(file)),
  );
  return htmlFile ? readFileSync(join(folder, htmlFile), 'utf8') : '';
}

function getDirectiveNames(html, ldConf = {}) {
  const names = new Set();

  for (const name of Object.keys(ldConf.directives ?? {})) {
    names.add(name);
  }

  const directiveAttributePattern = /\bdoc-[\w:-]+\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = directiveAttributePattern.exec(html)) !== null) {
    if (match[1]) names.add(match[1]);
  }

  return [...names];
}

function createContentMigration(entries) {
  const componentUpdates = [];
  const directiveUpdates = [];
  const seenComponentUpdates = new Set();
  const seenDirectiveUpdates = new Set();
  const seenDirectivePrevious = new Set();

  for (const entry of entries) {
    if (entry.previousName !== entry.name) {
      const key = `${entry.previousName}\u0000${entry.name}`;
      if (!seenComponentUpdates.has(key)) {
        seenComponentUpdates.add(key);
        componentUpdates.push({
          Previous: entry.previousName,
          New: entry.name,
        });
      }
    }

    for (const update of entry.manualDirectiveUpdates) {
      addDirectiveUpdate(
        directiveUpdates,
        seenDirectiveUpdates,
        seenDirectivePrevious,
        update.Component,
        update.Previous,
        update.New,
      );
    }

    if (!entry.inferDirectiveUpdates) continue;

    const length = Math.min(
      entry.previousDirectiveNames.length,
      entry.newDirectiveNames.length,
    );

    for (let index = 0; index < length; index += 1) {
      const previous = entry.previousDirectiveNames[index];
      const next = entry.newDirectiveNames[index];
      if (!previous || !next || previous === next) continue;

      addDirectiveUpdate(
        directiveUpdates,
        seenDirectiveUpdates,
        seenDirectivePrevious,
        entry.previousName,
        previous,
        next,
      );
    }
  }

  return {
    DirectiveNameUpdates: directiveUpdates,
    ComponentNameUpdates: componentUpdates,
  };
}

function hasManualDirectiveUpdates(mapped) {
  return Boolean(
    mapped.directiveNameUpdates ??
      mapped.directiveUpdates ??
      mapped.contentMigration?.directiveNameUpdates ??
      mapped.directiveMappings ??
      mapped.directives,
  );
}

function normalizeManualDirectiveUpdates(mapped, componentName) {
  const updates =
    mapped.directiveNameUpdates ??
    mapped.directiveUpdates ??
    mapped.contentMigration?.directiveNameUpdates ??
    mapped.directiveMappings ??
    mapped.directives;

  if (!updates) return [];

  if (Array.isArray(updates)) {
    return updates
      .map((update) => ({
        Component: update.Component ?? update.component ?? componentName,
        Previous: update.Previous ?? update.previous,
        New: update.New ?? update.new,
      }))
      .filter((update) => update.Previous && update.New);
  }

  if (typeof updates === 'object') {
    return Object.entries(updates).map(([previous, next]) => ({
      Component: componentName,
      Previous: previous,
      New: next,
    }));
  }

  return [];
}

function addDirectiveUpdate(
  directiveUpdates,
  seenDirectiveUpdates,
  seenDirectivePrevious,
  component,
  previous,
  next,
) {
  if (!component || !previous || !next || previous === next) return;

  const previousKey = `${component}\u0000${previous}`;
  if (seenDirectivePrevious.has(previousKey)) return;
  seenDirectivePrevious.add(previousKey);

  const key = `${component}\u0000${previous}\u0000${next}`;
  if (seenDirectiveUpdates.has(key)) return;
  seenDirectiveUpdates.add(key);
  directiveUpdates.push({
    Component: component,
    Previous: previous,
    New: next,
  });
}

function normalizeDeprecatedComponents(context, config, mappings) {
  const mappedComponents =
    mappings.deprecatedComponents ??
    Object.fromEntries(
      Object.entries(mappings.components ?? {}).filter(([, component]) => {
        if (!component || typeof component !== 'object') return false;
        return (
          component.contentMigration === false ||
          component.deprecated === true ||
          component.migrateToDeprecated === true ||
          component.migration === 'deprecated'
        );
      }),
    );
  const components = [];

  for (const [name, component] of Object.entries(mappedComponents)) {
    components.push({
      ...(typeof component === 'object'
        ? withoutMappingOnlyFields(component)
        : {}),
      name,
      mapped:
        typeof component === 'object'
          ? withoutMappingOnlyFields(component)
          : {},
    });
  }

  return components;
}

function normalizeContentMigrationEntries(context, mappings) {
  const mappedComponents =
    mappings.contentMigration ??
    Object.fromEntries(
      Object.entries(mappings.components ?? {}).filter(([, component]) => {
        if (!component || typeof component !== 'object') return false;
        return component.contentMigration !== false;
      }),
    );
  const existingComponents = collectExistingComponents();
  const entries = [];

  for (const [previousName, mapped] of Object.entries(mappedComponents)) {
    const component = {
      name: previousName,
      ...(typeof mapped === 'object' ? mapped : {}),
    };
    const targetName = resolveTargetName(component, mapped);
    const source = resolveComponentSource(
      context.componentsRoot,
      component,
      mapped,
      previousName,
    );
    const template = resolveComponentTemplate(
      source,
      previousName,
      component,
      mapped,
    );
    const existingComponent = existingComponents.get(targetName);

    entries.push({
      previousName,
      name: targetName,
      manualDirectiveUpdates: normalizeManualDirectiveUpdates(
        mapped,
        previousName,
      ),
      inferDirectiveUpdates: !hasManualDirectiveUpdates(mapped),
      previousDirectiveNames:
        source || hasInlineTemplate(component, mapped)
          ? getDirectiveNames(template.html, template.ldConf)
          : [],
      newDirectiveNames: existingComponent
        ? getDirectiveNames(existingComponent.html, existingComponent.ldConf)
        : [],
    });
  }

  return entries;
}

function collectFileComponents(componentsRoot) {
  if (!componentsRoot || !existsSync(componentsRoot)) return [];

  const components = [];
  collectFileComponentsInFolder(componentsRoot, componentsRoot, components);
  return components.sort((a, b) => a.source.localeCompare(b.source));
}

function collectFileComponentsInFolder(root, folder, components) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);

    if (entry.isDirectory()) {
      collectFileComponentsInFolder(root, path, components);
      continue;
    }

    if (!['.html', '.vue'].includes(extname(entry.name))) continue;

    components.push({
      name: basename(entry.name, extname(entry.name)),
      source: relative(root, path),
    });
  }
}

function normalizeProperties(config, mappings) {
  return {
    ...(config.componentProperties ?? {}),
    ...(config.properties ?? {}),
    ...(mappings.properties ?? {}),
  };
}

function normalizeScss(context, mappings) {
  const scss = [];
  const globalFiles = mappings.scss?.global ?? [];

  for (const file of globalFiles) {
    const source = join(context.scssRoot, file);
    if (existsSync(source)) {
      scss.push({
        source,
        target: join(root, 'src', 'assets', 'scss', basename(file)),
      });
    }
  }

  return scss;
}

function resolveComponentSource(componentsRoot, component, mapped, name) {
  if (!componentsRoot) return null;
  const candidates = [
    mapped.source,
    component.source,
    component.path,
    component.name,
    name,
    `${component.name}.html`,
    `${component.name}.vue`,
    `${name}.html`,
    `${name}.vue`,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const path = join(componentsRoot, candidate);
    if (existsSync(path)) return path;
  }

  return findComponentFileRecursive(componentsRoot, candidates);
}

function findComponentFileRecursive(root, candidates) {
  const candidateNames = new Set(
    candidates.map((candidate) => basename(candidate)),
  );
  const matches = [];
  findComponentFileMatches(root, candidateNames, matches);
  return matches.sort()[0] ?? null;
}

function findComponentFileMatches(folder, candidateNames, matches) {
  if (!existsSync(folder)) return;

  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);

    if (entry.isDirectory()) {
      findComponentFileMatches(path, candidateNames, matches);
    } else if (
      ['.html', '.vue'].includes(extname(entry.name)) &&
      candidateNames.has(entry.name)
    ) {
      matches.push(path);
    }
  }
}

function resolveComponentTemplate(source, name, component, mapped) {
  if (typeof mapped.html === 'string')
    return parseComponentTemplate(mapped.html);
  if (typeof component.html === 'string')
    return parseComponentTemplate(component.html);
  if (typeof component.template === 'string')
    return parseComponentTemplate(component.template);

  if (source && existsSync(source)) {
    const stat = statSync(source);
    if (stat.isFile()) return readTemplateFile(source);

    const candidates = [
      `${name}.html`,
      `${component.name}.html`,
      'template.html',
      'index.html',
      `${name}.vue`,
      `${component.name}.vue`,
      'index.vue',
    ];

    for (const candidate of candidates) {
      const path = join(source, candidate);
      if (existsSync(path)) return readTemplateFile(path);
    }

    const htmlFile = readdirSync(source).find((file) =>
      ['.html', '.vue'].includes(extname(file)),
    );
    if (htmlFile) return readTemplateFile(join(source, htmlFile));
  }

  return {
    html: `<div class="srl-grid srl-${name}">\n  <div class="srl-grid__inner srl-${name}__inner" doc-editable="${name}">Editable text</div>\n</div>\n`,
    ldConf: {},
  };
}

function readTemplateFile(path) {
  const content = readFileSync(path, 'utf8');
  if (path.endsWith('.vue')) {
    const match = content.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
    return parseComponentTemplate(match ? `${match[1].trim()}\n` : content);
  }
  return parseComponentTemplate(content);
}

function parseComponentTemplate(content) {
  const ldConf = {};
  const html = content.replace(
    /<script\b(?=[^>]*\btype\s*=\s*["']ld-conf["'])[^>]*>([\s\S]*?)<\/script>\s*/gi,
    (match, jsonContent) => {
      try {
        Object.assign(ldConf, JSON.parse(jsonContent));
      } catch (error) {
        console.warn(`Could not parse ld-conf block: ${error.message}`);
      }
      return '';
    },
  );

  return { html, ldConf };
}

function addRootClass(html, className) {
  return html.replace(
    /(<\s*[a-z][\w:-]*\b)([^>]*?)(\/?>)/i,
    (match, start, attributes, end) => {
      const classMatch = attributes.match(/\bclass\s*=\s*(['"])(.*?)\1/i);

      if (!classMatch) {
        return `${start}${attributes} class="${className}"${end}`;
      }

      const classes = classMatch[2].split(/\s+/).filter(Boolean);
      if (classes.includes(className)) return match;

      const nextClassAttribute = `class=${classMatch[1]}${[
        ...classes,
        className,
      ].join(' ')}${classMatch[1]}`;

      return `${start}${attributes.replace(classMatch[0], nextClassAttribute)}${end}`;
    },
  );
}

function createLdConf(templateLdConf, component, mapped, name) {
  const merged = {
    ...templateLdConf,
    ...component,
    ...withoutMappingOnlyFields(mapped),
    ...normalizeMappedLdConf(mapped),
    name,
  };
  const ldConf = {
    name,
    label: merged.label ?? titleCase(name),
  };

  for (const key of knownLdConfKeys) {
    if (key !== 'html' && merged[key] !== undefined) {
      ldConf[key] = merged[key];
    }
  }

  delete ldConf.group;
  delete ldConf.order;
  delete ldConf.source;
  delete ldConf.path;
  delete ldConf.targetName;
  delete ldConf.scss;

  return ldConf;
}

function withoutMappingOnlyFields(mapped) {
  const copy = { ...mapped };
  delete copy.contentMigration;
  delete copy.deprecated;
  delete copy.deprecatedName;
  delete copy.directiveMappings;
  delete copy.directiveNameUpdates;
  delete copy.directiveUpdates;
  delete copy.directives;
  delete copy.legacyName;
  delete copy.migrateToDeprecated;
  delete copy.migration;
  return copy;
}

function normalizeMappedLdConf(mapped) {
  return {
    ...(mapped.ldConf ?? {}),
    ...(mapped.ldConfDirectives ? { directives: mapped.ldConfDirectives } : {}),
  };
}

function resolveComponentScss(scssRoot, component, mapped) {
  if (!scssRoot) return [];

  const files = [];
  const configured = mapped.scss ?? component.scss;
  if (typeof configured === 'string') {
    files.push({
      source: join(scssRoot, configured),
      targetName: 'general.scss',
    });
  } else if (Array.isArray(configured)) {
    configured.forEach((file) =>
      files.push({ source: join(scssRoot, file), targetName: basename(file) }),
    );
  } else if (configured && typeof configured === 'object') {
    for (const [targetName, file] of Object.entries(configured)) {
      files.push({
        source: join(scssRoot, file),
        targetName: targetName.endsWith('.scss')
          ? targetName
          : `${targetName}.scss`,
      });
    }
  }

  const defaultCandidates = [
    join(scssRoot, 'components', `${component.name}.scss`),
    join(scssRoot, `${component.name}.scss`),
  ];

  for (const source of defaultCandidates) {
    if (existsSync(source)) files.push({ source, targetName: 'general.scss' });
  }

  return files.filter(
    (file, index, list) =>
      existsSync(file.source) &&
      list.findIndex(
        (item) =>
          item.source === file.source && item.targetName === file.targetName,
      ) === index,
  );
}

function writeProperties(context, properties) {
  for (const [name, property] of Object.entries(properties)) {
    const target = join(
      livingdocsRoot,
      '999.Properties',
      name,
      'properties.json',
    );
    writeJsonFile(context, target, { [name]: property });
  }
}

function writeComponents(context, components) {
  for (const component of components) {
    mkdirSync(component.targetFolder, { recursive: true });
    writeTextFile(
      context,
      join(component.targetFolder, component.htmlFileName),
      component.html,
    );
    writeJsonFile(
      context,
      join(component.targetFolder, 'ld-conf.json'),
      component.ldConf,
    );

    for (const scss of component.scss) {
      const target = join(component.targetFolder, 'scss', scss.targetName);
      writeTextFile(
        context,
        target,
        convertScssImports(readFileSync(scss.source, 'utf8')),
      );
    }
  }
}

function writeScss(context, scssFiles) {
  for (const file of scssFiles) {
    writeTextFile(
      context,
      file.target,
      convertScssImports(readFileSync(file.source, 'utf8')),
    );
  }
}

function mergeLivingdocsConfig(plan) {
  const target = join(root, 'livingdocs.config.json');
  const config = readOptionalJson(target) ?? {};
  config.imageRatios = {
    ...(config.imageRatios ?? {}),
    ...(plan.imageRatios ?? {}),
  };
  const deprecatedGroups = (config.groups ?? []).filter(
    (group) => group.label?.toLowerCase() === 'deprecated',
  );
  const oldDeprecatedComponentNames = new Set(
    deprecatedGroups.flatMap((group) => group.components ?? []),
  );
  const nextDeprecatedComponentNames = plan.components.map(
    (component) => component.name,
  );
  const nextDeprecatedComponentNameSet = new Set(nextDeprecatedComponentNames);

  config.components = (config.components ?? []).filter(
    (component) =>
      !oldDeprecatedComponentNames.has(component.name) &&
      !nextDeprecatedComponentNameSet.has(component.name),
  );
  config.components.push(
    ...plan.components.map((component) => ({
      ...component.ldConf,
      html: component.html,
    })),
  );

  config.groups = (config.groups ?? []).filter(
    (group) => group.label?.toLowerCase() !== 'deprecated',
  );
  if (nextDeprecatedComponentNames.length > 0) {
    const deprecatedGroupConfig = {
      label: 'deprecated',
      components: nextDeprecatedComponentNames,
    };
    const propertiesIndex = config.groups.findIndex(
      (group) => group.label === 'Properties',
    );
    if (propertiesIndex >= 0) {
      config.groups.splice(propertiesIndex, 0, deprecatedGroupConfig);
    } else {
      config.groups.push(deprecatedGroupConfig);
    }
  }
  writeJsonFile({ force: true }, target, config);
}

function writeControlFile(context, plan) {
  mkdirSync(join(controlFilePath, '..'), { recursive: true });
  writeFileSync(controlFilePath, createControlFileContent(context, plan));
  console.log(`Write ${relative(root, controlFilePath)}`);
}

function writeContentMigrationFile(context, plan) {
  writeJsonFile(
    { ...context, force: true },
    contentMigrationFilePath,
    plan.contentMigration,
  );
}

function createControlFileContent(context, plan) {
  const lines = [
    '# Legacy Migration Control',
    '',
    `Migration source: \`${relative(root, context.sourceRoot) || '.'}\``,
    `Legacy target: \`${relative(root, join(livingdocsRoot, deprecatedGroup))}\``,
    `Components to migrate: ${plan.components.length}`,
    `Skipped existing components: ${plan.skippedComponents.length}`,
    `Properties: ${Object.keys(plan.properties).length}`,
    `Image ratios: ${Object.keys(plan.imageRatios ?? {}).length}`,
    '',
    '## Manual Checks',
    '',
    '- Existing Livingdocs groups outside `livingdocs/998.deprecated` are still present.',
    '- Deprecated component folder numbering is continuous, starting at `001`.',
    '- Every migrated component root element contains the `deprecated` class.',
    '- Skipped components already exist as non-deprecated Livingdocs components.',
    '- Placeholder components are reviewed manually.',
    '- SCSS files were copied and `@import` statements were converted as expected.',
    '',
    '## Migrated Components',
    '',
  ];

  if (plan.components.length === 0) {
    lines.push('No legacy components are scheduled for migration.', '');
  } else {
    lines.push('| Order | Name | Target | Source | SCSS files |');
    lines.push('| --- | --- | --- | --- | --- |');

    for (const component of plan.components) {
      lines.push(
        `| ${[
          component.order,
          `\`${component.name}\``,
          `\`${relative(root, component.targetFolder)}\``,
          component.source
            ? `\`${relative(root, component.source)}\``
            : '**placeholder**',
          component.scss.length
            ? component.scss
                .map((scss) => `\`${scss.targetName}\``)
                .join('<br>')
            : '-',
        ].join(' | ')} |`,
      );
    }

    lines.push('');
  }

  lines.push('## Skipped Existing Components', '');

  if (plan.skippedComponents.length === 0) {
    lines.push('No legacy components were skipped.', '');
  } else {
    for (const name of plan.skippedComponents) {
      lines.push(`- \`${name}\``);
    }
    lines.push('');
  }

  lines.push(
    '## Generated Files',
    '',
    '- `livingdocs/998.deprecated/<order>.<component>/<component>.html`',
    '- `livingdocs/998.deprecated/<order>.<component>/ld-conf.json`',
    '- `livingdocs/998.deprecated/<order>.<component>/scss/*.scss`',
    '- `livingdocs/999.Properties/<property>/properties.json`',
    '- `src/assets/scss/*.scss`',
    '- `livingdocs.config.json`',
    '- `migration/control.md`',
    '- `migration/content-migration.json`',
    '',
  );

  return `${lines.join('\n')}\n`;
}

function writeTextFile(context, target, content) {
  if (existsSync(target) && !context.force) {
    console.log(
      `Skip existing ${relative(root, target)} (use --force to overwrite)`,
    );
    return;
  }
  mkdirSync(join(target, '..'), { recursive: true });
  writeFileSync(target, content);
  console.log(`Write ${relative(root, target)}`);
}

function writeJsonFile(context, target, content) {
  writeTextFile(context, target, `${JSON.stringify(content, null, 2)}\n`);
}

function convertScssImports(content) {
  return content.replace(/@import\s+([^;]+);/g, '@use $1 as *;');
}

function printPlan(context, plan) {
  console.log(`Migration source: ${relative(root, context.sourceRoot) || '.'}`);
  console.log(`Components: ${plan.components.length}`);
  console.log(`Skipped existing components: ${plan.skippedComponents.length}`);
  console.log(`Properties: ${Object.keys(plan.properties).length}`);
  console.log(`Image ratios: ${Object.keys(plan.imageRatios ?? {}).length}`);
  console.log(
    `Legacy target: ${relative(root, join(livingdocsRoot, deprecatedGroup))}`,
  );
}

function readOptionalJson(path) {
  if (!path || !existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
}

function firstExisting(paths) {
  return paths.find((path) => path && existsSync(path)) ?? paths[0];
}

function titleCase(value) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizePath(path) {
  return path.replaceAll('\\', '/');
}

function resolveProjectPath(path) {
  return isAbsolute(path) ? path : join(root, path);
}
