import { html, render } from 'lit-html';
import { api } from './resources/api-service.js';
import './entry-header.js';
import './entry-edit.js';
import './entry-item.js';
import './gen-elements/labelled-checkbox.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    entry-input {
      margin-top: 20px;
      margin-bottom: 10px;
    }
    #typeinfo {
      display: block;
      margin-bottom: 10px;
      color: var(--light-text-low-emph);
    }
    pre {
      color: var(--light-text-med-emph);
    }
    labelled-checkbox {
      margin-left: 20px;
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
  get valid() {
    if (this.activeTopics.length < 1 && this.newTopics.length < 1)
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
    this.oldEntry = entry;
    if (entry) {
      this.activeTopics = entry.topics;
      this.activeTags = entry.tags;
    }
    this.update();
  }
  async saveEntry(close) {
    const db = await api.getSource('entries');
    const mdate = new Date();
    const _private = this.shadowRoot.querySelector('#privateCheckbox').value;
    // there are problems when relying on the "updated" this.entry alone
    // e.g. changing the text and then afterwards changing the topics
    // results in the oldEntry text to be set in this.entry and stored,
    // but on-screen is the changed text
    // therefor querying the result here
    const result = this.shadowRoot.querySelector('entry-input').result;
    //console.log("result: ", result);
    this.activeTopics = [ ...this.activeTopics, ...this.newTopics ];
    this.activeTags = [ ...this.activeTags, ...this.newTags ];
    const entry = {
      ...result,
      id: this.oldEntry.id,
      date: this.oldEntry.date,
      mdate: mdate,
      topics: this.activeTopics,
      tags: this.activeTags,
      private: _private,
    };
    //console.log("entry: ", entry);
    await db.update({ id: this.oldEntry.id }, entry);
    console.log("updated entry!!");
    console.log("id: " + entry.id);
    if (close) window.location.hash = "#entries";
    // reset stuff
    this.shadowRoot.querySelector('#add-topics').reset();
    this.shadowRoot.querySelector('#add-tags').reset();
  }
  update() {
    render(html`${style}
      ${ this.oldEntry ?
        html`
          <entry-header .entry=${this.oldEntry} noedit></entry-header>
          <entry-input .oldEntry=${this.oldEntry}
            @loaded=${(e)=>this.entry=e.detail}
            @inputchange=${(e)=>{this.entry = e.detail}}
            cols="45" rows=${this.oldEntry.type === 'note' ? 10 : 1}
            ></entry-input>
          <div id="buttonsBox">
            <labelled-button class="inline" ?disabled=${!this.valid}
              @click=${()=>this.saveEntry()} label="Save"
              ></labelled-button>
            <labelled-button class="inline" ?disabled=${!this.valid}
              @click=${()=>this.saveEntry(true)} label="Save and Close"
              ></labelled-button>
            <labelled-checkbox id="privateCheckbox" ?checked=${this.oldEntry.private}>Private</labelled-checkbox>
          </div>
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
