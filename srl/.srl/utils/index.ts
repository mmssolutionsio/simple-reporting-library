import { isFilePath, isRouterPath, isExternalPath } from './uri';
import { camelCase } from './string';
import { prepareHtmlContent } from './html';
import { objectDeepAssign } from './object'
import {
  usePageState,
  clearPageState,
  isDialogStored,
  addDialogToStorage,
  getDialogFromStorage,
  getDialogStorage,
  isAccordionAnchored,
  setAccordionAnchored,
  isMounted,
  setMounted
} from './pageState.ts';

export {
  isFilePath,
  isRouterPath,
  isExternalPath,
  camelCase,
  prepareHtmlContent,
  usePageState,
  clearPageState,
  isAccordionAnchored,
  setAccordionAnchored,
  isDialogStored,
  addDialogToStorage,
  getDialogFromStorage,
  getDialogStorage,
  setMounted,
  isMounted,
  objectDeepAssign
};
