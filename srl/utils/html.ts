import { isRouterPath } from '#utils/uri.ts';
import { useArticles, useLocale, addCssStyles } from '#composables';

type AttrObj = { [key: string]: string | null };
function attributesToString(attributes: Record<string, string | null>): string {
  return Object.entries(attributes)
    .map(([key, value]) => (value !== null ? `${key}="${value}"` : key))
    .join(' ');
}

function replaceAccordionContainer(text: string): string {
  const openTagRegex = /<div([^>]*\bclass\s*=\s*["']lc-accordion\s[^"']*["'][^>]*)>/gi;
  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = openTagRegex.exec(text)) !== null) {
    const start = match.index;
    const attrs = match[1];
    let depth = 1;
    let end = openTagRegex.lastIndex;

    while (depth > 0) {
      const nextOpen = text.indexOf('<div', end);
      const nextClose = text.indexOf('</div>', end);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        end = nextOpen + 4;
      } else {
        depth--;
        end = nextClose + 6;
      }
    }

    const innerContent = replaceAccordionContainer(text.slice(openTagRegex.lastIndex, end - 6));

    result += text.slice(lastIndex, start);
    result += `<srl-note-accordion v-slot="{ id, open, toggle }"${attrs}>${innerContent}</srl-note-accordion>`;
    lastIndex = end;
    openTagRegex.lastIndex = end;
  }
  result += text.slice(lastIndex);
  return result;
}

function replaceAccordionToggle(text: string): string {
  const openTagRegex = /<div([^>]*\bclass\s*=\s*["']lc-accordion__head\s[^"']*["'][^>]*)>/gi;
  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = openTagRegex.exec(text)) !== null) {
    const start = match.index;
    const attrs = match[1];
    const contentStart = openTagRegex.lastIndex;
    const closeTag = '</div>';
    const end = text.indexOf(closeTag, contentStart);
    if (end === -1) break;

    const innerContent = text.slice(contentStart, end);

    result += text.slice(lastIndex, start);
    result += `<srl-note-accordion-toggle :id="id" :open="open" :toggle="toggle"${attrs}>${innerContent}</srl-note-accordion-toggle>`;
    lastIndex = end + closeTag.length;
    openTagRegex.lastIndex = lastIndex;
  }
  result += text.slice(lastIndex);
  return result;
}

function replaceAccordionContent(text: string): string {
  const openTagRegex = /<div([^>]*\bclass\s*=\s*["']lc-accordion__content(?:\s[^"']*)?["'][^>]*)>/gi;
  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = openTagRegex.exec(text)) !== null) {
    const start = match.index;
    const attrs = match[1];
    let depth = 1;
    let end = openTagRegex.lastIndex;

    while (depth > 0) {
      const nextOpen = text.indexOf('<div', end);
      const nextClose = text.indexOf('</div>', end);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        end = nextOpen + 4;
      } else {
        depth--;
        end = nextClose + 6;
      }
    }

    const innerContent = replaceAccordionContent(text.slice(openTagRegex.lastIndex, end - 6));

    result += text.slice(lastIndex, start);
    result += `<srl-note-accordion-content :id="id" :open="open"${attrs}>${innerContent}</srl-note-accordion-content>`;
    lastIndex = end;
    openTagRegex.lastIndex = end;
  }
  result += text.slice(lastIndex);
  return result;
}

export function prepareHtmlContent(text: string): string {
  const articles = useArticles();
  const locale = useLocale();

  const regex = /<a\s+([^>]+)>(.*?)<\/a>/gis;
  text = text.replace(regex, (match, attrString, innerText) => {
    // Attribute in ein Array umwandeln
    const attrObj: AttrObj = {};
    attrString.replace(/([a-zA-Z0-9\-_]+)(?:="([^"]*)")?/g, (m, key: string, value: string | null) => {
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

  text = text.replace(
    /<template-([a-z]+)>([\s\S]*?)<\/template-\1>/g,
    (_match, name, content) => `<template #${name}>${content}</template>`
  );

  text = replaceAccordionContainer(text);
  text = replaceAccordionToggle(text);
  text = replaceAccordionContent(text);

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
