import { html, render } from 'lit-html';
import { api } from './resources/api-service.js';
import { digestMessage, getPrefix } from './resources/helpers.js';
import './entry-item.js';
import './entry-header.js';
import './entry-input.js';
//import './gen-elements/textarea-input.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    entry-input {
      margin-top: 20px;
      /*margin-bottom: 20px;*/
    }
    pre {
      color: var(--light-text-med-emph)
    }
    #input-overlay {
      background-color: var(--surface);
      margin-bottom: 10px;
      border-radius: 5px;
      overflow: hidden;
    }
  </style>
`;

class ViewEditEntry extends HTMLElement {
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
    console.log(entryId);
    const db = await api.getSource('entries');
    const [ entry ] = await db.query({ id: entryId });
    this.entry = entry;
    this.originalEntry = entry;
    this.activeTopics = entry.topics;
    this.activeTags = entry.tags;
    this.update();
    this.shadowRoot.querySelector('entry-input').detect();
  }
  async saveEntry(_private) {
    const db = await api.getSource('entries');
    const date = this.originalEntry.date;
    const mdate = new Date();
    let entry = {
      ...this.entry,
      id: this.originalEntry.id,
      date: date,
      mdate: mdate,
      topics: [ ...this.activeTopics, ...this.newTopics ],
      tags: [ ...this.activeTags, ...this.newTags ],
      private: _private,
    };
    await db.update({ id: this.originalEntry.id }, entry);
    //const res = await db.query({ id: this.originalEntry.id });
    //console.log(res);
    console.log("updated entry!!");
    console.log("id: " + entry.id);
  }
  update() {
    //console.log(this.entry);
    render(html`${style}
      ${ this.entry ?
        html`
          <entry-header .entry=${this.originalEntry} noedit></entry-header>
          <entry-input rows=8 cols=35
            @ready=${(e)=>{this.inputReady = e.detail}}
            @inputchange=${(e)=>{this.entry = e.detail}}
            placeholder="..."
            loadtext=${this.entry.text}></entry-input>
          <div id="buttonsBox">
            <labelled-button class="inline" ?disabledstyle=${!this.valid}
                             @click=${()=>this.saveEntry(false)} label="Save"></labelled-button>
            <labelled-button class="inline" ?disabledstyle=${!this.valid}
                             @click=${()=>this.saveEntry(true)} label="Save as Private"></labelled-button>
          </div>
          <!--<entry-item .entry=${this.entry}></entry-item>-->
          <pre>[preview todo]</pre>
          <div id="input-overlay">
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
          `
        :
        html`<pre>Ooops, entry not found... :/</pre>` }
      `, this.shadowRoot);
  }
}

customElements.define('view-edit-entry', ViewEditEntry);
