export {}
declare global {
  export type NsWowSettings = {
    languages: string[]
    defaultLanguage: string
    shortBreadcrumb: boolean
    search: {
      boldTheWord: boolean
    }
    categories: string[]
  }

  export interface NsWowArticle {
    uuid: string
    name: string
    translatedTitle: string
    slug: string
    index: boolean
    seo_keywords: string[]
    ignoreInSearch: boolean
    excerpt: string
    originalLanguageOfArticle: string
    status: string
  }

  export interface NsWowArticles {
    [locale: string]: NsWowArticle[]
  }

  export type NsWowConfig = {
    loaded: boolean
    settings: NsWowSettings
    articles: NsWowArticles
    menus: NsWowMenus
  }

  export interface NsWowMenu {
    label: string
    type: string
    page?: string
    url?: string
    anchor?: string
    submenuEntries?: NsWowMenu[]
  }

  export interface NsWowMenus {
    [locale: string]: {
      [menu: string]: NsWowMenu[]
    }
  }

  export interface NsWowResponseRouting {
    version: string
    pages: NsWowArticle[]
    menu: {
      [menu: string]: NsWowMenu[]
    }
  }

  export interface NsWowDownload {
    type: string
    title: string
    fileType: string
    size: string
    artifact: string
  }

  export type NsWowDownloads = {
    version?: string
    structure: NsWowDownload[]
    annualReport?: NsWowDownload
  }
}
