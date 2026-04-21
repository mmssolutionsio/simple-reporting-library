import { computed } from 'vue'
import { useConfig, useArticles } from '#composables'

interface GlobalLink extends NsWowNavigationItem {
  href: string
}

type GlobalLinks = {
  home?: GlobalLink
  downloads?: GlobalLink
  search?: GlobalLink
}

const articles = useArticles()
const config = useConfig()

const globalLinks = computed<GlobalLinks>(() => {
  const links: GlobalLinks = {}
  const home = articles.value.find( i => i.index )
  home ? links.home = {
    label: home.translatedTitle,
    href: `/${config.value.locale}/${home.slug}`,
  } : null

  const downloads = articles.value.find( i => i.uuid === '00-01-downloads' )
  downloads ? links.downloads = {
    label: downloads.translatedTitle,
    href: `/${config.value.locale}/${downloads.slug}`,
  } : null

  const search = articles.value.find( i => i.uuid === '00-02-search' )
  search ? links.search = {
    label: search.translatedTitle,
    href: `/${config.value.locale}/${search.slug}`,
  } : null

  return links
})

export function useGlobalLinks() {
  return globalLinks
}

export default {
  useGlobalLinks,
}