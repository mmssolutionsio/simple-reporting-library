<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import docsData from '../../docs/data.json';

type Section =
  | 'overview'
  | 'changelog'
  | 'scss'
  | 'components'
  | 'properties'
  | 'issues';

interface DocsData {
  meta: {
    generatedAt: string;
    packageName: string;
    packageVersion: string;
    projectName: string;
    stats: Record<string, number>;
  };
  guides: Array<{
    id: string;
    title: string;
    sections: Array<{ title: string; text: string; code?: string }>;
  }>;
  scss: {
    sources: Array<{
      id: string;
      label: string;
      root: string;
      exists: boolean;
      fileCount: number;
    }>;
    files: ScssFile[];
    api: ScssApi[];
    variableGroups: VariableGroup[];
    marginGroups: MarginGroup[];
  };
  components: LivingdocsComponent[];
  properties: ComponentProperty[];
  changelog: {
    source: string;
    status: 'current' | 'cached' | 'unavailable';
    releasesUrl: string;
    fetchedAt: string;
    latestVersion: string;
    warning?: string;
    releases: Release[];
  };
  issues: DocsIssue[];
}

interface Release {
  version: string;
  tag: string;
  name: string;
  body: string;
  url: string;
  publishedAt: string;
  prerelease: boolean;
}

interface ScssFile {
  id: string;
  scope: string;
  scopeLabel: string;
  path: string;
  relativePath: string;
  module: string;
  target: string;
  source: string;
  api: ScssApi[];
}

interface ScssApi {
  id: string;
  type: string;
  name: string;
  signature: string;
  line: number;
  description: string;
  annotations: Record<string, string[]>;
  private: boolean;
  usage: string;
  fileId: string;
  path: string;
  scope: string;
  module: string;
}

interface VariableGroup {
  id: string;
  name: string;
  description: string;
  types: string[];
  declarations: Array<{
    module: string;
    path: string;
    line: number;
    value: string;
    usage: string;
  }>;
}

interface MarginGroup {
  name: string;
  className: string;
  configPath: string;
  rules: Array<{ target: string; selector: string; spacer: unknown }>;
  usage: string;
  usedBy: Array<{ id: string; name: string; label: string }>;
}

interface PropertyDefinition {
  name: string;
  scope: string;
  group: string;
  component: string;
  path: string;
  value: Record<string, unknown>;
}

interface LivingdocsComponent {
  id: string;
  name: string;
  label: string;
  group: string;
  groupLabel: string;
  path: string;
  config: Record<string, unknown> | null;
  configPath: string | null;
  configSource: string;
  htmlPath: string | null;
  html: string;
  docsPath: string | null;
  docs: string;
  vueFiles: Array<{ path: string; source: string }>;
  styles: Array<{ path: string; target: string; source: string }>;
  properties: Array<{
    name: string;
    status: string;
    definitions: PropertyDefinition[];
  }>;
}

interface ComponentProperty {
  name: string;
  definitions: PropertyDefinition[];
  usedBy: Array<{ id: string; name: string; label: string }>;
  duplicate: boolean;
}

interface DocsIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  path: string | null;
}

const docs = docsData as unknown as DocsData;
const section = ref<Section>('overview');
const search = ref('');
const scssScope = ref('all');
const scssMode = ref<'api' | 'variables' | 'files' | 'groups'>('api');
const showPrivateApi = ref(false);
const selectedScssId = ref('');
const selectedComponentId = ref('');
const selectedPropertyName = ref('');
const componentCode = ref('html');
const selectedStylePath = ref('');

const normalizedSearch = computed(() =>
  search.value.trim().toLocaleLowerCase(),
);

const filteredApi = computed(() =>
  docs.scss.api.filter((item) => {
    if (item.type === 'variable') return false;
    if (scssScope.value !== 'all' && item.scope !== scssScope.value)
      return false;
    if (!showPrivateApi.value && item.private) return false;
    if (!normalizedSearch.value) return true;
    return `${item.name} ${item.signature} ${item.path} ${item.module}`
      .toLocaleLowerCase()
      .includes(normalizedSearch.value);
  }),
);

const filteredVariableGroups = computed(() =>
  docs.scss.variableGroups.filter((group) => {
    if (!normalizedSearch.value) return true;
    return (
      group.name +
      ' ' +
      group.description +
      ' ' +
      group.declarations.map((item) => item.module).join(' ')
    )
      .toLocaleLowerCase()
      .includes(normalizedSearch.value);
  }),
);

const filteredScssFiles = computed(() =>
  docs.scss.files.filter((file) => {
    if (scssScope.value !== 'all' && file.scope !== scssScope.value)
      return false;
    if (!normalizedSearch.value) return true;
    return `${file.path} ${file.module} ${file.target}`
      .toLocaleLowerCase()
      .includes(normalizedSearch.value);
  }),
);

const filteredMarginGroups = computed(() =>
  docs.scss.marginGroups.filter((group) => {
    if (!normalizedSearch.value) return true;
    return `${group.name} ${group.className} ${group.rules.map((rule) => rule.target).join(' ')} ${group.usedBy.map((component) => component.label).join(' ')}`
      .toLocaleLowerCase()
      .includes(normalizedSearch.value);
  }),
);

const filteredComponents = computed(() =>
  docs.components.filter((component) => {
    if (!normalizedSearch.value) return true;
    return `${component.name} ${component.label} ${component.groupLabel} ${component.path}`
      .toLocaleLowerCase()
      .includes(normalizedSearch.value);
  }),
);

const filteredProperties = computed(() =>
  docs.properties.filter((property) => {
    if (!normalizedSearch.value) return true;
    return `${property.name} ${property.definitions.map((definition) => definition.path).join(' ')}`
      .toLocaleLowerCase()
      .includes(normalizedSearch.value);
  }),
);

