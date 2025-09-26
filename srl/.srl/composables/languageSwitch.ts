import { computed } from 'vue'
import Tr from '@/i18n/translation.ts'
import { useArticle, useConfig } from '#composables'



type NsWowLanguageSwitch = {
  current: { label: string; href: string },
  items: NsWowNavigationItem[]
}

const languageSwitch = computed<NsWowLanguageSwitch>(() => {

  const config = useConfig()
  const article = useArticle()

  const res: NsWowLanguageSwitch = {
    current: { label: config.value.locale, href: `/${config.value.locale}` },
    items: []
  }
  for (const locale of config.value.settings.languages) {
    if (locale !== config.value.locale) {
      res.items.push({
        label: locale,
        href: `/${locale}`,
        callback: () => {
          Tr.switchLanguage(locale)
        }
      })
    }
  }

  if (article.value) {
    const uuid = article.value.uuid
    if (uuid) {
      for (const locale of config.value.settings.languages) {
        const slug = config.value.articles[locale].find((a) => a.uuid === uuid)?.slug || ''
        if (locale === config.value.locale) {
          res.current.href = `/${locale}/${slug}`
        } else {
          const item = res.items.find((i) => i.label === locale)
          item ? item.href = `/${locale}/${slug}` : null
        }
      }
    }
  }

  return res
})

export default function useLanguageSwitch() {
  return languageSwitch
}
