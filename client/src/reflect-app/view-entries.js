import { html, render } from 'lit-html';
import { loggedIn } from './resources/auth.js';
import './entries-list.js';
import './entry-create.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    #entryCreateBox {
      border-bottom: 1px solid var(--on-background-border);
    }
    entry-create {
      margin: 15px 20px 0 20px;
    }
  </style>
`;

class ViewEntries extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  update() {
    render(html`${style}
          <div id="entryCreateBox"><entry-create></entry-create></div>
          <entries-list></entries-list>
          `,
      this.shadowRoot);
  }
}

customElements.define('view-entries', ViewEntries);
