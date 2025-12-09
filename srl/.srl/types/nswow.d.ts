export {};
declare global {
  type NsWowSettings = {
    languages: string[];
    defaultLanguage: string;
    shortBreadcrumb: boolean;
    search: {
      boldTheWord: boolean;
    };
    categories: string[];
    publicationName: {
      [key: string]: string;
    }
  };

  interface NsWowArticle {
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

  interface NsWowArticles {
    [locale: string]: NsWowArticle[];
  }

  type NsWowConfig = {
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

  type NsWowTranslations = {
    [locale: string]: NsWowTranslation;
  };

  type NsWowTranslation = {
    [key: string]: string;
  };

  interface NsWowMenu {
    label: string;
    type: string;
    page?: string;
    url?: string;
    anchor?: string;
    submenuEntries?: NsWowMenu[];
  }

  interface NsWowMenus {
    [menu: string]: NsWowMenu[];
  }

  interface NsWowResponseRouting {
    version: string;
    pages: NsWowArticle[];
    menu: {
      [menu: string]: NsWowMenu[];
    };
  }

  interface NsWowDownload {
    type: string;
    title: string;
    fileType: string;
    size: string;
    artifact: string;
  }

  type NsWowDownloads = {
    version?: string;
    structure: NsWowDownload[];
    annualReport?: NsWowDownload;
  };

  type NsWowSearchList = {
    article: NsWowArticle;
    href: string;
    words: string;
  };

  type NsWowNavigationItem = {
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

  type NsWowPageData = {
    time: number;
    article: NsWowArticle | null;
    content: string;
  };
}
