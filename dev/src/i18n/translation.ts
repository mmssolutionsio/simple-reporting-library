import useConfig from '@/composables/config'
import { i18n } from '@/i18n'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

let config = null
useConfig().then((c) => (config = c))

const Translate = {
  isLocaleSupported(locale: string) {
    // <--- 1
    return Translate.supportedLocales.includes(locale)
  },

  getUserLocale() {
    // <--- 2
    const locale: string = window.navigator.language || Translate.defaultLocale
    return {
      locale: locale,
      localeNoRegion: locale.split('-')[0]
    }
  },

  getPersistedLocale(): string | null {
    const persistedLocale = localStorage.getItem('user-locale')
    if (persistedLocale && Translate.isLocaleSupported(persistedLocale)) {
      return persistedLocale
    } else {
      return null
    }
  },

  guessDefaultLocale(): string {
    const userPersistedLocale = Translate.getPersistedLocale()
    if (userPersistedLocale) {
      return userPersistedLocale
    }
    const userPreferredLocale = Translate.getUserLocale()
    if (Translate.isLocaleSupported(userPreferredLocale.locale)) {
      return userPreferredLocale.locale
    }
    if (Translate.isLocaleSupported(userPreferredLocale.localeNoRegion)) {
      return userPreferredLocale.localeNoRegion
    }

    return Translate.defaultLocale
  },

  get defaultLocale() {
    return config.value.settings.defaultLanguage
  },

  get supportedLocales(): string[] {
    return config.value.settings.languages
  },

  set currentLocale(newLocale: string) {
    i18n.global.locale.value = newLocale
  },

  async switchLanguage(newLocale: string) {
    Translate.currentLocale = newLocale
    const objHtml = document.querySelector('html')
    if (objHtml) {
      objHtml.setAttribute('lang', newLocale)
    }
    localStorage.setItem('user-locale', newLocale)
  },

  async routeMiddleware(
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) {
    const paramLocale = to.params.locale
    if (typeof paramLocale === 'string') {
      if (!Translate.isLocaleSupported(paramLocale)) {
        return next(Translate.guessDefaultLocale())
      }
      await Translate.switchLanguage(paramLocale)
    }
    return next()
  }
}

export default Translate