const filteredReleases = computed(() =>
  docs.changelog.releases.filter((release) => {
    if (!normalizedSearch.value) return true;
    return `${release.version} ${release.name} ${release.body}`
      .toLocaleLowerCase()
      .includes(normalizedSearch.value);
  }),
);

const releaseVersionDiffers = computed(
  () =>
    Boolean(docs.changelog.latestVersion) &&
    docs.changelog.latestVersion !== docs.meta.packageVersion,
);

const selectedApi = computed(() =>
  docs.scss.api.find((item) => item.id === selectedScssId.value),
);
const selectedScssFile = computed(() =>
  docs.scss.files.find((item) => item.id === selectedScssId.value),
);
const selectedVariableGroup = computed(() =>
  docs.scss.variableGroups.find((item) => item.id === selectedScssId.value),
);
const selectedMarginGroup = computed(() =>
  docs.scss.marginGroups.find((item) => item.name === selectedScssId.value),
);
const selectedComponent = computed(() => {
  return docs.components.find((item) => item.id === selectedComponentId.value);
});
const selectedProperty = computed(() => {
  return docs.properties.find(
    (item) => item.name === selectedPropertyName.value,
  );
});

const componentCodeSource = computed(() => {
  const component = selectedComponent.value;
  if (!component) return { path: '', source: '' };
  if (componentCode.value === 'config') {
    return { path: component.configPath || '', source: component.configSource };
  }
  if (componentCode.value === 'docs') {
    return { path: component.docsPath || '', source: component.docs };
  }
  if (componentCode.value === 'style') {
    const style =
      component.styles.find((item) => item.path === selectedStylePath.value) ||
      component.styles[0];
    return { path: style?.path || '', source: style?.source || '' };
  }
  if (componentCode.value === 'vue') {
    const vueFile = component.vueFiles[0];
    return { path: vueFile?.path || '', source: vueFile?.source || '' };
  }
  return { path: component.htmlPath || '', source: component.html };
});

watch(
  filteredApi,
  (items) => {
    if (
      scssMode.value === 'api' &&
      !items.some((item) => item.id === selectedScssId.value)
    ) {
      selectedScssId.value = items[0]?.id || '';
    }
  },
  { immediate: true },
);

watch(
  filteredVariableGroups,
  (items) => {
    if (
      scssMode.value === 'variables' &&
      !items.some((item) => item.id === selectedScssId.value)
    ) {
      selectedScssId.value = items[0]?.id || '';
    }
  },
  { immediate: true },
);

watch(
  filteredScssFiles,
  (items) => {
    if (
      scssMode.value === 'files' &&
      !items.some((item) => item.id === selectedScssId.value)
    ) {
      selectedScssId.value = items[0]?.id || '';
    }
  },
  { immediate: true },
);

watch(
  filteredMarginGroups,
  (items) => {
    if (
      scssMode.value === 'groups' &&
      !items.some((item) => item.name === selectedScssId.value)
    ) {
      selectedScssId.value = items[0]?.name || '';
    }
  },
  { immediate: true },
);

watch(scssMode, (mode) => {
  if (mode === 'api') selectedScssId.value = filteredApi.value[0]?.id || '';
  if (mode === 'variables')
    selectedScssId.value = filteredVariableGroups.value[0]?.id || '';
  if (mode === 'files')
    selectedScssId.value = filteredScssFiles.value[0]?.id || '';
  if (mode === 'groups')
    selectedScssId.value = filteredMarginGroups.value[0]?.name || '';
});

watch(
  filteredComponents,
  (items) => {
    if (!items.some((item) => item.id === selectedComponentId.value)) {
      selectedComponentId.value = items[0]?.id || '';
    }
  },
  { immediate: true },
);

watch(
  filteredProperties,
  (items) => {
    if (!items.some((item) => item.name === selectedPropertyName.value)) {
      selectedPropertyName.value = items[0]?.name || '';
    }
  },
  { immediate: true },
);

watch(selectedComponent, (component) => {
  componentCode.value = 'html';
  selectedStylePath.value = component?.styles[0]?.path || '';
});

function selectSection(value: Section) {
  section.value = value;
  search.value = '';
}

function openProperty(name: string) {
  search.value = '';
  selectedPropertyName.value = name;
  section.value = 'properties';
}

