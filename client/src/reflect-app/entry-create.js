import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { api } from './resources/api-service.js';
import { digestMessage, getPrefix } from './resources/helpers.js';
import './selection-box.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      position: relative;
      color: var(--light-text-med-emph);
    }
    selection-box {
      display: none;
    }
    selection-box.active {
      display: block;
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
  </style>
`;

class EntryCreate extends HTMLElement {
  get selectionResult() {
    return this._selectionResult || {};
  }
  set selectionResult(v) {
    this._selectionResult = v;
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
    if (this.selectionResult.ready && this.inputReady)
      return true;
    return false;
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.storing = false;
  }
  connectedCallback() {
    this.update();
  }
  async add_entry(_private) {
    // -> not really necessary anymore
    if (!this.valid) {
      return;
    }
    this.storing = true;
    this.update();
    const db = await api.getSource('entries');
    const date = new Date();
    // store images
    const images = await this.shadowRoot.querySelector('entry-input')
      .storeUploadImages();
    //console.log(images)
    // -> use try catch instead, but kinda stupid to do inside function...
    if (!images) {
      console.log("image upload failed, aborting entry creation...");
      this.storing = false;
      this.update();
      return;
    }

    let entry = {
      ...this.entry,
      date: date,
      topics: this.selectionResult.topics,
      tags: this.selectionResult.tags,
      private: _private,
      pinned: false,
      images: images
    };
    // create id/ref
    const digest = await digestMessage(JSON.stringify(entry));
    let prefix = "";
    if (entry.type === 'note') {
      prefix = await getPrefix(entry.text);
    } else if (entry.type === 'link') {
      prefix = "link";
    } else if (entry.type === 'image') {
      prefix = "image";
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
    this.storing = false;
    this.shadowRoot.querySelector('entry-input').reset();
    this.shadowRoot.querySelector('selection-box').reset();
    this.shadowRoot.querySelector('selection-box').updateNewItems();
    this.update();
  }
  update() {
    const selectionClasses = { active: this.inputReady };
    const buttonBoxClasses = { active: this.valid };
    render(html`${style}
      <entry-input @ready=${(e)=>{this.inputReady = e.detail}}
                   @inputchange=${(e)=>{this.entry = e.detail}}>
      </entry-input>
      <selection-box class=${classMap(selectionClasses)}
                     @selectionchanged=${(e)=>this.selectionResult = e.detail}>
      </selection-box>
      <div id="buttonsBox" class=${classMap(buttonBoxClasses)}>
        <labelled-button class="inline"
                         ?disabledstyle=${!this.valid}
                         ?disabled=${this.storing}
                         @click=${()=>this.add_entry(false)}
                         label="Create">
        </labelled-button>
        <labelled-button class="inline"
                         ?disabledstyle=${!this.valid}
                         ?disabled=${this.storing}
                         @click=${()=>this.add_entry(true)}
                         label="Create Private">
        </labelled-button>
      </div>
      `, this.shadowRoot);
  }
}

customElements.define('entry-create', EntryCreate);
