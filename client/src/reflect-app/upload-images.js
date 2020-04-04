import { html, render } from 'lit-html';
import { imagestore, encodeData, compressImage } from './resources/imagestore.js';
import './gen-elements/upload-button.js';
import './gen-elements/labelled-checkbox.js';
import './gen-elements/labelled-button.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      color: var(--light-text-med-emph);
    }
    upload-button {
      margin-bottom: 15px;
    }
    #imageUploadBox {
      margin-bottom: 10px;
      display: flex;
      flex-wrap: wrap;
    }
    .previewBox {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 105px;
      overflow-wrap: break-word;
      border: 1px solid #000;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 5px;
      padding: 5px;
    }
    .previewBox small {
      font-size: 0.8em;
      width: 100%;
    }
    .newImagePreview {
      width: 50px;
    }
    progress {
      max-width: 100%;
    }
  </style>
`;

class UploadImages extends HTMLElement {
  static get observedAttributes() {return ['disabled']}
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.newImages = [];
    this.keepLocal = false;
    this.loading = false;
    this.uploading = false;
    this.storing = false;
    this.uploadResult = {};
  }
  connectedCallback() {
    this.update();
  }
  attributeChangedCallback() {
    this.update();
  }
  async _loadImage(files) {
    this.loading = true;
    this.update();
    const newImages = await Promise.all(Array.from(files)
      .filter((file)=>file.type.startsWith('image/'))
      .filter((file)=>!this.newImages.map((v)=>v.filename).includes(file.name))
      .map(async (file)=>{
        const placeholder = `<image_placeholder ${file.name}>`;
        const blob = await compressImage(file, 240, 240);
        const data = await encodeData(blob);
        const image = {
          placeholder: placeholder,
          filename: file.name,
          osize: file.size,
          type: file.type,
          lastModified: file.lastModified,
          previewData: data,
          file: file,
          uploaded: false,
        };
        this.dispatchEvent(new CustomEvent('addimage', {detail: image}));
        return image;
      })
    );
    this.newImages = [ ...this.newImages, ...newImages ];
    this.loading = false;
    this.update();
  }
  _removeImage(i) {
    this.newImages = this.newImages.filter((v)=>i.filename !== v.filename);
    this.dispatchEvent(new CustomEvent('removeimage', {detail: i}));
    this.update();
  }
  _toggleKeepLocal() {
    this.keepLocal = !this.keepLocal;
    this.update();
  }
  async storeUploadImages() {
    console.log('store images!!');
    if (this.newImages.length === 0) return [];
    let res = [];
    if (this.keepLocal) {
      this.storing = true;
      this.update();
      res = await Promise.all(this.newImages.map(async (i) => {
          const r = await imagestore.storeImage(i)
          return r;
      }));
      this.storing = false;
      this.update();
    } else {
      this.uploading = true;
      this.uploadResult = { progress: 0. };
      this.update();
      for await (const r of imagestore.uploadMultiImagesGenerator(this.newImages)) {
        // update progress
        this.uploadResult = r;
        this.update();
      }
      this.uploading = false;
      this.update();
      // handle the upload result
      if (!this.uploadResult.result.success) return false;
      res = this.newImages.map((i) => {
        for (const r of this.uploadResult.result.files) {
          if (i.filename === r.originalname) {
            i.filepath = r.path;
            break;
          }
        }
        delete i.file;
        i.uploaded = true;
        return i;
      });
    }
    this.reset();
    this.update();
    return res;
  }
  reset() {
    this.newImages = [];
    this.loading = false;
    this.uploading = false;
    this.storing = false;
    this.uploadResult = {};
    this.update();
  }
  update() {
    render(html`${style}
      <upload-button ?disabled=${this.hasAttribute('disabled')}
                     @change=${(e)=>this._loadImage(e.detail)}>
        Image(s)...
      </upload-button>
      ${ this.newImages.length > 0 ? html`
        <labelled-checkbox ?checked=${this.keepLocal}
                           @click=${()=>this._toggleKeepLocal()}>
          <small>Keep local</small>
        </labelled-checkbox>` : html`` }
        ${ this.loading ? html`<div><small>loading images...</small></div>` : html``}
        ${ this.storing ? html`<div>storing images...</div>` : html`` }
        ${ this.uploading ? html`
          <div>uploading images...<br>
            <progress max="100" value=${this.uploadResult.progress}></progress>
            <labelled-button @click=${()=>this.uploadResult.request.abort()}
                             warn>
              Abort
            </labelled-button>
          </div>
        ` : html `` }
        <div id="imageUploadBox">
        ${ this.newImages.map((i) => html`
          <div class="previewBox">
            <img class="newImagePreview" src="${i.previewData}" />
            <small>${i.filename}</small>
            ${ !this.uploading && !i.uploaded ? html`
              <labelled-button @click=${()=>this._removeImage(i)} warn>
                <small>X</small>
              </labelled-button>` : html`` }
          </div>`) }
      </div>
      `, this.shadowRoot);
  }
}

customElements.define('upload-images', UploadImages);