function openComponent(id: string) {
  search.value = '';
  selectedComponentId.value = id;
  section.value = 'components';
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function formatDate(value: string) {
  if (!value) return 'not generated yet';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function releaseNoteLines(body: string) {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
</script>

<template>
  <div class="srl-docs">
    <header class="srl-docs__header">
      <div>
        <p class="srl-docs__eyebrow">Simple Reporting Library</p>
        <h1>Developer documentation</h1>
        <p>{{ docs.meta.projectName }} · SRL {{ docs.meta.packageVersion }}</p>
      </div>
      <div class="srl-docs__generated">
        Generated {{ formatDate(docs.meta.generatedAt) }}
      </div>
    </header>

    <div class="srl-docs__layout">
      <nav class="srl-docs__navigation" aria-label="Documentation sections">
        <button
          :class="{ active: section === 'overview' }"
          @click="selectSection('overview')"
        >
          Overview
        </button>
        <button
          :class="{ active: section === 'scss' }"
          @click="selectSection('scss')"
        >
          SCSS <span>{{ docs.meta.stats.scssApi }}</span>
        </button>
        <button
          :class="{ active: section === 'components' }"
          @click="selectSection('components')"
        >
          Components <span>{{ docs.meta.stats.components }}</span>
        </button>
        <button
          :class="{ active: section === 'properties' }"
          @click="selectSection('properties')"
        >
          Properties <span>{{ docs.meta.stats.properties }}</span>
        </button>
        <button
          :class="{ active: section === 'changelog' }"
          @click="selectSection('changelog')"
        >
          Changelog <span>{{ docs.changelog.releases.length }}</span>
        </button>
        <button
          :class="{ active: section === 'issues' }"
          @click="selectSection('issues')"
        >
          Validation <span>{{ docs.meta.stats.issues }}</span>
        </button>
      </nav>

      <main class="srl-docs__content">
        <template v-if="section === 'overview'">
          <section class="srl-docs__intro">
            <h2>Current project, documented from source</h2>
            <p>
              This documentation combines SRL package APIs, project styles and
              Livingdocs component files. Generated facts stay synchronized with
              the files used by the build.
            </p>
          </section>

          <section
            class="srl-docs__stats"
            aria-label="Documentation statistics"
          >
            <div>
              <strong>{{ docs.meta.stats.scssFiles }}</strong
              ><span>SCSS files</span>
            </div>
            <div>
              <strong>{{ docs.meta.stats.scssApi }}</strong
              ><span>SCSS declarations</span>
            </div>
            <div>
              <strong>{{ docs.meta.stats.components }}</strong
              ><span>Components</span>
            </div>
            <div>
              <strong>{{ docs.meta.stats.properties }}</strong
              ><span>Properties</span>
            </div>
            <div>
              <strong>{{ docs.meta.stats.marginGroups }}</strong
              ><span>Margin groups</span>
            </div>
          </section>

          <section class="srl-docs__sources">
            <h2>SCSS sources</h2>
            <div class="srl-docs__cards">
              <article
                v-for="source in docs.scss.sources"
                :key="source.id"
                class="srl-docs__card"
              >
                <div class="srl-docs__card-title">
                  <h3>{{ source.label }}</h3>
                  <span>{{ source.fileCount }} files</span>
                </div>
                <code>{{ source.root }}</code>
                <p v-if="!source.exists" class="srl-docs__muted">
                  This source does not exist in the current project.
                </p>
              </article>
            </div>
          </section>

          <section
            v-for="guide in docs.guides"
            :key="guide.id"
            class="srl-docs__guide"
          >
            <h2>{{ guide.title }}</h2>
            <article v-for="item in guide.sections" :key="item.title">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
              <pre v-if="item.code"><code>{{ item.code }}</code></pre>
            </article>
          </section>
        </template>

        <template v-else-if="section === 'changelog'">
          <section class="srl-docs__intro">
            <p class="srl-docs__eyebrow srl-docs__eyebrow--content">Releases</p>
            <h2>SRL changelog</h2>
            <p>
              Release notes are generated from the SRL GitHub releases. This
              project currently uses
              <strong>{{ docs.meta.packageName }}</strong> in version
              <strong>{{ docs.meta.packageVersion }}</strong
              >.
            </p>
          </section>

          <div
            v-if="releaseVersionDiffers"
            class="srl-docs__notice srl-docs__release-status"
          >
            The installed source is version {{ docs.meta.packageVersion }}; the
            latest published GitHub release is
            {{ docs.changelog.latestVersion }}.
          </div>
          <div
            v-if="docs.changelog.status !== 'current'"
            class="srl-docs__notice srl-docs__release-status"
          >
            {{
              docs.changelog.warning ||
              'Release data could not be loaded. Generate the docs again while online.'
            }}
          </div>

          <div class="srl-docs__toolbar srl-docs__release-toolbar">
            <input
              v-model="search"
              type="search"
              placeholder="Search versions and release notes"
            />
            <a
              :href="docs.changelog.releasesUrl"
              target="_blank"
              rel="noreferrer"
            >
              All releases on GitHub
            </a>
          </div>

          <div v-if="filteredReleases.length" class="srl-docs__releases">
            <article
              v-for="(release, index) in filteredReleases"
              :key="release.tag"
              class="srl-docs__release"
            >
              <div class="srl-docs__release-heading">
                <div>
                  <span v-if="index === 0" class="srl-docs__type">Latest</span>
                  <h3>{{ release.name }}</h3>
                  <time :datetime="release.publishedAt">
                    {{ formatDate(release.publishedAt) }}
                  </time>
                </div>
                <a :href="release.url" target="_blank" rel="noreferrer">
                  {{ release.tag }}
                </a>
              </div>
              <div v-if="release.body" class="srl-docs__release-notes">
                <p
                  v-for="(line, lineIndex) in releaseNoteLines(release.body)"
                  :key="lineIndex"
                >
                  {{ line }}
                </p>
              </div>
              <p v-else class="srl-docs__muted">No release notes provided.</p>
            </article>
          </div>
          <div v-else class="srl-docs__success">
            No matching release notes found.
          </div>
        </template>

        <template v-else-if="section === 'scss'">
          <div class="srl-docs__toolbar">
            <input
              v-model="search"
              type="search"
              placeholder="Search SCSS APIs, files and margin groups"
            />
            <select
              v-if="scssMode === 'api' || scssMode === 'files'"
              v-model="scssScope"
              aria-label="SCSS source"
            >
              <option value="all">All sources</option>
              <option
                v-for="source in docs.scss.sources"
                :key="source.id"
                :value="source.id"
              >
                {{ source.label }}
              </option>
            </select>
            <div class="srl-docs__segmented">
              <button
                :class="{ active: scssMode === 'api' }"
                @click="scssMode = 'api'"
              >
                API
              </button>
              <button
                :class="{ active: scssMode === 'variables' }"
                @click="scssMode = 'variables'"
              >
                Variables
              </button>
              <button
                :class="{ active: scssMode === 'files' }"
                @click="scssMode = 'files'"
              >
                Files
              </button>
              <button
                :class="{ active: scssMode === 'groups' }"
                @click="scssMode = 'groups'"
              >
                Margin groups
              </button>
            </div>
            <label v-if="scssMode === 'api'" class="srl-docs__checkbox">
              <input v-model="showPrivateApi" type="checkbox" /> internal
            </label>
            <span v-if="scssMode === 'api'" class="srl-docs__coverage">
              {{ docs.meta.stats.documentedScssApi }} /
              {{ docs.meta.stats.publicScssApi }} public APIs documented
            </span>
            <span v-if="scssMode === 'variables'" class="srl-docs__coverage">
              {{ docs.meta.stats.documentedScssVariables }} /
              {{ docs.meta.stats.publicScssVariables }} declarations documented
            </span>
          </div>

          <div class="srl-docs__browser">
            <aside class="srl-docs__results">
              <template v-if="scssMode === 'api'">
                <button
                  v-for="item in filteredApi"
                  :key="item.id"
                  :class="{ active: selectedScssId === item.id }"
                  @click="selectedScssId = item.id"
                >
                  <span class="srl-docs__type">{{ item.type }}</span>
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.scope }} · {{ item.module }}</small>
                </button>
              </template>
              <template v-else-if="scssMode === 'variables'">
                <button
                  v-for="variable in filteredVariableGroups"
                  :key="variable.id"
                  :class="{ active: selectedScssId === variable.id }"
                  @click="selectedScssId = variable.id"
                >
                  <span class="srl-docs__type">variable</span>
                  <strong>{{ '$' + variable.name }}</strong>
                  <small>
                    {{ variable.declarations.length }}
                    {{
                      variable.declarations.length === 1
                        ? 'declaration'
                        : 'declarations'
                    }}
                  </small>
                </button>
              </template>
              <template v-else-if="scssMode === 'files'">
                <button
                  v-for="file in filteredScssFiles"
                  :key="file.id"
                  :class="{ active: selectedScssId === file.id }"
                  @click="selectedScssId = file.id"
                >
                  <strong>{{ file.relativePath }}</strong>
                  <small>{{ file.scopeLabel }} · {{ file.target }}</small>
                </button>
              </template>
              <template v-else>
                <button
                  v-for="group in filteredMarginGroups"
                  :key="group.name"
                  :class="{ active: selectedScssId === group.name }"
                  @click="selectedScssId = group.name"
                >
                  <span class="srl-docs__type">margin group</span>
                  <strong>{{ group.name }}</strong>
                  <small>
                    {{ group.rules.length }} rules ·
                    {{ group.usedBy.length }} components
                  </small>
                </button>
              </template>
            </aside>

            <section
              v-if="scssMode === 'api' && selectedApi"
              class="srl-docs__detail"
            >
              <div class="srl-docs__detail-heading">
                <div>
                  <span class="srl-docs__type">{{ selectedApi.type }}</span>
                  <h2>{{ selectedApi.name }}</h2>
                </div>
                <span>{{ selectedApi.scope }} / {{ selectedApi.module }}</span>
              </div>
              <p v-if="selectedApi.description">
                {{ selectedApi.description }}
              </p>
              <p v-else class="srl-docs__notice">
                No description yet. Add a <code>///</code> documentation comment
                above the declaration.
              </p>
              <h3>Signature</h3>
              <pre><code>{{ selectedApi.signature }}</code></pre>
              <template v-if="selectedApi.annotations.param?.length">
                <h3>Parameters</h3>
                <ul class="srl-docs__parameters">
                  <li
                    v-for="parameter in selectedApi.annotations.param"
                    :key="parameter"
                  >
                    <code>{{ parameter }}</code>
                  </li>
                </ul>
              </template>
              <template v-if="selectedApi.annotations.return?.length">
                <h3>Returns</h3>
                <p>{{ selectedApi.annotations.return.join(' ') }}</p>
              </template>
              <h3>Typical usage</h3>
              <pre><code>{{ selectedApi.usage }}</code></pre>
              <p class="srl-docs__path">
                {{ selectedApi.path }}:{{ selectedApi.line }}
              </p>
            </section>

            <section
              v-else-if="scssMode === 'variables' && selectedVariableGroup"
              class="srl-docs__detail"
            >
              <div class="srl-docs__detail-heading">
                <div>
                  <span class="srl-docs__type">variable</span>
                  <h2>{{ '$' + selectedVariableGroup.name }}</h2>
                </div>
                <span v-if="selectedVariableGroup.types.length">
                  {{ selectedVariableGroup.types.join(' | ') }}
                </span>
              </div>
              <p v-if="selectedVariableGroup.description">
                {{ selectedVariableGroup.description }}
              </p>
              <p v-else class="srl-docs__notice">
                No description yet. Add a <code>///</code> documentation comment
                above the declaration.
              </p>
              <h3>
                {{
                  selectedVariableGroup.declarations.length === 1
                    ? 'Declaration and access path'
                    : 'Declarations and access paths'
                }}
              </h3>
              <div class="srl-docs__variable-declarations">
                <article
                  v-for="declaration in selectedVariableGroup.declarations"
                  :key="declaration.path"
                >
                  <div>
                    <strong>{{ declaration.module }}</strong>
                    <code>{{ declaration.usage }}</code>
                  </div>
                  <code class="srl-docs__variable-value">
                    {{ declaration.value }}
                  </code>
                  <small>{{ declaration.path }}:{{ declaration.line }}</small>
                </article>
              </div>
            </section>

            <section
              v-else-if="scssMode === 'files' && selectedScssFile"
              class="srl-docs__detail"
            >
              <div class="srl-docs__detail-heading">
                <div>
                  <h2>{{ selectedScssFile.relativePath }}</h2>
                </div>
                <span>{{ selectedScssFile.target }}</span>
              </div>
              <p class="srl-docs__path">{{ selectedScssFile.path }}</p>
              <pre
                class="srl-docs__source"
              ><code>{{ selectedScssFile.source }}</code></pre>
            </section>

            <section
              v-else-if="scssMode === 'groups' && selectedMarginGroup"
              class="srl-docs__detail"
            >
              <div class="srl-docs__detail-heading">
                <div>
                  <span class="srl-docs__type">margin group</span>
                  <h2>{{ selectedMarginGroup.name }}</h2>
                  <code>.{{ selectedMarginGroup.className }}</code>
                </div>
                <span>{{ selectedMarginGroup.rules.length }} rules</span>
              </div>
              <p>
                Components carrying this group class use the following top
                margin when followed by the matching target component. The
                generated selectors also handle nested SRL wrappers and PDF
                first/last variants.
              </p>
              <h3>SCSS registration</h3>
              <pre><code>{{ selectedMarginGroup.usage }}</code></pre>
              <h3>Configured transitions</h3>
              <div class="srl-docs__margin-rules">
                <div
                  v-for="rule in selectedMarginGroup.rules"
                  :key="rule.target"
                >
                  <code>.{{ selectedMarginGroup.className }}</code>
                  <span>followed by</span>
                  <code>{{ rule.selector }}</code>
                  <strong>{{ rule.spacer }}</strong>
                </div>
              </div>
              <h3>Used by components</h3>
              <div class="srl-docs__chips">
                <button
                  v-for="component in selectedMarginGroup.usedBy"
                  :key="component.id"
                  @click="openComponent(component.id)"
                >
                  {{ component.label }}
                </button>
                <span
                  v-if="!selectedMarginGroup.usedBy.length"
                  class="srl-docs__muted"
                >
                  No component usage was found.
                </span>
              </div>
              <p class="srl-docs__path">
                {{ selectedMarginGroup.configPath }} · spacer.margins.group.{{
                  selectedMarginGroup.name
                }}
              </p>
            </section>
          </div>
        </template>

        <template v-else-if="section === 'components'">
          <div class="srl-docs__toolbar">
            <input
              v-model="search"
              type="search"
              placeholder="Search components"
            />
          </div>
          <div class="srl-docs__browser">
            <aside class="srl-docs__results">
              <button
                v-for="component in filteredComponents"
                :key="component.id"
                :class="{ active: selectedComponentId === component.id }"
                @click="selectedComponentId = component.id"
              >
                <strong>{{ component.label }}</strong>
                <small>{{ component.groupLabel }} · {{ component.name }}</small>
              </button>
            </aside>

            <section v-if="selectedComponent" class="srl-docs__detail">
              <div class="srl-docs__detail-heading">
                <div>
                  <span class="srl-docs__type">{{
                    selectedComponent.groupLabel
                  }}</span>
                  <h2>{{ selectedComponent.label }}</h2>
                  <code>{{ selectedComponent.name }}</code>
                </div>
                <span>{{ selectedComponent.styles.length }} style targets</span>
              </div>

              <h3>Properties</h3>
              <div
                v-if="selectedComponent.properties.length"
                class="srl-docs__property-grid"
              >
                <button
                  v-for="property in selectedComponent.properties"
                  :key="property.name"
                  @click="openProperty(property.name)"
                >
                  <strong>{{ property.name }}</strong>
                  <span :class="`status-${property.status}`">{{
                    property.status
                  }}</span>
                  <small v-if="property.definitions[0]">
                    {{ property.definitions[0].scope }} ·
                    {{ property.definitions[0].path }}
                  </small>
                </button>
              </div>
              <p v-else class="srl-docs__muted">
                This component declares no properties.
              </p>

              <h3>Source</h3>
              <div class="srl-docs__tabs">
                <button
                  :class="{ active: componentCode === 'html' }"
                  @click="componentCode = 'html'"
                >
                  HTML
                </button>
                <button
                  :class="{ active: componentCode === 'config' }"
                  @click="componentCode = 'config'"
                >
                  ld-conf.json
                </button>
                <button
                  v-if="selectedComponent.styles.length"
                  :class="{ active: componentCode === 'style' }"
                  @click="componentCode = 'style'"
                >
                  SCSS
                </button>
                <button
                  v-if="selectedComponent.vueFiles.length"
                  :class="{ active: componentCode === 'vue' }"
                  @click="componentCode = 'vue'"
                >
                  Vue
                </button>
                <button
                  v-if="selectedComponent.docs"
                  :class="{ active: componentCode === 'docs' }"
                  @click="componentCode = 'docs'"
                >
                  Notes
                </button>
              </div>
              <select
                v-if="
                  componentCode === 'style' &&
                  selectedComponent.styles.length > 1
                "
                v-model="selectedStylePath"
                class="srl-docs__file-select"
              >
                <option
                  v-for="style in selectedComponent.styles"
                  :key="style.path"
                  :value="style.path"
                >
                  {{ style.target }} · {{ style.path }}
                </option>
              </select>
              <p class="srl-docs__path">{{ componentCodeSource.path }}</p>
              <pre
                class="srl-docs__source"
              ><code>{{ componentCodeSource.source }}</code></pre>
            </section>
          </div>
        </template>

        <template v-else-if="section === 'properties'">
          <div class="srl-docs__toolbar">
            <input
              v-model="search"
              type="search"
              placeholder="Search properties"
            />
          </div>
          <div class="srl-docs__browser">
            <aside class="srl-docs__results">
              <button
                v-for="property in filteredProperties"
                :key="property.name"
                :class="{ active: selectedPropertyName === property.name }"
                @click="selectedPropertyName = property.name"
              >
                <strong>{{ property.name }}</strong>
                <small
                  >{{ property.definitions[0]?.scope }} · used by
                  {{ property.usedBy.length }}</small
                >
              </button>
            </aside>
            <section v-if="selectedProperty" class="srl-docs__detail">
              <div class="srl-docs__detail-heading">
                <div>
                  <span class="srl-docs__type">property</span>
                  <h2>{{ selectedProperty.name }}</h2>
                </div>
                <span v-if="selectedProperty.duplicate" class="srl-docs__error"
                  >duplicate</span
                >
              </div>
              <article
                v-for="definition in selectedProperty.definitions"
                :key="definition.path"
              >
                <p class="srl-docs__path">
                  {{ definition.scope }} · {{ definition.path }}
                </p>
                <pre><code>{{ formatJson(definition.value) }}</code></pre>
              </article>
              <h3>Used by</h3>
              <div class="srl-docs__chips">
                <button
                  v-for="component in selectedProperty.usedBy"
                  :key="component.id"
                  @click="openComponent(component.id)"
                >
                  {{ component.label }}
                </button>
                <span
                  v-if="!selectedProperty.usedBy.length"
                  class="srl-docs__muted"
                  >No component references this property.</span
                >
              </div>
            </section>
          </div>
        </template>

        <template v-else>
          <section class="srl-docs__intro">
            <h2>Documentation validation</h2>
            <p>
              Errors should fail <code>srl docs check</code>. Informational
              entries describe content that needs runtime evaluation.
            </p>
          </section>
          <div v-if="docs.issues.length" class="srl-docs__issues">
            <article
              v-for="(issue, index) in docs.issues"
              :key="`${issue.code}-${index}`"
              :class="`severity-${issue.severity}`"
            >
              <span>{{ issue.severity }}</span>
              <div>
                <strong>{{ issue.message }}</strong
                ><code>{{ issue.code }}</code
                ><small v-if="issue.path">{{ issue.path }}</small>
              </div>
            </article>
          </div>
          <div v-else class="srl-docs__success">
            No documentation or structure issues found.
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
.srl-docs {
  --docs-ink: #17202a;
  --docs-muted: #667085;
  --docs-line: #d9dee7;
  --docs-soft: #f4f6f9;
  --docs-accent: #f05000;
  --docs-accent-ink: #a63600;
  --docs-accent-soft: #fff1e9;
  --docs-accent-line: #ffc3a3;
  --docs-code: #111827;
  min-height: 100vh;
  background: #fff;
  color: var(--docs-ink);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.5;
}

.srl-docs *,
.srl-docs *::before,
.srl-docs *::after {
  box-sizing: border-box;
}
.srl-docs button,
.srl-docs input,
.srl-docs select {
  font: inherit;
}
.srl-docs button {
  color: inherit;
}
.srl-docs h1,
.srl-docs h2,
.srl-docs h3,
.srl-docs p {
  margin-top: 0;
}
.srl-docs h1 {
  margin-bottom: 0.3rem;
  font-size: clamp(2rem, 4vw, 3.5rem);
  line-height: 1;
}
.srl-docs h2 {
  margin-bottom: 1rem;
  font-size: 1.6rem;
}
.srl-docs h3 {
  margin: 1.5rem 0 0.5rem;
  font-size: 1rem;
}

.srl-docs__header {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  align-items: end;
  padding: 3rem clamp(1.25rem, 5vw, 5rem);
  color: #fff;
  background: linear-gradient(120deg, #111827, #352117 60%, #f05000);
}
.srl-docs__header p {
  margin-bottom: 0;
  color: #cbd5e1;
}
.srl-docs__eyebrow {
  margin-bottom: 0.75rem !important;
  color: #ffb38c !important;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.srl-docs__eyebrow--content {
  color: var(--docs-accent-ink) !important;
}
.srl-docs__generated {
  color: #cbd5e1;
  font-size: 0.82rem;
  white-space: nowrap;
}
.srl-docs__layout {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  min-height: calc(100vh - 12rem);
}
.srl-docs__navigation {
  position: sticky;
  top: 0;
  align-self: start;
  height: 100vh;
  padding: 2rem 1rem;
  border-right: 1px solid var(--docs-line);
  background: #fbfcfe;
}
.srl-docs__navigation button {
  display: flex;
  width: 100%;
  justify-content: space-between;
  padding: 0.7rem 0.9rem;
  border: 0;
  border-radius: 0.45rem;
  background: transparent;
  cursor: pointer;
  text-align: left;
}
.srl-docs__navigation button:hover,
.srl-docs__navigation button.active {
  color: var(--docs-accent-ink);
  background: var(--docs-accent-soft);
}
.srl-docs__navigation span {
  color: var(--docs-muted);
  font-size: 0.8rem;
}
.srl-docs__content {
  min-width: 0;
  padding: 2.5rem clamp(1.25rem, 4vw, 4rem) 6rem;
}
.srl-docs__intro {
  max-width: 54rem;
  margin-bottom: 2rem;
}
.srl-docs__intro p {
  color: var(--docs-muted);
  font-size: 1.05rem;
}
.srl-docs__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
}
.srl-docs__stats div {
  padding: 1.25rem;
  border: 1px solid var(--docs-line);
  border-radius: 0.75rem;
  background: var(--docs-soft);
}
.srl-docs__stats strong,
.srl-docs__stats span {
  display: block;
}
.srl-docs__stats strong {
  font-size: 1.8rem;
}
.srl-docs__stats span {
  color: var(--docs-muted);
}
.srl-docs__sources,
.srl-docs__guide {
  max-width: 72rem;
  margin-bottom: 3rem;
}
.srl-docs__cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}
.srl-docs__card {
  min-width: 0;
  padding: 1.25rem;
  border: 1px solid var(--docs-line);
  border-radius: 0.75rem;
}
.srl-docs__card-title {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}
.srl-docs__card-title h3 {
  margin: 0;
}
.srl-docs__card-title span {
  color: var(--docs-muted);
  white-space: nowrap;
}
.srl-docs__card > code {
  display: block;
  overflow: hidden;
  margin-top: 1rem;
  color: var(--docs-muted);
  text-overflow: ellipsis;
}
.srl-docs__guide article {
  padding: 0 0 1.25rem 1.25rem;
  border-left: 3px solid var(--docs-accent-line);
}
.srl-docs__guide article h3 {
  margin-top: 0;
}
.srl-docs__guide article p {
  max-width: 55rem;
  color: #475467;
}

