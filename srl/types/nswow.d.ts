export {};
declare global {
  export type NsWowSettings = {
    languages: string[];
    defaultLanguage: string;
    shortBreadcrumb: boolean;
    search: {
      boldTheWord: boolean;
    };
    categories: string[];
  };

  export interface NsWowArticle {
    uuid: string;
    name: string;
    translatedTitle: string;
    slug: string;
    index: boolean;
    seo_keywords: string[];
    ignoreInSearch: boolean;
    excerpt: string;
    originalLanguageOfArticle: string;
    status: string;
  }

  export interface NsWowArticles {
    [locale: string]: NsWowArticle[];
  }

  export type NsWowConfig = {
    locale: string;
    settings: NsWowSettings;
    articles: NsWowArticles;
    menus: {
      [locale: string]: NsWowMenus;
    };
    translations: NsWowTranslations;
    downloads: {
      [locale: string]: NsWowDownloads;
    };
  };

  export type NsWowTranslations = {
    [locale: string]: NsWowTranslation;
  };

  export type NsWowTranslation = {
    [key: string]: string;
  };

  export interface NsWowMenu {
    label: string;
    type: string;
    page?: string;
    url?: string;
    anchor?: string;
    submenuEntries?: NsWowMenu[];
  }

  export interface NsWowMenus {
    [menu: string]: NsWowMenu[];
  }

  export interface NsWowResponseRouting {
    version: string;
    pages: NsWowArticle[];
    menu: {
      [menu: string]: NsWowMenu[];
    };
  }

  export interface NsWowDownload {
    type: string;
    title: string;
    fileType: string;
    size: string;
    artifact: string;
  }

  export type NsWowDownloads = {
    version?: string;
    structure: NsWowDownload[];
    annualReport?: NsWowDownload;
  };

  export type NsWowSearchList = {
    article: NsWowArticle;
    href: string;
    words: string;
  };

  export type NsWowNavigationItem = {
    label: string;
    title?: string;
    icon?: string;
    iconBefore?: string;
    iconAfter?: string;
    img?: {
      src: string;
      alt?: string;
    };
    imgBefore?: {
      src: string;
      alt?: string;
    };
    imgAfter?: {
      src: string;
      alt?: string;
    };
    active?: boolean;
    href?: string;
    attributes?: {
      [key: string]: string;
    };
    callback?: () => void;
    children?: NsWowNavigationItem[];
  };

  export type NsWowPageData = {
    time: number;
    article: NsWowArticle | null;
    content: string;
  };
}
