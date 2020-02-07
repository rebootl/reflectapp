import { html, render } from 'lit-html';
import { imagestore, encodeData, compressImage }
  from './resources/imagestore.js';
import './gen-elements/upload-button.js';

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
  </style>
`;

class UploadImages extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.newImages = [];
    this.keepLocal = false;
  }
  connectedCallback() {
    this.update();
  }
  async loadImage(files) {
    // optimize into
    /*
    const newImages = await Promise.all(files.map(async (file)=>({
      placeholder: placeholder,
      filename: file.name,
      osize: file.osize,
      type: file.type,
      lastModified: file.lastModified,
      previewData: await compress(file, 240, 160),
      imageData: await compress(file),
    })));
    */
    for (const file of files) {
      // check
      if (!file.type.startsWith('image/')) continue;
      // check if same image already loaded
      if (this.newImages.map((v)=>v.filename).includes(file.name)) continue;
      // generate and insert placeholder
      const placeholder = `<image_placeholder ${file.name}>`;
      // prepare image object
      const previewImageBlob = await compressImage(file, 240, 240);
      const previewImageData = await encodeData(previewImageBlob);
      const image = {
        placeholder: placeholder,
        filename: file.name,
        osize: file.size,
        type: file.type,
        lastModified: file.lastModified,
        previewData: previewImageData,
        file: file,
        uploaded: false,
      };
      this.newImages.push(image);
      this.dispatchEvent(new CustomEvent('addimage', {detail: image}));
    }
    this.updateImage();
    this.update();
  }
  removeImage(i) {
    this.newImages = this.newImages.filter((v)=>i.filename !== v.filename);
    this.dispatchEvent(new CustomEvent('removeimage', {detail: i}));
    this.updateImage();
    this.update();
  }
  updateImage() {
    this.dispatchEvent(new CustomEvent('updateimage', {detail: {
      newImages: this.newImages,
    }}));
  }
  async storeUploadImages() {
    console.log('store images!!');
    let res = [];
    if (this.keepLocal) {
      res = await imagestore.storeImages(this.newImages);
    } else {
      res = await imagestore.uploadImages(this.newImages);
    }
    this.reset();
    return res;
  }
  toggleKeepLocal() {
    this.keepLocal = !this.keepLocal;
    this.update();
  }
  reset() {
    this.newImages = [];
    this.update();
  }
  update() {
    render(html`${style}
      <upload-button @change=${(e)=>this.loadImage(e.detail)}>
        Image(s)...
      </upload-button>
      ${ this.newImages.length > 0 ? html`
        <labelled-checkbox ?checked=${this.keepLocal}
                           @click=${()=>this.toggleKeepLocal()}>
          <small>Keep local</small>
        </labelled-checkbox>` : html`` }
      <div id="imageUploadBox">
        ${ this.newImages.map((i) => html`
          <div class="previewBox">
            <img class="newImagePreview" src="${i.previewData}" />
            <small>${i.filename}</small>
            <labelled-button @click=${()=>this.removeImage(i)} warn>
              <small>X</small>
            </labelled-button>
          </div>`) }
      </div>
      `, this.shadowRoot);
  }
}

customElements.define('upload-images', UploadImages);
