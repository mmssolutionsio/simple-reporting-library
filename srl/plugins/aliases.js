import * as folders from './folders.js';
import { fileURLToPath, URL } from 'node:url';
const aliases = {
  '~': fileURLToPath(new URL(folders.root)),
  '@': fileURLToPath(new URL(folders.srlSrc)),
  '#components': fileURLToPath(new URL(folders.srlComponents)),
  '#composables': fileURLToPath(new URL(folders.srlComposables)),
  '#plugins': fileURLToPath(new URL(folders.srlPlugins)),
  '#types': fileURLToPath(new URL(folders.srlTypes)),
  '#utils': fileURLToPath(new URL(folders.srlUtils)),
  '#imports': fileURLToPath(new URL(folders.srlImports)),
  '#ld': fileURLToPath(new URL(folders.ld)),
  'assets': fileURLToPath(new URL(folders.srlAssets)),
  'srl': fileURLToPath(new URL(folders.srlSystem)),
}
export default aliases;