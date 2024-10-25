import { createI18n, type I18nOptions, type LocaleMessages } from 'vue-i18n'
import useConfig from '@/composables/config'

const defaultMessages: LocaleMessages<any> = {}

const locales = import.meta.glob('@/locales/**/*.json', { eager: true, import: 'default' })

for (const path in locales) {
  const matched = path.match(/([A-Za-z0-9-_]+)\./i)
  if (matched && matched.length > 1) {
    const locale = matched[1]
    defaultMessages[locale] = locales[path]
  }
}

const options: I18nOptions = {
  legacy: false,
  locale: 'de',
  fallbackLocale: 'de',
  globalInjection: true,
  messages: defaultMessages
}

const i18n = createI18n<false, typeof options>(options)

async function getTranslation() {
  const config = await useConfig()
  let messages = {}
  const file = `${window.baseUrl}/json/translations_hosting.json`

  try {
    const response: Response = await fetch(file)
    const importMessages: LocaleMessages<any> = await response.json()

    for (const lang in importMessages) {
      if (typeof defaultMessages[lang] !== 'undefined') {
        importMessages[lang] = Object.assign(defaultMessages[lang], importMessages[lang])
      }
    }
    messages = importMessages
  } catch (e) {
    messages = defaultMessages
    console.error(`"${file}" could not be loaded.`)
  }

  for (let lang in messages) {
    i18n.global.setLocaleMessage(lang, messages[lang])
  }

  if (navigator && navigator.language && typeof messages[navigator.language] !== 'undefined') {
    i18n.locale = navigator.language
  } else {
    i18n.locale = config.value.settings.defaultLanguage
  }
  i18n.fallbackLocale = config.value.settings.defaultLanguage
}
getTranslation()

export default i18n
