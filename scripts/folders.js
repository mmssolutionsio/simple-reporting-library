import { join } from 'path/posix';
import { packageName as configPackageName } from './config.js';

export const root = process.cwd();
export const packageName = join(...configPackageName.split('/'));
export const packagePath = join(root, 'node_modules', packageName);
export const packageSrl = join(packagePath, 'srl');
export const packageLd = join(packagePath, 'livingdocs');
export const srlRoot = join(root, '.srl');
export const srlSystem = join(root, 'srl');
export const srlComponents = join(srlRoot, 'components');
export const srlComposables = join(srlRoot, 'composables');
export const srlUtils = join(srlRoot, 'utils');
export const srlPlugins = join(srlRoot, 'plugins');
export const srlScss = join(srlRoot, 'scss');
export const srlImports = join(srlRoot, 'imports');
export const srlTypes = join(srlRoot, 'types');
export const srlOutput = join(root, '.output');
export const srlPublic = join(root, 'public');
export const srlSrc = join(root, 'src');
export const srlAssets = join(srlSrc, 'assets');
export const srlEntries = join(srlSrc, 'entries');
export const ld = join(root, 'livingdocs');

export default {
  root,
  packageName,
  packagePath,
  packageSrl,
  packageLd,
  srlRoot,
  srlSystem,
  srlComponents,
  srlComposables,
  srlUtils,
  srlPlugins,
  srlScss,
  srlImports,
  srlTypes,
  srlOutput,
  srlPublic,
  srlSrc,
  srlAssets,
  srlEntries,
  ld,
};
