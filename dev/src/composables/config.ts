import { ref } from 'vue'

const config = ref<NsWowConfig>({
  loaded: false,
  settings: {
    languages: ['de', 'en'],
    defaultLanguage: 'de',
    shortBreadcrumb: false,
    search: {
      boldTheWord: true
    },
    categories: []
  },
  articles: {},
  menus: {}
})

async function getData() {
  const file = `./json/settings.json`
  try {
    const response: Response = await fetch(file)
    const lazySettings: NsWowSettings = await response.json()
    config.value.settings = Object.assign(config.value.settings, lazySettings)
  } catch (e) {
    console.error(`"${file}" could not be loaded.`)
  }

  for (const locale of config.value.settings.languages) {
    const file: string = `./json/routing_${locale}.json`
    try {
      const response: Response = await fetch(file)
      const routing: NsWowResponseRouting = await response.json()
      config.value.articles[locale] = routing.pages
      config.value.menus[locale] = routing.menu
    } catch (e) {
      console.error(`"${file}" could not be loaded.`)
    }
  }

  config.value.loaded = true
}

export default async function useConfig() {
  if (!config.value.loaded) {
    await getData()
  }
  return config
}
