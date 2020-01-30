import { html, render } from 'lit-html';
import './topics-list.js';
import './subtags-list.js';
import './entry-input.js';
import './add-items.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      color: var(--light-text-med-emph);
      background-color: var(--surface);
      margin-bottom: 10px;
      border-radius: 5px;
      overflow: hidden;
    }
    #add-topics {
      padding-bottom: 5px;
    }
    #add-tags {
      border-top: 1px solid var(--on-surface-line);
    }
  </style>
`;

class SelectionBox extends HTMLElement {
  get activeTopics() {
    return this._activeTopics || [];
  }
  set activeTopics(v) {
    this._activeTopics = v;
    if (v.length < 1) this.activeTags = [];
    this.selectionChanged();
  }
  get activeTags() {
    return this._activeTags || [];
  }
  set activeTags(v) {
    this._activeTags = v;
    this.selectionChanged();
  }
  get newTopics() {
    return this._newTopics || [];
  }
  set newTopics(v) {
    this._newTopics = v;
    this.selectionChanged();
  }
  get newTags() {
    return this._newTags || [];
  }
  set newTags(v) {
    this._newTags = v;
    this.selectionChanged();
  }
  get ready() {
    if (this.activeTopics.length > 0 || this.newTopics.length > 0)
      return true;
    return false;
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  selectionChanged() {
    const newTopics = this.newTopics.filter((t) =>
      !this.activeTopics.includes(t));
    const newTags = this.newTags.filter((t) =>
      !this.activeTags.includes(t));
    const result = {
      topics: [ ...this.activeTopics, ...newTopics ],
      tags: [ ...this.activeTags, ...newTags],
      ready: this.ready,
    }
    this.dispatchEvent(new CustomEvent('selectionchanged', {detail: result}));
    this.update();
  }
  reset() {
    this.shadowRoot.querySelector('#add-topics').reset();
    this.shadowRoot.querySelector('topics-list').reset();
    this.shadowRoot.querySelector('#add-tags').reset();
    this.shadowRoot.querySelector('subtags-list').reset();
  }
  update() {
    render(html`${style}
      <add-items id="add-topics"
                 label="New Topic..."
                 @itemschanged=${(e)=>{this.newTopics = e.detail}}>
      </add-items>
      <topics-list .activeTopics=${this.activeTopics}
                   @selectionchanged=${(e)=>{this.activeTopics = e.detail}}>
      </topics-list>
      <add-items id="add-tags"
                 label="New Tag..."
                 @itemschanged=${(e)=>{this.newTags = e.detail}}>
      </add-items>
      <subtags-list .activeTopics=${this.activeTopics}
                    .activeSubtags=${this.activeTags}
                    @selectionchanged=${(e)=>{this.activeTags = e.detail}}>
      </subtags-list>
      `, this.shadowRoot);
  }
}

customElements.define('selection-box', SelectionBox);
