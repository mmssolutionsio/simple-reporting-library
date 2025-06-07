import { createI18n, type I18n, type I18nOptions, type LocaleMessages } from 'vue-i18n'
import useConfig from '#composables/config'

let i18n: I18n | undefined = undefined

function initI18n() {
  const config = useConfig()
  const options: I18nOptions = {
    legacy: false,
    locale: config.value.settings.defaultLanguage,
    fallbackLocale: config.value.settings.defaultLanguage,
    availableLocales: Object.keys(config.value.translations),
    globalInjection: true,
    messages: config.value.translations,
  }

  i18n = createI18n<false, typeof options>(options)
  return i18n
}

export { initI18n, i18n }
