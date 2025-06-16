import * as folders from './folders.js';
import { fileURLToPath, URL } from 'node:url';

const aliases = {
  '~': fileURLToPath(new URL(folders.root, import.meta.url)),
  '@': fileURLToPath(new URL(folders.srlSrc, import.meta.url)),
  '#components': fileURLToPath(new URL(folders.srlComponents, import.meta.url)),
  '#composables': fileURLToPath(new URL(folders.srlComposables, import.meta.url)),
  '#plugins': fileURLToPath(new URL(folders.srlPlugins, import.meta.url)),
  '#types': fileURLToPath(new URL(folders.srlTypes, import.meta.url)),
  '#utils': fileURLToPath(new URL(folders.srlUtils, import.meta.url)),
  '#imports': fileURLToPath(new URL(folders.srlImports, import.meta.url)),
  '#ld': fileURLToPath(new URL(folders.ld, import.meta.url)),
  'assets': fileURLToPath(new URL(folders.srlAssets, import.meta.url)),
  'srl': fileURLToPath(new URL(folders.srlSystem, import.meta.url)),
}
export default aliases;