import { html, render } from 'lit-html';
import { myrouter } from './resources/router.js';
import './topics-list.js';
import './subtags-list.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      background-color: var(--surface);
      color: var(--light-text-hig-emph);
      /* stub height */
      min-height: 100px;
      padding-top: 5px;
      /*border: 1px dashed #333;*/
    }
    subtags-list {
      border-top: 1px solid var(--on-surface-line);
    }
  </style>
`;

class EditorMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    myrouter.register(this);
  }
  disconnectedCallback() {
    myrouter.unregister(this);
  }
  routerUpdate() {
    this.activeTopics = myrouter.getParts(0);
    this.activeTags = myrouter.getParts(1);
    this.update();
  }
  update_url() {
    // reset when "topic" starts with ~ (edit view)
    if (this.activeTopics[0]) if (this.activeTopics[0].startsWith('~'))
      this.activeTopics.shift();

    myrouter.setUrl(myrouter.getRoute(), [ this.activeTopics, this.activeTags ]);
  }
  updateUrlTopics(activeTopics) {
    this.activeTopics = activeTopics;
    this.update_url();
  }
  updateUrlSubtags(activeTags) {
    this.activeTags = activeTags;
    this.update_url();
  }
  update() {
    render(html`${style}
      <topics-list
        .activeTopics=${this.activeTopics}
        @selectionchanged=${(e)=>this.updateUrlTopics(e.detail)}>
      </topics-list>
      <subtags-list
        .activeTopics=${this.activeTopics}
        .activeSubtags=${this.activeTags}
        @selectionchanged=${(e)=>this.updateUrlSubtags(e.detail)}>
      </subtags-list>
    `, this.shadowRoot);
  }
}

customElements.define('editor-menu', EditorMenu);