.srl-docs__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.srl-docs__toolbar input,
.srl-docs__toolbar select,
.srl-docs__file-select {
  min-height: 2.6rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--docs-line);
  border-radius: 0.45rem;
  background: #fff;
}
.srl-docs__toolbar input {
  min-width: min(28rem, 100%);
  flex: 1;
}
.srl-docs__release-toolbar {
  max-width: 72rem;
  align-items: center;
  margin: 2rem 0 1.25rem;
}
.srl-docs__release-toolbar a,
.srl-docs__release a {
  color: var(--docs-accent-ink);
  font-weight: 600;
  text-decoration: none;
}
.srl-docs__release-toolbar a:hover,
.srl-docs__release a:hover {
  text-decoration: underline;
}
.srl-docs__release-status {
  max-width: 72rem;
  margin-bottom: 0.75rem;
}
.srl-docs__releases {
  display: grid;
  max-width: 72rem;
  gap: 1rem;
}
.srl-docs__release {
  padding: 1.4rem;
  border: 1px solid var(--docs-line);
  border-radius: 0.75rem;
}
.srl-docs__release-heading {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}
.srl-docs__release-heading h3 {
  margin: 0;
  font-size: 1.2rem;
}
.srl-docs__release-heading time {
  color: var(--docs-muted);
  font-size: 0.8rem;
}
.srl-docs__release-notes {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--docs-line);
  color: #475467;
}
.srl-docs__release-notes p {
  margin-bottom: 0.4rem;
  white-space: pre-wrap;
}
.srl-docs__segmented {
  display: flex;
  padding: 0.2rem;
  border: 1px solid var(--docs-line);
  border-radius: 0.45rem;
  background: var(--docs-soft);
}
.srl-docs__segmented button,
.srl-docs__tabs button {
  padding: 0.35rem 0.75rem;
  border: 0;
  border-radius: 0.3rem;
  background: transparent;
  cursor: pointer;
}
.srl-docs__segmented button.active,
.srl-docs__tabs button.active {
  color: var(--docs-accent-ink);
  background: #fff;
  box-shadow: 0 1px 3px rgb(16 24 40 / 12%);
}
.srl-docs__checkbox {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.6rem;
  margin: 0;
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--docs-line);
  border-radius: 0.45rem;
  color: var(--docs-muted);
  background: #fff;
  cursor: pointer;
  line-height: 1;
  white-space: nowrap;
}
.srl-docs__checkbox input[type='checkbox'] {
  position: static;
  display: block;
  flex: 0 0 1rem;
  width: 1rem;
  min-width: 1rem;
  height: 1rem;
  min-height: 1rem;
  margin: 0;
  padding: 0;
  border: initial;
  border-radius: initial;
  appearance: auto;
  accent-color: var(--docs-accent);
}
.srl-docs__coverage {
  align-self: center;
  margin-left: auto;
  padding-left: 0.5rem;
  color: var(--docs-muted);
  font-size: 0.8rem;
  line-height: 1.4;
  white-space: nowrap;
}
.srl-docs__browser {
  display: grid;
  grid-template-columns: minmax(14rem, 20rem) minmax(0, 1fr);
  overflow: hidden;
  min-height: 42rem;
  border: 1px solid var(--docs-line);
  border-radius: 0.75rem;
}
.srl-docs__results {
  overflow: auto;
  max-height: calc(100vh - 10rem);
  border-right: 1px solid var(--docs-line);
  background: #fbfcfe;
}
.srl-docs__results button {
  display: block;
  width: 100%;
  padding: 0.8rem 1rem;
  border: 0;
  border-bottom: 1px solid #edf0f4;
  background: transparent;
  cursor: pointer;
  text-align: left;
}
.srl-docs__results button:hover,
.srl-docs__results button.active {
  background: var(--docs-accent-soft);
}
.srl-docs__results strong,
.srl-docs__results small {
  display: block;
  overflow-wrap: anywhere;
}
.srl-docs__results small {
  margin-top: 0.25rem;
  color: var(--docs-muted);
}
.srl-docs__type {
  display: inline-block;
  margin-bottom: 0.25rem;
  color: var(--docs-accent-ink);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.srl-docs__detail {
  min-width: 0;
  padding: clamp(1.25rem, 3vw, 2.5rem);
}
.srl-docs__detail-heading {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  align-items: start;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--docs-line);
}
.srl-docs__detail-heading + p {
  max-width: 56rem;
  margin-top: 1.4rem;
  margin-bottom: 1.75rem;
  color: #344054;
  font-size: 1rem;
  line-height: 1.65;
}
.srl-docs__detail-heading h2 {
  margin-bottom: 0.25rem;
  overflow-wrap: anywhere;
}
.srl-docs__detail-heading > span {
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  color: var(--docs-muted);
  background: var(--docs-soft);
  font-size: 0.75rem;
  white-space: nowrap;
}
.srl-docs pre {
  overflow: auto;
  max-height: 42rem;
  margin: 0.75rem 0 1.5rem;
  padding: 1rem;
  border-radius: 0.55rem;
  color: #e5e7eb;
  background: var(--docs-code);
  font:
    0.82rem/1.6 ui-monospace,
    SFMono-Regular,
    Consolas,
    monospace;
  white-space: pre;
}
.srl-docs__source {
  min-height: 10rem;
}
.srl-docs__notice {
  padding: 0.75rem 1rem;
  border-left: 3px solid #f59e0b;
  color: #7c4a03;
  background: #fffbeb;
}
.srl-docs__path {
  overflow-wrap: anywhere;
  color: var(--docs-muted);
  font:
    0.78rem/1.5 ui-monospace,
    SFMono-Regular,
    Consolas,
    monospace;
}
.srl-docs__parameters {
  margin: 0 0 1.5rem;
  padding-left: 1.25rem;
}
.srl-docs__parameters li {
  margin-bottom: 0.4rem;
}
.srl-docs__variable-declarations {
  display: grid;
  gap: 0.75rem;
}
.srl-docs__variable-declarations article {
  display: grid;
  grid-template-columns: minmax(12rem, 1fr) minmax(7rem, auto);
  gap: 0.4rem 1rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--docs-line);
  border-radius: 0.55rem;
  background: var(--docs-soft);
}
.srl-docs__variable-declarations article > div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.75rem;
  align-items: baseline;
}
.srl-docs__variable-declarations article > div code {
  color: var(--docs-accent-ink);
}
.srl-docs__variable-declarations small {
  grid-column: 1 / -1;
  color: var(--docs-muted);
  overflow-wrap: anywhere;
}
.srl-docs__variable-value {
  justify-self: end;
  color: var(--docs-ink);
  overflow-wrap: anywhere;
}
.srl-docs__margin-rules {
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 1px solid var(--docs-line);
  border-radius: 0.55rem;
}
.srl-docs__margin-rules div {
  display: grid;
  grid-template-columns: minmax(12rem, 1fr) auto minmax(9rem, 1fr) 5rem;
  gap: 0.75rem;
  align-items: center;
  padding: 0.65rem 0.8rem;
  border-bottom: 1px solid var(--docs-line);
}
.srl-docs__margin-rules div:last-child {
  border-bottom: 0;
}
.srl-docs__margin-rules span {
  color: var(--docs-muted);
  font-size: 0.75rem;
}
.srl-docs__margin-rules strong {
  justify-self: end;
  color: var(--docs-accent-ink);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
}
.srl-docs__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
  padding: 0.25rem;
  border-radius: 0.45rem;
  background: var(--docs-soft);
}
.srl-docs__file-select {
  width: 100%;
  margin-bottom: 0.5rem;
}
.srl-docs__property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 0.6rem;
}
.srl-docs__property-grid button {
  padding: 0.75rem;
  border: 1px solid var(--docs-line);
  border-radius: 0.45rem;
  background: #fff;
  cursor: pointer;
  text-align: left;
}
.srl-docs__property-grid strong,
.srl-docs__property-grid span,
.srl-docs__property-grid small {
  display: block;
}
.srl-docs__property-grid span {
  margin: 0.2rem 0;
  color: #067647;
  font-size: 0.75rem;
}
.srl-docs__property-grid .status-missing {
  color: #b42318;
}
.srl-docs__property-grid small {
  color: var(--docs-muted);
  overflow-wrap: anywhere;
}
.srl-docs__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.srl-docs__chips button {
  padding: 0.4rem 0.65rem;
  border: 1px solid var(--docs-accent-line);
  border-radius: 999px;
  color: var(--docs-accent-ink);
  background: var(--docs-accent-soft);
  cursor: pointer;
}
.srl-docs__muted {
  color: var(--docs-muted);
}
.srl-docs__error {
  color: #b42318 !important;
  background: #fef3f2 !important;
}
.srl-docs__issues {
  display: grid;
  gap: 0.75rem;
}
.srl-docs__issues article {
  display: grid;
  grid-template-columns: 5rem 1fr;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--docs-line);
  border-left-width: 4px;
  border-radius: 0.45rem;
}
.srl-docs__issues article > span {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}
.srl-docs__issues article strong,
.srl-docs__issues article code,
.srl-docs__issues article small {
  display: block;
}
.srl-docs__issues article code,
.srl-docs__issues article small {
  margin-top: 0.2rem;
  color: var(--docs-muted);
}
.srl-docs__issues .severity-error {
  border-left-color: #d92d20;
}
.srl-docs__issues .severity-warning {
  border-left-color: #f79009;
}
.srl-docs__issues .severity-info {
  border-left-color: var(--docs-muted);
}
.srl-docs__success {
  padding: 1rem;
  border: 1px solid #abefc6;
  border-radius: 0.5rem;
  color: #067647;
  background: #ecfdf3;
}

