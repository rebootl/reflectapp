import { html, render } from 'lit-html';
import { imagestore } from './resources/imagestore.js';

const style = html`
  <style>
    :host {
      display: flex;
      box-sizing: border-box;
      flex-wrap: wrap;
    }
    .imageBox {
      display: flex;
      flex-direction: column;
      width: 150px;
      align-items: center;
    }
    .filename {
      display: block;
      overflow-wrap: anywhere;
      margin-bottom: 5px;
    }
    .uploadCheckbox {
      margin-top: 10px;
      margin-bottom: 10px;
    }
    .imageBox img {
      width: 100%;
    }
  </style>
`;

class EditImages extends HTMLElement {
  set loadimages(v) {
    this._images = v;
    this.update();
  }
  get images() {
    return this._images || [];
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  _toggleRemoval(i) {
    i.remove = !i.remove;
    this.update();
  }
  _toggleUpload(i) {
    // -> make this button "upload now" instead ?!
    if (i.upload) {
      delete i.upload;
    } else {
      i.upload = true;
    }
    this.update();
  }
  async removeMarkedLocalImages() {
    // remove local images that are marked for removal from store
    // called when entry saved
    await Promise.all(this.images
      .filter((i)=>i.remove && !i.uploaded)
      .map((i)=>imagestore.deleteStoredImage(i.filename)));
  }
  async removeLocalImages() {
    // remove all loaded local images from store
    // called when entry deleted
    await Promise.all(this.images
    .filter((i)=>!i.uploaded)
    .map((i)=>imagestore.deleteStoredImage(i.filename)));
  }
  async uploadStoredImages() {
    // also called when entry saved
    const res = await Promise.all(this.images.map(async (i) => {
      if (i.upload) {
        // sets i.uploading and i.progress during upload
        // i.uploaded and i.filepath when success
        for await (const r of imagestore.uploadStoredImageGenerator(i)) {
          i = r;
          this.update();
        }
      }
      return i;
    }));
    // check for failed upload
    let failed = false;
    for (const i of res) {
      if (i.failed) {
        this._handleUploadAbort();
        failed = true;
        break;
      }
    }
    if (failed) return false;
    // cleanup file object if everything ok
    for (const i of res) {
      if (i.uploaded) delete i.upload;
      if (i.file) delete i.file;
    }
    return res;
  }
  _handleUploadAbort() {
    for (const i of this.images) {
      if (i.uploaded && i.upload) {
        // -> delete on server
        i.uploaded = false;
        delete i.filepath;
      }
    }
  }
  // (query on save instead)
  /*  this.dispatchChange();
  dispatchChange() {
    this.dispatchEvent(new CustomEvent('imagechange', {detail: this.images}));
    this.update();
  }*/
  update() {
    render(html`${style}
      ${ this.images.map((i) => html`
        <div class="imageBox">
          ${ i.uploading ? html`uploading...
            <progress max="100" value=${i.progress}>${i.progress}%</progress>
            <labelled-button @click=${()=>i.request.abort()} warn>
              Abort
            </labelled-button>
            ` : html `` }
          <img class="preview" src=${i.previewData} />
          <small class="filename">${i.filename}</small>
          ${ !i.uploaded && !i.remove ? html`
            stored locally<br>
            <labelled-checkbox class="uploadCheckbox"
                               ?checked=${i.upload}
                               @click=${e=>this._toggleUpload(i)}>
              Upload
            </labelled-checkbox>
            ` : html`` }
          ${ !i.uploading ? html`
            ${ i.remove ? html`
              Marked for removal!
              <labelled-button @click=${e=>this._toggleRemoval(i)}>
                Keep
              </labelled-button>` : html`
              <labelled-button warn @click=${(e)=>this._toggleRemoval(i)}>
                Remove
              </labelled-button>` }
          ` : html`` }
        </div>` )}
    `, this.shadowRoot);
  }
}

customElements.define('edit-images', EditImages);
