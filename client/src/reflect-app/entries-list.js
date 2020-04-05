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
    #bottomOfList {
      height: 50px;
    }
  </style>
`;

class EntriesList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.entries = api.observe('entries');
    this.limit = 0;
  }
  connectedCallback() {
    this.update();
    const bottomObserver = new IntersectionObserver(
      (e)=>this.loadMoreContent(e),
      { threshold: 0.9 }
    );
    const el = this.shadowRoot.querySelector('#bottomOfList');
    bottomObserver.observe(el);
  }
  triggerUpdate(urlStateObject) {
    console.log('updating entries-list...');
    const params = urlStateObject.params;
    this.activeTopics = params.topics || [];
    this.activeTags = params.subtags || [];
    this.updateQuery();
  }
  loadMoreContent(entries) {
    if (entries[0].intersectionRatio <= 0) return;
    console.log("increasing entry limit: ", this.limit);
    this.limit += 3;
    this.updateQuery();
  }
  updateQuery() {
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
      <ul>
      ${observableList(
          this.entries,
          (v, i) => html`
            <li><a href="#entry?id=${v.id}"><entry-item .entry=${v}></entry-item></a></li>
          `,
          html`<pre>loading...</pre>`
        )}
      </ul>
      <div id="bottomOfList"></div>
      `,
      this.shadowRoot);
  }
}

customElements.define('entries-list', EntriesList);
