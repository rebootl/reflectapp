import { html, render } from 'lit-html';
import { imagestore } from './resources/imagestore.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    #imageUploadBox {
      display: flex;
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
    this.uploading = false;
    this.uploadResult = {};
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
    const imagesToUpload = this.images.filter((i)=>i.upload);
    //console.log(imagesToUpload)
    if (imagesToUpload.length === 0) return this.images;
    const imagesRest = this.images.filter((i)=>!i.upload);
    this.uploading = true;
    this.uploadResult = { progress: 0. };
    this.update();
    for await (const r of imagestore.uploadMultiStoredImagesGenerator(imagesToUpload)) {
      this.uploadResult = r;
      this.update();
    }
    this.uploading = false;
    this.update();
    // handle the upload result
    if (!this.uploadResult.result.success) return false;
    const res = imagesToUpload.map((i) => {
      for (const r of this.uploadResult.result.files) {
        if (i.filename === r.originalname) {
          i.filepath = r.path;
          i.uploaded = true;
          if (i.file) delete i.file;  // -> not needed...
          if (i.upload) delete i.upload;
          return i;
        }
      }
    });
    for (const r of res) {
      imagestore.deleteStoredImage(r.filename);
    }
    console.log(res)
    return [ ...imagesRest, ...res ];
  }
  update() {
    render(html`${style}
      ${ this.uploading ? html`
        <div>
          uploading...<br>
          <progress max="100" value=${this.uploadResult.progress}></progress>
          <labelled-button @click=${()=>this.uploadResult.request.abort()}
                           warn>
            Abort
          </labelled-button>
        </div>
        ` : html `` }
        <div id="imageUploadBox">
      ${ this.images.map((i) => html`
        <div class="imageBox">
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
          ${ !this.uploading ? html`
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
        </div>
    `, this.shadowRoot);
  }
}

customElements.define('edit-images', EditImages);
