import { computed, type ComputedRef } from 'vue';
import { useRoute } from 'vue-router';
import useArticles from './articles';

const articles = useArticles();

export default function useArticle(): ComputedRef<NsWowArticle | undefined> {
  const route = useRoute();
  return computed<NsWowArticle | undefined>(() => {
    const slug = route.params.slug
      ? (route.params.slug[0] as string)
      : undefined;
    const article = !slug
      ? articles.value.find((article) => article.index)
      : articles.value.find((article) => article.slug === slug);

    if (!article) {
      console.error(`Article not found for slug: ${route.path}`);
      return undefined;
    }

    return article;
  });
}
