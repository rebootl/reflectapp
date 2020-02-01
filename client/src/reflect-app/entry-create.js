import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { api } from './resources/api-service.js';
import { digestMessage, getPrefix } from './resources/helpers.js';
import { uploadFile } from './resources/api_request_helpers.js';
import { uploadImageUrl } from './resources/api-service.js';
import './selection-box.js';

export async function uploadImage(image) {
  // -> if not "keep local" upload
  // -> upload
  const res = await uploadFile(uploadImageUrl, image.file, image.filename);
  //console.log(res);
  if (res.success) {
    image.uploaded = true;
    image.filepath = res.filepath;
  }
  // -> if not success store local
  delete image.file;
  //console.log("image", image);
  return image;
}

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
  }
  connectedCallback() {
    this.update();
  }
  async add_entry(_private) {
    // -> not really necessary anymore
    if (!this.valid) {
      return;
    }
    const db = await api.getSource('entries');
    const date = new Date();
    // prepare images
    if (this.entry.images) {
      for (const image of this.entry.images) {
        // -> if not "keep local" upload
        // -> upload
        const res = await uploadFile(uploadImageUrl, image.file, image.filename);
        //console.log(res);
        if (res.success) {
          image.uploaded = true;
          image.filepath = res.filepath;
        }
        // -> if not success store local
        delete image.file;
        //console.log("image", image);
      }
    }
    //console.log("entry", this.entry);
    let entry = {
      ...this.entry,
      date: date,
      topics: this.selectionResult.topics,
      tags: this.selectionResult.tags,
      private: _private,
      pinned: false
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
    this.shadowRoot.querySelector('entry-input').reset();
    this.shadowRoot.querySelector('selection-box').reset();
    this.shadowRoot.querySelector('selection-box').updateNewItems();
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
                         @click=${()=>this.add_entry(false)}
                         label="Create">
        </labelled-button>
        <labelled-button class="inline"
                         ?disabledstyle=${!this.valid}
                         @click=${()=>this.add_entry(true)}
                         label="Create Private">
        </labelled-button>
      </div>
      `, this.shadowRoot);
  }
}

customElements.define('entry-create', EntryCreate);
