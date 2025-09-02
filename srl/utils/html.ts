import { isRouterPath } from '#utils/uri.ts';
import { useArticles, useLocale, addCssStyles } from '#composables';

function attributesToString(attributes: Record<string, string | null>): string {
  return Object.entries(attributes)
    .map(([key, value]) => (value !== null ? `${key}="${value}"` : key))
    .join(' ');
}

export function prepareHtmlContent(text: string): string {
  const articles = useArticles();
  const locale = useLocale();

  const regex = /<a\s+([^>]+)>(.*?)<\/a>/gis;
  text = text.replace(regex, (match, attrString, innerText) => {
    // Attribute in ein Array umwandeln
    const attrObj = {};
    attrString.replace(/([a-zA-Z0-9\-_]+)(?:="([^"]*)")?/g, (m, key, value) => {
      attrObj[key] = value || null;
      return m;
    });

    if (
      attrObj['data-note-target'] &&
      attrObj['data-note-target'] === 'popup'
    ) {
      attrObj.uuid = attrObj.href;
      delete attrObj.href;
      const attrs = attributesToString(attrObj);
      return `<srl-article-dialog-button ${attrs}>${innerText}</srl-article-dialog-button>`;
    }

    if (attrObj.href) {
      const arrLink = attrObj.href.split('#');

      if (isRouterPath(arrLink[0])) {
        delete attrObj.href;
        if (arrLink[0].startsWith('./')) {
          arrLink[0] = arrLink[0].substring(1);
        }
        if (arrLink[0] === `/${locale.value}/home`) {
          arrLink[0] = `/${locale.value}`;
        }
        attrObj.to = arrLink[0];
        if (arrLink[1]) {
          attrObj.to += `#${arrLink[1]}`;
        }
        const attrs = attributesToString(attrObj);
        return `<router-link ${attrs}>${innerText}</router-link>`;
      }

      const a = articles.value.find((i) => i.uuid === arrLink[0]);
      if (a) {
        delete attrObj.href;
        attrObj.to = a.index
          ? `/${locale.value}`
          : `/${locale.value}/${a.slug}`;
        if (arrLink[1]) {
          attrObj.to += `#${arrLink[1]}`;
        }
        const attrs = attributesToString(attrObj);
        return `<router-link ${attrs}>${innerText}</router-link>`;
      }
    }

    return match;
  });

  text = text.replaceAll('../', `./`);

  text = text.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, p1) => {
    addCssStyles(p1);
    return '';
  });

  return text;
}

export default {
  prepareHtmlContent,
};
