import folders from '../folders.js';
import { join, relative } from 'node:path/posix';
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';

function toPascalAfterSlash(str) {
  return str.replace(/\/(.)/g, (_, c) => c.toUpperCase());
}
function readVueDir(entryPath, prefix = '') {
  const componentsPath = join(entryPath, 'components');
  const result = {};

  function search(dir) {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        search(fullPath);
      } else if (entry.endsWith('.vue')) {
        const path = relative(componentsPath, fullPath);
        let name = path.slice(0, -4);
        name = toPascalAfterSlash(name);
        name = name.replaceAll('/', '');

        result[name] = {
          component: `${prefix}components/${path}`,
          type: relative(folders.srlTypes, fullPath)
        };
      }
    }
  }

  if (existsSync(componentsPath) && statSync(componentsPath).isDirectory()) {
    search(componentsPath);
  }

  return result;
}

export async function vueComponents() {
  const appComponents = readVueDir(folders.srlSrc, '@/');
  const srlComponents = readVueDir(folders.srlRoot, '#');

  const components = []
  const types = []

  for (const [name, info] of Object.entries(appComponents)) {
    components.push(
      `app.component('${name}', defineAsyncComponent(() => import('${info.component}')));`,
    )
    types.push({
      name: name,
      type: `  type ${name} = typeof import('${info.type}')['default'];`,
    })
  }

  for (const [name, info] of Object.entries(srlComponents)) {
    const componentPath = appComponents[name] ? appComponents[name].component : info.component
    const typePath = appComponents[name] ? appComponents[name].type : info.type
    if (!appComponents[name]) {
      components.push(
        `app.component('${name}', defineAsyncComponent(() => import('${componentPath}')));`,
      )
      types.push({
        name: name,
        type: `  type ${name} = typeof import('${typePath}')['default'];`,
      })
    }
  }

  writeFileSync(join(folders.srlPlugins, 'asyncSrlComponents.ts'),
`import { defineAsyncComponent, type App } from 'vue';
export default function asyncSrlComponents(app: App): void {
  ${components.join('\n  ')}
}
`, 'utf8');

  const componentsInterface = types.map(t => {
    return `  ${t.name}: ${t.name};`
  })

  writeFileSync(join(folders.srlTypes, 'components.d.ts'),
`export {};
declare global {
${types.map(t=>t.type).join("\n")}
}

interface _GlobalComponents {
${componentsInterface.join("\n")}
}
declare module '@vue/runtime-core' {
  export interface GlobalComponents extends _GlobalComponents {}
}
`, 'utf8');
}