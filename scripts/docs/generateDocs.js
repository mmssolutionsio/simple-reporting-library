import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import folders from '../folders.js';

const SCSS_API_PATTERN =
  /@(mixin|function)\s+([\w-]+)\s*(\([^)]*\))?|^%([\w-]+)|^\$([\w-]+)\s*:/gm;
const PROPERTY_EXTENSIONS = new Set(['.json', '.js', '.ts']);
const COMPONENT_FILE_NAMES = new Set(['ld-conf.json', 'docs.md']);
const sourcePackageRoot = fileURLToPath(new URL('../..', import.meta.url));
const RELEASES_URL =
  'https://github.com/mmssolutionsio/simple-reporting-library/releases';
const RELEASES_API_URL =
  'https://api.github.com/repos/mmssolutionsio/simple-reporting-library/releases?per_page=30';
const RELEASE_CACHE_MAX_AGE = 6 * 60 * 60 * 1000;

function packageRootFromOptions(options) {
  if (options.packageRoot) return options.packageRoot;
  return existsSync(folders.packagePath)
    ? folders.packagePath
    : sourcePackageRoot;
}

function toPosix(path) {
  return path.split(sep).join('/');
}

function displayPath(path, projectRoot, packageRoot) {
  if (path.startsWith(projectRoot)) {
    return toPosix(relative(projectRoot, path));
  }
  if (path.startsWith(packageRoot)) {
    return `@simple-reporting/base/${toPosix(relative(packageRoot, path))}`;
  }
  return toPosix(path);
}

