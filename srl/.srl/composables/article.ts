import { computed, type ComputedRef } from 'vue';
import { useInstance } from '#composables/instance.ts'
import useArticles from './articles';

const articles = useArticles();
const instance = useInstance();

const slug = computed(() => {
  return instance.value?.config.globalProperties.$route?.params?.slug
    ? (instance.value?.config.globalProperties.$route?.params?.slug[0] as string)
    : undefined;
});

const article = computed<NsWowArticle | undefined>(() => {
  const slugValue = slug.value;
  const a = articles.value
  return !slugValue
    ? a.find((article) => article.index)
    : a.find((article) => article.slug === slugValue);
});

export default function useArticle(): ComputedRef<NsWowArticle | undefined> {
  return article;
}
