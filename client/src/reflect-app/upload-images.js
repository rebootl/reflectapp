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
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.newImages = [];
    this.keepLocal = false;
    this.loading = false;
  }
  connectedCallback() {
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
    let res = [];
    if (this.keepLocal) {
      res = await Promise.all(this.newImages
        .map(async (i) => {
          i.storing = true;
          this.update();
          const r = await imagestore.storeImage(i)
          delete i.storing;
          this.update();
          return r;
        }));
    } else {
      res = await Promise.all(this.newImages
        .map(async (i) => {
          // sets i.uploading and i.progress during upload
          // i.uploaded and i.filepath when success
          for await (const r of imagestore.uploadImageGenerator(i)) {
            i = r;
            this.update();
          }
          return i;
        }));
    }
    this.reset();
    return res;
  }
  reset() {
    this.newImages = [];
    this.update();
  }
  update() {
    render(html`${style}
      <upload-button @change=${(e)=>this._loadImage(e.detail)}>
        Image(s)...
      </upload-button>
      ${ this.newImages.length > 0 ? html`
        <labelled-checkbox ?checked=${this.keepLocal}
                           @click=${()=>this._toggleKeepLocal()}>
          <small>Keep local</small>
        </labelled-checkbox>` : html`` }
      <div id="imageUploadBox">
        ${ this.loading ? html`<small>loading images...</small>` : html``}
        ${ this.newImages.map((i) => html`
          <div class="previewBox">
            ${ i.storing ? html`storing...` : html`` }
            ${ i.uploading ? html`uploading...
              <progress max="100" value=${i.progress}>${i.progress}%</progress>
              ` : html `` }
            <img class="newImagePreview" src="${i.previewData}" />
            <small>${i.filename}</small>
            ${ !i.uploading && !i.uploaded ? html`
              <labelled-button @click=${()=>this._removeImage(i)} warn>
                <small>X</small>
              </labelled-button>` : html`` }
          </div>`) }
      </div>
      `, this.shadowRoot);
  }
}

customElements.define('upload-images', UploadImages);
