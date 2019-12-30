import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { api } from './resources/api-service.js';
import { digestMessage, getPrefix } from './resources/helpers.js';
import './topics-list.js';
import './subtags-list.js';
import './entry-input.js';
import './add-items.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      position: relative;
      color: var(--light-text-med-emph);
    }
    #input-overlay {
      background-color: var(--surface);
      margin-bottom: 10px;
      border-radius: 5px;
      overflow: hidden;
      display: none;
    }
    #input-overlay.active {
      display: block;
      margin-bottom: 10px;
    }
    #buttonsBox {
      display: none;
      padding-bottom: 10px;
    }
    #buttonsBox.active {
      display: flex;
      justify-content: flex-start;
    }
    labelled-button {
      margin-right: 5px;
    }
    #add-topics {
      padding-bottom: 5px;
    }
    #add-tags {
      border-top: 1px solid var(--on-surface-line);
    }
  </style>
`;

class EntryCreate extends HTMLElement {
  get activeTopics() {
    return this._activeTopics || [];
  }
  set activeTopics(v) {
    this._activeTopics = v;
    if (v.length < 1) this.activeTags = [];
    this.update();
  }
  get activeTags() {
    return this._activeTags || [];
  }
  set activeTags(v) {
    this._activeTags = v;
    this.update();
  }
  get newTopics() {
    return this._newTopics || [];
  }
  set newTopics(v) {
    this._newTopics = v;
    this.update();
  }
  get newTags() {
    return this._newTags || [];
  }
  set newTags(v) {
    this._newTags = v;
    this.update();
  }
  get entry() {
    return this._entry || {};
  }
  set entry(v) {
    this._entry = v;
    this.update();
  }
  get inputReady() {
    return this._inputReady || false;
  }
  set inputReady(v) {
    this._inputReady = v;
    this.update();
  }
  get valid() {
    if ((this.activeTopics.length < 1 && this.newTopics.length < 1) ||
      !this.inputReady)
      return false;
    return true;
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  async add_entry(_private) {
    // not really necessary anymore..
    if (!this.valid) {
      return;
    }
    //this.update();
    const db = await api.getSource('entries');
    const date = new Date();
    let entry = {
      ...this.entry,
      date: date,
      topics: [ ...this.activeTopics, ...this.newTopics ],
      tags: [ ...this.activeTags, ...this.newTags ],
      private: _private,
    };
    // create id/ref
    const digest = await digestMessage(JSON.stringify(entry));
    let prefix = "";
    if (entry.type === 'note') {
      prefix = await getPrefix(entry.text);
    } else if (entry.type === 'link') {
      prefix = "link";
    }
    const id = prefix + "-" + digest.slice(0, 10);
    entry = { ...entry, id };
    await db.add(entry);
    console.log("created entry!!");
    console.log("id: " + id);
    console.log("type: " + entry.type);
    this.reset();
  }
  reset() {
    this.shadowRoot.querySelector('entry-input').reset();
    this.shadowRoot.querySelector('#add-topics').reset();
    this.shadowRoot.querySelector('topics-list').reset();
    this.shadowRoot.querySelector('#add-tags').reset();
    this.shadowRoot.querySelector('subtags-list').reset();
  }
  update() {
    const buttonBoxClasses = { active: this.valid };
    const selectionClasses = { active: this.inputReady };
    render(html`${style}
      <div>
        <entry-input @ready=${(e)=>{this.inputReady = e.detail}}
                     @inputchange=${(e)=>{this.entry = e.detail}}></entry-input>
      </div>
      <div id="input-overlay" class=${classMap(selectionClasses)}>
        <add-items id="add-topics" label="New Topic..."
                   @itemschanged=${(e)=>{this.newTopics = e.detail}}></add-items>
        <topics-list .activeTopics=${this.activeTopics}
                     @selectionchanged=${(e)=>{this.activeTopics = e.detail}}>
        </topics-list>
        <add-items id="add-tags" label="New Tag..."
                   @itemschanged=${(e)=>{this.newTags = e.detail}}></add-items>
        <subtags-list .activeTopics=${this.activeTopics} .activeSubtags=${this.activeTags}
                      @selectionchanged=${(e)=>{this.activeTags = e.detail}}>
        </subtags-list>
      </div>
      <div id="buttonsBox" class=${classMap(buttonBoxClasses)}>
        <labelled-button class="inline" ?disabledstyle=${!this.valid}
                         @click=${()=>this.add_entry(false)} label="Create"></labelled-button>
        <labelled-button class="inline" ?disabledstyle=${!this.valid}
                         @click=${()=>this.add_entry(true)} label="Create Private"></labelled-button>
      </div>
      `, this.shadowRoot);
  }
}

customElements.define('entry-create', EntryCreate);
