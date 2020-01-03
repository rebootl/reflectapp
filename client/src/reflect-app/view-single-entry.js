import { html, render } from 'lit-html';
import { api } from './resources/api-service.js';
import './entry-item';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    entry-item {
      margin: 20px;
    }
    pre {
      margin: 20px;
      color: var(--light-text-med-emph)
    }
  </style>
`;

class ViewSingleEntry extends HTMLElement {
  set urlStateObject(v) {
    this._urlStateObject = v;
  }
  get urlStateObject() {
    return this._urlStateObject;
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.updateQuery();
  }
  triggerUpdate() {
    this.updateQuery();
  }
  async updateQuery() {
    const params = this.urlStateObject.params;
    const entryId = params.id || [];
    const db = await api.getSource('entries');
    const [ entry ] = await db.query({ id: entryId });
    this.entry = entry;
    this.update();
  }
  update() {
    render(html`${style}
      ${ this.entry ?
        html`<entry-item .entry=${this.entry}></entry-item>` :
        html`<pre>Ooops, entry not found... :/</pre>` }
      `, this.shadowRoot);
  }
}

customElements.define('view-single-entry', ViewSingleEntry);
