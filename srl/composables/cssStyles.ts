import { ref } from 'vue';

const cssStyles = ref<string[]>([]);

export function addCssStyles(cssString: string): void {
  cssStyles.value.includes(cssString) || cssStyles.value.push(cssString);
}

export function useCssStyles(): typeof cssStyles {
  return cssStyles;
}

export default {
  addCssStyles,
  useCssStyles,
}