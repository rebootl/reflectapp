import { html, render } from 'lit-html';
import { api } from './resources/api-service.js';
import './entry-header.js';
import './entry-input.js';
import './gen-elements/labelled-button.js';
import './gen-elements/labelled-checkbox.js';
//import './entry-item.js';
import './selection-box.js';
import './edit-images.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    entry-input {
      margin-top: 20px;
    }
    a {
      color: var(--primary);
    }
    pre {
      color: var(--light-text-med-emph);
    }
    labelled-button {
      margin-top: 10px;
    }
    labelled-checkbox {
      margin-top: 10px;
      margin-left: 20px;
    }
    #buttonsBox {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }
    .boxItem {
      margin-right: 10px;
    }
    #cancelButton {
      margin-top: 5px;
    }
    #deleteButton {
      /* align to the right */
      margin-left: auto;
    }
  </style>
`;

class ViewEditEntry extends HTMLElement {
  get valid() {
    if (this.selectionResult.ready) return true;
    return false;
  }
  set urlStateObject(v) {
    this._urlStateObject = v;
  }
  get urlStateObject() {
    return this._urlStateObject;
  }
  get selectionResult() {
    return this._selectionResult || { ready: true };
  }
  set selectionResult(v) {
    // -> this doesn't work here i think...?
    //if (JSON.stringify(v) === JSON.stringify(this._selectionResult)) return;
    this._selectionResult = v;
    this.update();
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.storing = false;
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
    // setting false fixes finding entry when url changed, from already loaded
    // entry
    this.oldEntry = false;
    if (entry) {
      this.oldEntry = entry;
      this.currentImages = entry.images || [];
    }
    //console.log(this.oldEntry)
    this.update();
  }
  async saveEntry(close) {
    this.storing = true;
    this.update();
    const db = await api.getSource('entries');
    const mdate = new Date();
    const _private = this.shadowRoot.querySelector('#privateCheckbox').value;
    const pinned = this.shadowRoot.querySelector('#pinnedCheckbox').value;
    // there are problems when relying on the "updated" this.entry alone
    // e.g. changing the text and then afterwards changing the topics
    // results in the oldEntry text to be set in this.entry and stored,
    // but on-screen is the changed text
    // therefor querying the result here
    // alternative: set input via query
    const result = this.shadowRoot.querySelector('entry-input').result;
    const selectionResult = this.shadowRoot.querySelector('selection-box').selectionResult;
    //console.log("result: ", result);

    // handle images
    // store/upload new images
    const entryInputElement = this.shadowRoot.querySelector('entry-input');
    const newImages = await entryInputElement.storeUploadImages();
    // upload edited images
    const editImagesElement = this.shadowRoot.querySelector('edit-images');
    const currentImages = await editImagesElement.uploadStoredImages();
    if (newImages.failed || currentImages.failed) {
      console.log("image upload failed, aborting entry creation...");
      this.storing = false;
      this.update();
      return;
    }
    // filter text of images to remove
    const imagesToRemove = currentImages.filter((i)=>i.remove);
    let text = result.text;
    for (const image of imagesToRemove) {
      text = text.replace(image.placeholder, '');
    }
    this.shadowRoot.querySelector('entry-input').loadText(text);
    // remove images to remove
    const updatedImages = currentImages.filter((i)=>!i.remove);
    // remove local images to remove from store
    await editImagesElement.removeMarkedLocalImages();

    // assemble and store entry
    const entry = {
      ...result,
      id: this.oldEntry.id,
      date: this.oldEntry.date,
      mdate: mdate,
      topics: selectionResult.topics,
      tags: selectionResult.tags,
      private: _private,
      pinned: pinned,
      images: [ ...updatedImages, ...newImages ],
      text: text,
    };
    await db.update({ id: this.oldEntry.id }, entry);
    console.log("updated entry!!");
    console.log("id: " + entry.id);
    if (close) window.history.back();
    // reset/update stuff
    this.shadowRoot.querySelector('selection-box').updateNewItems();
    this.storing = false;
    this.updateQuery();
  }
  async deleteEntry() {
    if (!confirm("Do you really want to delete this entry!")) return;
    const db = await api.getSource('entries');
    await db.delete({ id: this.oldEntry.id });
    // remove local images
    const editImagesElement = this.shadowRoot.querySelector('edit-images');
    await editImagesElement.removeLocalImages();
    console.log("entry deleted!!");
    console.log("id: " + this.oldEntry.id);
    window.history.back();
  }
  update() {
    //console.log(this.oldEntry);
    render(html`${style}
      ${ this.oldEntry ?
        html`
          <entry-header .entry=${this.oldEntry} noedit></entry-header>
          <entry-input .oldEntry=${this.oldEntry}
                       @loaded=${(e)=>this.entry=e.detail}
                       @inputchange=${(e)=>{this.entry = e.detail}}
                       cols="45" rows=${this.oldEntry.type === 'note' ? 10 : 1}>
          </entry-input>
          <div id="buttonsBox">
            <labelled-button class="boxItem" ?disabled=${!this.valid || this.storing}
                             @click=${()=>this.saveEntry()} label="Save">
            </labelled-button>
            <labelled-button class="boxItem" ?disabled=${!this.valid || this.storing}
                             @click=${()=>this.saveEntry(true)}
                             label="Save and Close">
            </labelled-button>
            <a id="cancelButton" class="boxItem" href="javascript:history.back()">Cancel</a>
            <labelled-checkbox id="privateCheckbox"
                               ?checked=${this.oldEntry.private}>Private</labelled-checkbox>
            <labelled-checkbox id="pinnedCheckbox" class="boxItem"
                               ?checked=${this.oldEntry.pinned}>Pin</labelled-checkbox>
            <labelled-button id="deleteButton" ?disabled=${!this.valid} warn
                             @click=${()=>this.deleteEntry(true)}
                             label="Delete"></labelled-button>
          </div>
          <pre>[preview todo]</pre>
          <selection-box .loaditems=${this.oldEntry}
                         @selectionchanged=${(e)=>this.selectionResult = e.detail}>
          </selection-box>
          <edit-images .loadimages=${this.currentImages}
                       @imagechange=${(e)=>this.currentImages = e.detail}></edit-images>`
        : html`<pre>Ooops, entry not found... :/</pre>` }
      `, this.shadowRoot);
  }
}

customElements.define('view-edit-entry', ViewEditEntry);
