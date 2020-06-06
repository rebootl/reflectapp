import { html, render } from 'lit-html';
import { myrouter } from './resources/router.js';
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
  router_register(url_state_obj) {}
  router_load(url_state_obj) {
    this.router_update(url_state_obj);
  }
  router_update(url_state_obj) {
    if (routes.hasOwnProperty(url_state_obj.route)) {
      this.routed_content = routes[url_state_obj.route](url_state_obj);
    } else {
      // -> maybe flash msg here... `route not found :(`
      // default to entries
      this.routed_content = routes['entries'](url_state_obj);
    }
    this.update();
    const triggeredContent = this.shadowRoot.querySelector('.triggerupdate');
    if (triggeredContent) triggeredContent.triggerUpdate(url_state_obj);
  }
  update() {
    render(html`${style}
        ${this.routed_content}
      `, this.shadowRoot);
  }
}

customElements.define('main-content', MainContent);
