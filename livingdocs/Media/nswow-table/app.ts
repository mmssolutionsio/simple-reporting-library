import ArticleLoader from 'nswow/ArticleLoader';
import useConfig from '@/composables/config';

export default class extends ArticleLoader {
  async _create() {
    this.noteLinks = this.element.querySelectorAll('.note-link');

    const config = await useConfig();

    this.noteLinks.forEach((n) => {
      n.addEventListener('click', async (e) => {
        e.preventDefault();

        const lang = window.location.pathname.substring(1).split('/').shift();

        const elem = e.target;
        const uuid = elem.href.split('/').pop();
        const file = `./html/${lang}/${uuid}.html`;
        try {
          const res = await fetch(file, {
            redirect: 'error',
          });
          const html = await res.text();
          if (html.includes('window.baseUrl')) {
            console.error(`"${file}" could not be loaded.`);
          } else {
            window.app._instance.root.refs.modal.setContent(html);
          }
        } catch (e) {
          console.error(`"${file}" could not be loaded.`);
        }
      });
    });
  }
}