function walkFiles(root, predicate = () => true) {
  if (!existsSync(root)) return [];

  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(path, predicate));
    } else if (entry.isFile() && predicate(path)) {
      files.push(path);
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

function readText(path) {
  return readFileSync(path, 'utf8');
}

function readJson(path, issues) {
  try {
    return JSON.parse(readText(path));
  } catch (error) {
    issues.push({
      severity: 'error',
      code: 'invalid-json',
      message: `Invalid JSON: ${error.message}`,
      path,
    });
    return null;
  }
}

function documentationBefore(source, index) {
  const lines = source.slice(0, index).split('\n');
  const documentation = [];

  for (let lineIndex = lines.length - 1; lineIndex >= 0; lineIndex -= 1) {
    const line = lines[lineIndex].trim();
    if (line === '') continue;
    if (line.startsWith('///')) {
      documentation.unshift(line.replace(/^\/\/\/\s?/, ''));
      continue;
    }
    break;
  }

  const annotations = {};
  const description = [];
  let activeAnnotation = null;
  for (const line of documentation) {
    const annotation = line.match(/^@(\w+)\s*(.*)$/);
    if (annotation) {
      annotations[annotation[1]] ||= [];
      annotations[annotation[1]].push(annotation[2]);
      activeAnnotation = annotation[1];
    } else if (activeAnnotation) {
      const values = annotations[activeAnnotation];
      values[values.length - 1] += `\n${line}`;
    } else {
      description.push(line);
    }
  }

  return {
    description: description.join('\n').trim(),
    annotations,
  };
}

function documentedExample(annotations) {
  const example = annotations.example?.[0]?.trim();
  if (!example) return '';
  return example.replace(/^scss(?:\s+-[^\n]*)?\n?/, '').trim();
}

function apiArguments(params) {
  return (params.match(/\$[\w-]+/g) || []).join(', ');
}

function apiUsage(scope, moduleName, type, name, params, annotations) {
  const example = documentedExample(annotations);
  if (example) return example;
  const argumentsList = apiArguments(params);

  if (scope === 'global' && moduleName === 'fa') {
    if (type === 'mixin') return `@include fa.${name}(${argumentsList});`;
    if (type === 'function') return `fa.${name}(${argumentsList})`;
    if (type === 'variable') return `fa.$${name}`;
  }
  if (scope === 'global' && moduleName && moduleName !== 'fa') {
    const exportedName = moduleName === 'meta' ? name : `${moduleName}-${name}`;
    if (type === 'mixin')
      return `@include srl.${exportedName}(${argumentsList});`;
    if (type === 'function') return `srl.${exportedName}(${argumentsList})`;
    if (type === 'variable') return `srl.$${exportedName}`;
  }
  if (type === 'placeholder') return `@extend %${name};`;
  if (type === 'mixin') return `@include ${name}(${argumentsList});`;
  if (type === 'function') return `${name}(${argumentsList})`;
  return `$${name}`;
}

function parseScssApi(source, file) {
  const api = [];
  for (const match of source.matchAll(SCSS_API_PATTERN)) {
    const declarationType = match[1] || (match[4] ? 'placeholder' : 'variable');
    const name = match[2] || match[4] || match[5];
    const params = match[3] || '';
    const line = source.slice(0, match.index).split('\n').length;
    const declarationLine = source.slice(match.index).split('\n')[0];
    const value =
      declarationType === 'variable'
        ? declarationLine
            .slice(declarationLine.indexOf(':') + 1)
            .replace(/\s*!default\s*;?\s*$/, '')
            .replace(/;\s*$/, '')
            .trim()
        : '';
    const docs = documentationBefore(source, match.index);
    const isPrivate =
      name.startsWith('_') || docs.annotations.access?.includes('private');

    api.push({
      id: `${file.id}:${declarationType}:${name}:${line}`,
      type: declarationType,
      name,
      signature:
        declarationType === 'placeholder'
          ? `%${name}`
          : declarationType === 'variable'
            ? `$${name}`
            : `@${declarationType} ${name}${params}`,
      params,
      value,
      line,
      description: docs.description,
      annotations: docs.annotations,
      private: Boolean(isPrivate),
      usage: apiUsage(
        file.scope,
        file.module,
        declarationType,
        name,
        params,
        docs.annotations,
      ),
      fileId: file.id,
      path: file.path,
      scope: file.scope,
      module: file.module,
    });
  }
  return api;
}

export function groupScssVariables(api) {
  const groups = new Map();

  for (const variable of api.filter(
    (item) =>
      item.scope === 'global' && item.type === 'variable' && !item.private,
  )) {
    const semanticKey = variable.name + '\u0000' + variable.description;
    if (!groups.has(semanticKey)) {
      groups.set(semanticKey, {
        id: variable.module + ':' + variable.name,
        name: variable.name,
        description: variable.description,
        types: [],
        declarations: [],
      });
    }
    const group = groups.get(semanticKey);
    for (const type of variable.annotations.type || []) {
      if (!group.types.includes(type)) group.types.push(type);
    }
    group.declarations.push({
      module: variable.module,
      path: variable.path,
      line: variable.line,
      value: variable.value,
      usage: variable.usage,
    });
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      id:
        group.declarations.length > 1
          ? 'shared:' + group.name
          : group.declarations[0].module + ':' + group.name,
      declarations: group.declarations.sort((a, b) =>
        a.module.localeCompare(b.module),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function collectMarginGroups(projectRoot, components, issues) {
  const configPath = join(projectRoot, 'srl.config.json');
  if (!existsSync(configPath)) return [];
  const config = readJson(configPath, issues);
  const groups = config?.spacer?.margins?.group;
  if (!groups || typeof groups !== 'object' || Array.isArray(groups)) return [];

  return Object.entries(groups)
    .map(([name, rules]) => {
      const className = `srl-margin-group-${name}`;
      const usedBy = components
        .filter((component) => {
          return (
            component.html.includes(className) ||
            component.styles.some((style) =>
              style.source.includes(`spacer-component-margin(${name})`),
            )
          );
        })
        .map((component) => ({
          id: component.id,
          name: component.name,
          label: component.label,
        }));

      return {
        name,
        className,
        configPath: 'srl.config.json',
        rules: Object.entries(rules || {}).map(([target, spacer]) => ({
          target,
          selector: target === 'all' ? '*' : `.srl-${target}`,
          spacer,
        })),
        usage: `@include srl.spacer-component-margin(${name});`,
        usedBy,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function inferTarget(path, scopeRoot) {
  const relativePath = toPosix(relative(scopeRoot, path));
  const fileName = basename(path, '.scss');
  const targets = new Set([
    'general',
    'app',
    'web',
    'editor',
    'ldd',
    'pdf',
    'word',
    'xbrl',
    'print',
  ]);
  if (targets.has(fileName)) return fileName;
  if (relativePath.includes('/placeholders/')) return 'placeholder';
  return 'shared';
}

function collectScssSource({ scope, label, root, projectRoot, packageRoot }) {
  const paths = walkFiles(root, (path) => extname(path) === '.scss');
  const files = paths.map((path) => {
    const relativePath = toPosix(relative(root, path));
    const firstSegment = relativePath.split('/')[0];
    const moduleName =
      scope === 'global'
        ? relativePath.includes('/')
          ? firstSegment
          : basename(path, '.scss')
        : dirname(relativePath) === '.'
          ? 'root'
          : toPosix(dirname(relativePath));
    const file = {
      id: `${scope}:${relativePath}`,
      scope,
      scopeLabel: label,
      path: displayPath(path, projectRoot, packageRoot),
      relativePath,
      module: moduleName,
      target: inferTarget(path, root),
      source: readText(path),
    };
    file.api = parseScssApi(file.source, file);
    return file;
  });

  return {
    source: {
      id: scope,
      label,
      root: displayPath(root, projectRoot, packageRoot),
      exists: existsSync(root),
      fileCount: files.length,
    },
    files,
  };
}

function componentNameFromFolder(folder) {
  const parts = folder.split('.');
  return parts.length > 1 ? parts.slice(1).join('.') : folder;
}

function groupLabel(group) {
  const label = componentNameFromFolder(group);
  return label.replaceAll('_and_', ' / ').replaceAll('_', ' ');
}

function collectProperties(livingdocsRoot, projectRoot, packageRoot, issues) {
  const definitions = new Map();
  const propertyFiles = walkFiles(livingdocsRoot, (path) => {
    return (
      basename(path).startsWith('properties.') &&
      PROPERTY_EXTENSIONS.has(extname(path))
    );
  });

  for (const path of propertyFiles) {
    const relativePath = toPosix(relative(livingdocsRoot, path));
    const segments = relativePath.split('/');
    const group = segments[0] || '';
    const componentFolder = segments[1] || '';
    const scope = group.includes('Properties') ? 'global' : 'component';
    let values = null;

    if (extname(path) === '.json') {
      values = readJson(path, issues);
    } else {
      issues.push({
        severity: 'info',
        code: 'dynamic-properties',
        message:
          'Dynamic properties are listed but cannot be evaluated by the static docs generator.',
        path,
      });
    }

    if (!values || typeof values !== 'object' || Array.isArray(values))
      continue;
    for (const [name, value] of Object.entries(values)) {
      const definition = {
        name,
        scope,
        group,
        component: componentNameFromFolder(componentFolder),
        path: displayPath(path, projectRoot, packageRoot),
        value,
      };
      definitions.set(name, [...(definitions.get(name) || []), definition]);
    }
  }

  return definitions;
}

function collectComponents(
  livingdocsRoot,
  propertyDefinitions,
  projectRoot,
  packageRoot,
  issues,
) {
  if (!existsSync(livingdocsRoot)) return [];
  const components = [];

  for (const group of readdirSync(livingdocsRoot).sort()) {
    const groupPath = join(livingdocsRoot, group);
    if (!statSync(groupPath).isDirectory() || group.includes('Properties'))
      continue;

    for (const componentFolder of readdirSync(groupPath).sort()) {
      const componentPath = join(groupPath, componentFolder);
      if (!statSync(componentPath).isDirectory()) continue;

      const paths = walkFiles(componentPath);
      const configPath = paths.find(
        (path) => basename(path) === 'ld-conf.json',
      );
      const htmlPath = paths.find((path) => extname(path) === '.html');
      if (!configPath && !htmlPath) continue;

      const config = configPath ? readJson(configPath, issues) : null;
      const fallbackName = componentNameFromFolder(componentFolder);
      const name = config?.name || fallbackName;
      const propertyNames = Array.isArray(config?.properties)
        ? config.properties
        : [];
      const properties = propertyNames.map((propertyName) => {
        const propertyMatches = propertyDefinitions.get(propertyName) || [];
        if (!propertyMatches.length) {
          issues.push({
            severity: 'error',
            code: 'missing-property',
            message: `Component "${name}" references unknown property "${propertyName}".`,
            path: configPath,
          });
        }
        return {
          name: propertyName,
          status: propertyMatches.length ? 'resolved' : 'missing',
          definitions: propertyMatches,
        };
      });
      const stylePaths = paths.filter((path) => extname(path) === '.scss');
      const docsPath = paths.find((path) => basename(path) === 'docs.md');

      if (!configPath) {
        issues.push({
          severity: 'error',
          code: 'missing-component-config',
          message: `Component "${fallbackName}" has HTML but no ld-conf.json.`,
          path: componentPath,
        });
      }
      if (!htmlPath) {
        issues.push({
          severity: 'error',
          code: 'missing-component-html',
          message: `Component "${name}" has no HTML template.`,
          path: componentPath,
        });
      }

      components.push({
        id: `${group}/${componentFolder}`,
        name,
        label: config?.label || name,
        group,
        groupLabel: groupLabel(group),
        folder: componentFolder,
        path: displayPath(componentPath, projectRoot, packageRoot),
        config,
        configPath: configPath
          ? displayPath(configPath, projectRoot, packageRoot)
          : null,
        configSource: configPath ? readText(configPath) : '',
        htmlPath: htmlPath
          ? displayPath(htmlPath, projectRoot, packageRoot)
          : null,
        html: htmlPath ? readText(htmlPath) : '',
        docsPath: docsPath
          ? displayPath(docsPath, projectRoot, packageRoot)
          : null,
        docs: docsPath ? readText(docsPath) : '',
        vueFiles: paths
          .filter((path) => extname(path) === '.vue')
          .map((path) => ({
            path: displayPath(path, projectRoot, packageRoot),
            source: readText(path),
          })),
        styles: stylePaths.map((path) => ({
          path: displayPath(path, projectRoot, packageRoot),
          target: inferTarget(path, join(componentPath, 'scss')),
          source: readText(path),
        })),
        properties,
      });
    }
  }
  return components;
}

function publicIssuePath(issue, projectRoot, packageRoot) {
  return {
    ...issue,
    path: issue.path ? displayPath(issue.path, projectRoot, packageRoot) : null,
  };
}

function guides() {
  return [
    {
      id: 'architecture',
      title: 'How SRL styles are assembled',
      sections: [
        {
          title: 'Three SCSS layers',
          text: 'Global SRL modules provide reusable functions, mixins and variables. Project styles under src/assets/scss configure and compose those primitives. Livingdocs styles belong to a component or a shared property and are split by output target.',
        },
        {
          title: 'Build targets',
          text: 'general.scss is shared by app, editor, PDF and Word. app.scss is application-only. editor.scss and ldd.scss target Livingdocs. pdf.scss, word.scss and xbrl.scss are output-specific. web.scss is commonly reused by app.scss and editor.scss through @use.',
        },
        {
          title: 'Using the public API',
          text: 'Import the SRL facade with @use "srl". Global modules are forwarded with prefixes, for example grid.media becomes srl.grid-media and spacer.get becomes srl.spacer-get.',
          code: '@use "srl";\n\n.example {\n  @include srl.grid-media-up(tablet-pt) {\n    padding: srl.spacer-get(200);\n  }\n}',
        },
        {
          title: 'Component margin groups',
          text: 'Margin groups define consistent vertical rhythm between component families such as paragraphs and lists. Configure transitions under spacer.margins.group, add srl-margin-group-<name> to the source component HTML, and generate its selectors once with spacer-component-margin. The SCSS → Margin groups view lists every configured transition and its component usage.',
          code: '<p class="srl-paragraph srl-margin-group-text">…</p>\n\n@include srl.spacer-component-margin(text);',
        },
      ],
    },
    {
      id: 'components',
      title: 'Livingdocs component anatomy',
      sections: [
        {
          title: 'Required files',
          text: 'A component combines an HTML template with ld-conf.json. The configuration supplies its name, label and property references. Optional properties.json definitions, Vue files and target-specific SCSS live beside them.',
        },
        {
          title: 'Properties',
          text: 'All properties.json, properties.js and properties.ts files are flattened into the Livingdocs componentProperties registry. The 999.Properties group is the convention for reusable definitions; component-local definitions enter the same final registry.',
        },
        {
          title: 'Target styles',
          text: 'Keep shared rules in general.scss, browser rules in web.scss, and add small entry files for app/editor. PDF, Word and XBRL differences should remain in their explicit target files.',
        },
      ],
    },
    {
      id: 'documentation',
      title: 'Documentation conventions',
      sections: [
        {
          title: 'SCSS APIs',
          text: 'Place SassDoc-compatible /// comments directly above public mixins, functions, variables and placeholders. Document intent, parameters, target limitations and at least one real usage example.',
        },
        {
          title: 'Component notes',
          text: 'Add an optional docs.md next to ld-conf.json for behavior that cannot be inferred from code, such as editorial intent, accessibility constraints or PDF-specific caveats.',
        },
        {
          title: 'Generated data',
          text: 'The file .srl/docs/data.json is generated. Change the SCSS, component files or docs.md source instead of editing generated documentation.',
        },
      ],
    },
  ];
}

export function buildDocsData(options = {}) {
  const projectRoot = options.projectRoot || folders.root;
  const packageRoot = packageRootFromOptions(options);
  const issues = [];
  const projectLivingdocsRoot = join(projectRoot, 'livingdocs');
  const packageLivingdocsRoot = join(packageRoot, 'livingdocs');
  const livingdocsRoot = existsSync(projectLivingdocsRoot)
    ? projectLivingdocsRoot
    : packageLivingdocsRoot;
  const scssCollections = [
    collectScssSource({
      scope: 'global',
      label: 'Global SRL SCSS',
      root: join(packageRoot, 'scss'),
      projectRoot,
      packageRoot,
    }),
    collectScssSource({
      scope: 'project',
      label: 'Project SCSS',
      root: join(projectRoot, 'src', 'assets', 'scss'),
      projectRoot,
      packageRoot,
    }),
    collectScssSource({
      scope: 'livingdocs',
      label: 'Livingdocs SCSS',
      root: livingdocsRoot,
      projectRoot,
      packageRoot,
    }),
  ];
  const scssFiles = scssCollections.flatMap((collection) => collection.files);
  const propertyDefinitions = collectProperties(
    livingdocsRoot,
    projectRoot,
    packageRoot,
    issues,
  );
  const components = collectComponents(
    livingdocsRoot,
    propertyDefinitions,
    projectRoot,
    packageRoot,
    issues,
  );

  const properties = [...propertyDefinitions.entries()]
    .map(([name, definitions]) => {
      const usedBy = components
        .filter((component) =>
          component.properties.some((property) => property.name === name),
        )
        .map((component) => ({
          id: component.id,
          name: component.name,
          label: component.label,
        }));
      if (definitions.length > 1) {
        issues.push({
          severity: 'error',
          code: 'duplicate-property',
          message: `Property "${name}" is defined ${definitions.length} times and is order-dependent.`,
          path: definitions[0].path,
        });
      }
      return { name, definitions, usedBy, duplicate: definitions.length > 1 };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const packageJsonPath = join(packageRoot, 'package.json');
  const projectPackageJsonPath = join(projectRoot, 'package.json');
  const packageJson = existsSync(packageJsonPath)
    ? readJson(packageJsonPath, issues)
    : null;
  const projectPackageJson = existsSync(projectPackageJsonPath)
    ? readJson(projectPackageJsonPath, issues)
    : null;
  const api = scssFiles.flatMap((file) => file.api);
  const publicApi = api.filter(
    (item) =>
      item.scope === 'global' &&
      !item.private &&
      (item.type === 'mixin' || item.type === 'function'),
  );
  const publicVariables = api.filter(
    (item) =>
      item.scope === 'global' && item.type === 'variable' && !item.private,
  );
  const variableGroups = groupScssVariables(api);
  const marginGroups = collectMarginGroups(projectRoot, components, issues);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      packageName: packageJson?.name || '@simple-reporting/base',
      packageVersion: packageJson?.version || 'development',
      projectName: projectPackageJson?.name || basename(projectRoot),
      stats: {
        scssFiles: scssFiles.length,
        scssApi: api.length,
        documentedScssApi: publicApi.filter((item) => item.description).length,
        publicScssApi: publicApi.length,
        documentedScssVariables: publicVariables.filter(
          (item) => item.description,
        ).length,
        publicScssVariables: publicVariables.length,
        marginGroups: marginGroups.length,
        components: components.length,
        properties: properties.length,
        issues: issues.length,
      },
    },
    guides: guides(),
    scss: {
      sources: scssCollections.map((collection) => collection.source),
      files: scssFiles,
      api,
      variableGroups,
      marginGroups,
    },
    components,
    properties,
    issues: issues.map((issue) =>
      publicIssuePath(issue, projectRoot, packageRoot),
    ),
  };
}

export function normalizeGitHubReleases(payload) {
  if (!Array.isArray(payload)) return [];

  return payload
    .filter((release) => !release?.draft && release?.tag_name)
    .map((release) => ({
      version: String(release.tag_name).replace(/^v/, ''),
      tag: String(release.tag_name),
      name: String(release.name || release.tag_name),
      body: String(release.body || '').trim(),
      url: String(release.html_url || RELEASES_URL),
      publishedAt: String(release.published_at || release.created_at || ''),
      prerelease: Boolean(release.prerelease),
    }));
}

function readCachedChangelog(outputPath) {
  if (!existsSync(outputPath)) return null;
  try {
    const changelog = JSON.parse(readText(outputPath)).changelog;
    return Array.isArray(changelog?.releases) ? changelog : null;
  } catch {
    return null;
  }
}

async function loadChangelog(outputPath, options = {}) {
  const cached = readCachedChangelog(outputPath);
  const now = options.now || Date.now();
  const cacheAge = cached?.fetchedAt
    ? now - new Date(cached.fetchedAt).getTime()
    : Number.POSITIVE_INFINITY;

  if (!options.refreshReleases && cached && cacheAge < RELEASE_CACHE_MAX_AGE) {
    return cached;
  }

  try {
    const fetchReleases = options.fetch || globalThis.fetch;
    if (!fetchReleases) throw new Error('Fetch is not available.');
    const response = await fetchReleases(RELEASES_API_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': '@simple-reporting/base docs generator',
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error(`GitHub returned HTTP ${response.status}.`);
    }
    const releases = normalizeGitHubReleases(await response.json());
    if (!releases.length) throw new Error('GitHub returned no releases.');
    return {
      source: 'github',
      status: 'current',
      releasesUrl: RELEASES_URL,
      fetchedAt: new Date(now).toISOString(),
      latestVersion: releases[0].version,
      releases,
    };
  } catch (error) {
    if (cached?.releases?.length) {
      return {
        ...cached,
        status: 'cached',
        warning: `Release data could not be refreshed: ${error.message}`,
      };
    }
    return {
      source: 'github',
      status: 'unavailable',
      releasesUrl: RELEASES_URL,
      fetchedAt: '',
      latestVersion: '',
      warning: `Release data is unavailable: ${error.message}`,
      releases: [],
    };
  }
}

export async function generateDocs(options = {}) {
  const projectRoot = options.projectRoot || folders.root;
  const outputPath =
    options.outputPath || join(projectRoot, '.srl', 'docs', 'data.json');
  const data = buildDocsData(options);
  data.changelog = await loadChangelog(outputPath, options);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  return { data, outputPath };
}

export function isDocsSource(path, options = {}) {
  const projectRoot = options.projectRoot || folders.root;
  const packageRoot = packageRootFromOptions(options);
  const normalizedPath = toPosix(path);
  const roots = [
    join(packageRoot, 'scss'),
    join(packageRoot, 'livingdocs'),
    join(projectRoot, 'src', 'assets', 'scss'),
    join(projectRoot, 'livingdocs'),
  ].map(toPosix);
  if (!roots.some((root) => normalizedPath.startsWith(`${root}/`)))
    return false;
  const extension = extname(path);
  return (
    extension === '.scss' ||
    extension === '.html' ||
    extension === '.vue' ||
    PROPERTY_EXTENSIONS.has(extension) ||
    COMPONENT_FILE_NAMES.has(basename(path))
  );
}

export default generateDocs;
