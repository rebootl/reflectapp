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
    myrouter.register(this);
  }
  routerUpdate(route, parts, parameters) {
    this._route = route;
    /*this._topics = parts[0];
    this._tags = parts[1];*/
    //this._parameters = parameters;

    this._mainContent
    this.update();
    //const triggeredContent = this.shadowRoot.querySelector('.triggerupdate');
    //if (triggeredContent) triggeredContent.triggerUpdate(url_state_obj);
  }
  _getContent() {
    const r = this._route;
    if (r.startsWith('~')) {
      return html`[ -> get user content ]`;
    }
    if (r === 'me') {
      if (loggedIn()) {
        return html`<view-entries></view-entries>`;
      }
      return html`[ -> login or sign-up ]`;
    }
    if (r === 'signup') {
      if (loggedIn()) {
        return html`[ -> u already have an account ]`;
      }
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