@media (max-width: 900px) {
  .srl-docs__layout {
    grid-template-columns: 1fr;
  }
  .srl-docs__navigation {
    position: static;
    display: flex;
    overflow: auto;
    width: 100%;
    height: auto;
    padding: 0.75rem;
    border-right: 0;
    border-bottom: 1px solid var(--docs-line);
  }
  .srl-docs__navigation button {
    width: auto;
    gap: 0.75rem;
    white-space: nowrap;
  }
  .srl-docs__stats,
  .srl-docs__cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .srl-docs__browser {
    grid-template-columns: 1fr;
  }
  .srl-docs__margin-rules div {
    grid-template-columns: 1fr;
  }
  .srl-docs__variable-declarations article {
    grid-template-columns: 1fr;
  }
  .srl-docs__variable-value,
  .srl-docs__variable-declarations small {
    grid-column: auto;
    justify-self: start;
  }
  .srl-docs__margin-rules strong {
    justify-self: start;
  }
  .srl-docs__results {
    max-height: 18rem;
    border-right: 0;
    border-bottom: 1px solid var(--docs-line);
  }
}

@media (max-width: 560px) {
  .srl-docs__header {
    display: block;
    padding: 2rem 1.25rem;
  }
  .srl-docs__generated {
    margin-top: 1rem;
  }
  .srl-docs__stats,
  .srl-docs__cards {
    grid-template-columns: 1fr;
  }
  .srl-docs__content {
    padding-inline: 1rem;
  }
}
</style>
