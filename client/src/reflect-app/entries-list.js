import { html, render } from 'lit-html';
import { api } from './resources/api-service.js';
import { observableList } from './resources/observableList';
import './entry-item.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      border-bottom: 1px solid var(--on-background-border);
    }
    a {
      text-decoration: none;
    }
  </style>
`;

class EntriesList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.entries = api.observe('entries');
    this.defaultLimit = 5;
    this.limit = this.defaultLimit;
  }
  connectedCallback() {
    this.update();
    this.bottomObserver = new IntersectionObserver((e)=>this._loadContent(e),
      { threshold: 0.1 }
    );
    const topObserver = new IntersectionObserver((e)=>this._resetLimit(e));
    const el = this.shadowRoot.querySelector('#beforeList');
    // this should trigger _loadContent
    topObserver.observe(el);
  }
  triggerUpdate(urlStateObject) {
    console.log('updating entries-list...');
    const params = urlStateObject.params;
    this.activeTopics = params.topics || [];
    this.activeTags = params.subtags || [];
    this._resetLimit([{intersectionRatio: 1}]);
  }
  _resetLimit(entries) {
    if (entries[0].intersectionRatio <= 0) return;
    this.limit = this.defaultLimit;
    this._updateQuery();
    this._loadContent([{intersectionRatio: 1}]);
  }
  _addObserver() {
    const ul = this.shadowRoot.querySelector('ul');
    const lastli = ul.lastElementChild;
    lastli.classList.add('lastelement')
    this.bottomObserver.observe(lastli);
  }
  _removeObserver() {
    const ul = this.shadowRoot.querySelector('ul');
    const lastli = ul.lastElementChild;
    if (lastli.classList.contains('lastelement')) return;
    lastli.classList.remove('lastelement')
    this.bottomObserver.unobserve(lastli);
  }
  async _loadContent(entries) {
    if (entries[0].intersectionRatio <= 0) return;
    this._removeObserver()
    this.limit += 3;
    await this._updateQuery();
    // give some time to render
    setTimeout(()=>this._addObserver(), 50);
  }
  async _updateQuery() {
    if (this.activeTopics < 1) {
      await this.entries.query([
        { $sort: { pinned: -1, date: -1 } },
        { $limit: this.limit },
      ]);
    } else if (this.activeTags < 1) {
      await this.entries.query([
        { $match: { $and: [
          { topics: { $in: this.activeTopics } }
        ] } },
        { $sort: { pinned: -1, date: -1 }},
        { $limit: this.limit },
      ]);
    } else {
      await this.entries.query([
        { $match: { $and: [
          { topics: { $in: this.activeTopics } },
          { tags: { $in: this.activeTags } }
        ] } },
        { $sort: { pinned: -1, date: -1 }},
        { $limit: this.limit },
      ]);
    }
  }
  update() {
    render(html`${style}
      <div id="beforeList"></div>
      <ul>
      ${observableList(
          this.entries,
          (v, i) => html`
            <li><a href="#entry?id=${v.id}"><entry-item .entry=${v}></entry-item></a></li>
          `, html`
            <pre>loading...</pre>
          `)}
      </ul>
      `,
      this.shadowRoot);
  }
}

customElements.define('entries-list', EntriesList);
