import ArticleLoader from 'nswow/ArticleLoader';

export default class extends ArticleLoader {
  _create() {
    this.id = this.element.querySelector('.srl-anchor__text');
    if (this.id) {
      this.element.id = this.id.innerText;
      this.element.classList.add('active');
    }
  }
}
