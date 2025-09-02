import _useArticle from './article';
import _useArticles from './articles';
import _useConfig from './config';
import _useDownloads from './downloads';
import _useLocale from './locale';
import _useMenu from './menu';
import _useSearch from './search';
import _useSettings from './settings';
import _useViewPort from './viewPort';
import * as cssStyles from './cssStyles.ts'

export const useArticle = _useArticle;
export const useArticles = _useArticles;
export const useConfig = _useConfig;
export const useDownloads = _useDownloads;
export const useLocale = _useLocale;
export const useMenu = _useMenu;
export const useSearch = _useSearch;
export const useSettings = _useSettings;
export const useViewPort = _useViewPort;
export const addCssStyles = cssStyles.addCssStyles;
export const useCssStyles = cssStyles.useCssStyles;

export default {
  useArticle,
  useArticles,
  useConfig,
  useDownloads,
  useLocale,
  useMenu,
  useSearch,
  useSettings,
  useViewPort,
  addCssStyles,
  useCssStyles,
};
