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
    /*#entries-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }*/
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
  triggerUpdate(urlStateObject) {
    this.update();
    this.shadowRoot.querySelector('entries-list').triggerUpdate(urlStateObject);
  }
  update() {
    render(html`${style}
      ${ loggedIn() ?
        html`<div id="entryCreateBox"><entry-create></entry-create></div>` :
        html`` }
      <entries-list></entries-list>
      `,
      this.shadowRoot);
  }
}

customElements.define('view-entries', ViewEntries);
