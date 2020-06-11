import { html, render } from 'lit-html';
import { myrouter } from './resources/router.js';
import { loggedIn } from './resources/auth.js';
import './view-entries.js';
import './view-single-entry.js';
import './view-edit-entry.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: content-box;
      /*background-color: var(--background);*/
      padding: 0;
      /*border: 1px dashed #333;*/
    }
    view-edit-entry {
      margin: 20px;
    }
  </style>
`;

const routes = {
  'entries': (o) => html`
      <view-entries class="triggerupdate"
                    .url_state_obj=${o}>
      </view-entries>`,
  'entry': (o) => html`<view-single-entry class="triggerupdate"
    .urlStateObject=${o}></view-single-entry>`,
  'edit-entry': (o) => html`<view-edit-entry class="triggerupdate"
    .urlStateObject=${o}>
    </view-edit-entry>`,
  'signup': (o) => html`<signup></signup>`,
};

class MainContent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    myrouter.register(this);
  }
  routerUpdate() {
    this.update();
  }
  _getContent() {
    const r = myrouter.getRoute();
    if (r.startsWith('~')) {
      return html`[ -> get user content ]`;
    }
    if (r === 'editor') {
      if (!loggedIn()) return html`[ -> login or sign-up ]`;
      // if <part> starts with ~ load the edit view
      const p0 = myrouter.getParts(0)[0];
      if (p0) if (p0.startsWith('~'))
        return html`<view-edit-entry .id=${p0.slice(1)}></view-edit-entry>`;
      return html`<view-entries></view-entries>`;
    }
    if (r === 'signup') {
      if (loggedIn()) return html`[ -> you've already an account ]`;
      return html`[ -> show signup page ]`;
    }
    myrouter.setUrl('', [], []);
    return html`[ -> show overview ]`;
  }
  update() {
    render(html`${style}
        ${this._getContent()}
      `, this.shadowRoot);
  }
}

customElements.define('main-content', MainContent);
