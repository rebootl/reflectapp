import { html, render } from 'lit-html';
import { api } from './resources/api-service.js';
import { observableList } from './resources/observableList';
import { myrouter } from './resources/router.js';
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
    #belowList {
      height: 50px;
    }
  </style>
`;

class EntriesList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.entries = api.observe('entries');
    this.defaultLimit = 3;
    this.limit = this.defaultLimit;
  }
  connectedCallback() {
    myrouter.register(this);
    this.update();
    this._initObserver();
  }
  disconnectedCallback() {
    myrouter.unregister(this);
  }
  routerUpdate() {
    this.activeTopics = myrouter.getParts(0);
    this.activeTags = myrouter.getParts(1);
    this._updateQuery();
  }
  _initObserver() {
    this.bottomObserver = new IntersectionObserver((e)=>this._loadContent(e),
      { threshold: 0.1 }
    );
    const topObserver = new IntersectionObserver((e)=>this._resetLimit(e));
    const el = this.shadowRoot.querySelector('#beforeList');
    // this should trigger _loadContent
    topObserver.observe(el);
    const ulMutationObserver = new MutationObserver((m, o)=>this._updateObserver(m, o));
    const ul = this.shadowRoot.querySelector('ul');
    ulMutationObserver.observe(ul, { childList: true });
  }
  _updateObserver(mutationsList, observer) {
    const ul = this.shadowRoot.querySelector('ul');
    const newLastli = ul.lastElementChild;
    if (newLastli) {
      newLastli.classList.add('lastelement')
      this.bottomObserver.observe(newLastli);
    }
  }
  _resetLimit(entries) {
    if (entries[0].intersectionRatio <= 0) return;
    this.limit = this.defaultLimit;
    this._updateQuery();
  }
  async _loadContent(entries) {
    // in some cases the observable of the previous 'lastelement' is still
    // threre, therefor the last entry has to be used instead of 0
    if (entries[entries.length - 1].intersectionRatio <= 0) return;
    this.limit += 3;
    this._updateQuery();
  }
  async _updateQuery() {
    if (this.activeTopics < 1) {
      this.entries.query([
        { $sort: { pinned: -1, date: -1 } },
        { $limit: this.limit },
      ]);
    } else if (this.activeTags < 1) {
      this.entries.query([
        { $match: { $and: [
          { topics: { $in: this.activeTopics } }
        ] } },
        { $sort: { pinned: -1, date: -1 }},
        { $limit: this.limit },
      ]);
    } else {
      this.entries.query([
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
            <li><a href="#editor/~${v.id}"><entry-item .entry=${v}></entry-item></a></li>
          `, html`
            <pre>loading...</pre>
          `)}
      </ul>
      <div @click=${()=>this._loadContent([{intersectionRatio: 1}])}
           id="belowList"></div>
      `,
      this.shadowRoot);
  }
}

customElements.define('entries-list', EntriesList);
