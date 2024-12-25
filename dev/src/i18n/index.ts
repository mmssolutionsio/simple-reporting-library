import { createI18n, type I18n, type I18nOptions, type LocaleMessages } from 'vue-i18n'
import useConfig from '@/composables/config'

let i18n: I18n | undefined = undefined
const initI18n = async function () {
  if (!i18n) {
    const config = await useConfig()
    const defaultMessagesImport = import.meta.glob('@/locales/*.json', {
      eager: true,
      import: 'default'
    })
    const defaultMessages: LocaleMessages<any> = {}

    for (const path in defaultMessagesImport) {
      const matched = path.match(/([A-Za-z0-9-_]+)\./i)
      if (matched && matched.length > 1) {
        const locale = matched[1]
        defaultMessages[locale] = defaultMessagesImport[path]
      }
    }

    const file = `./json/translations_hosting.json`
    try {
      const responseMessages = await fetch(file)
      if (responseMessages.ok) {
        const importMessages: LocaleMessages<any> = await responseMessages.json()
        for (const lang in importMessages) {
          if (typeof defaultMessages[lang] !== 'undefined') {
            importMessages[lang] = Object.assign(defaultMessages[lang], importMessages[lang])
          }
        }
      }
    } catch (e) {
      console.error(`"${file}" could not be loaded.`)
    }

    const options: I18nOptions = {
      legacy: false,
      locale: config.value.settings.defaultLanguage,
      fallbackLocale: config.value.settings.defaultLanguage,
      availableLocales: Object.keys(defaultMessages),
      globalInjection: true,
      messages: defaultMessages
    }

    i18n = createI18n<false, typeof options>(options)
  }
  return i18n
}

export { initI18n, i18n }
