import ArticleLoader from 'nswow/ArticleLoader';

export default class extends ArticleLoader {
  _create() {
    this.toggle = this.element.querySelector('.srl-accordion__toggle');
    this.toggle.addEventListener('click', (e) => {
      this.element.classList.toggle('open');
    });
  }
}
