import postcss from 'postcss';

/** Extract compiled page rules without including component, font or token CSS. */
export function extractPdfPageRules(css) {
  const pages = postcss.root();
  postcss.parse(css).walkAtRules('page', (rule) => {
    const clone = rule.clone();
    clone.raws.before = '';
    clone.walkComments((comment) => comment.remove());
    pages.append(clone);
  });
  return pages.toString();
}

/** Hooks shared by the SRL plugin and the focused Vite integration test. */
export function pdfPageRulesHooks() {
  return {
    resolveId: {
      order: 'pre',
      async handler(id, importer) {
        const query = id.indexOf('?');
        if (query === -1) return;
        const params = new URLSearchParams(id.slice(query + 1));
        if (!params.has('srl-page-rules') || params.has('inline')) return;
        params.set('inline', '');
        return this.resolve(id.slice(0, query) + '?' + params, importer, {
          skipSelf: true,
        });
      },
    },
    transform: {
      // Run after Vite's CSS transform, which exports the compiled inline CSS.
      order: 'post',
      handler(code, id) {
        const query = id.indexOf('?');
        if (query === -1) return;
        const params = new URLSearchParams(id.slice(query + 1));
        if (!params.has('srl-page-rules')) return;
        const ast = this.parse(code);
        const exported = ast.body.find(
          (node) => node.type === 'ExportDefaultDeclaration',
        );
        if (typeof exported?.declaration?.value !== 'string') {
          this.error('SRL page rules require a compiled inline CSS export.');
        }
        return {
          code: `export default ${JSON.stringify(extractPdfPageRules(exported.declaration.value))};`,
          map: { mappings: '' },
        };
      },
    },
  };
}
