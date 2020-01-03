import { html, render } from 'lit-html';
import './entry-header.js';
import './entry-content.js';
import './gen-elements/tag-small.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    entry-content {
      margin-top: 16px;
      margin-bottom: 16px;
    }
    tag-small {
      margin-right: 5px;
    }
  </style>
`;

class EntryItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  get entry() {
    return this._entry;
  }
  set entry(v) {
    this._entry = v;
    this.update();
  }
  update() {
    //console.log(this.entry)
    render(html`${style}
        <entry-header .entry=${this.entry}></entry-header>
        <entry-content .entry=${this.entry}></entry-content>
        ${this.entry.topics.map((t) =>
          html`<tag-small type="topic">${t}</tag-small>`)}
        ${this.entry.tags.map((t) =>
          html`<tag-small type="tag">${t}</tag-small>`)}
      `, this.shadowRoot);
  }
}

customElements.define('entry-item', EntryItem);
