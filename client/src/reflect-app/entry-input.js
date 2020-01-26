import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import Compressor from 'compressorjs';
import { apiGetRequest } from './resources/api_request_helpers.js';
import { urlInfoUrl } from './resources/api-service.js';
import { getAuthHeaderJSON } from './resources/auth.js';
import './gen-elements/textarea-input.js';
import './gen-elements/text-input.js';
import './gen-elements/tag-small.js';
import './gen-elements/upload-button.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      color: var(--light-text-med-emph);
    }
    /* does this work?
    textarea-input {
      height: 25px;
    }*/
    #inputArea {
      display: flex;
      flex-wrap: wrap;
    }
    upload-button {
      margin-top: 7px;
      margin-left: 5px;
      margin-bottom: 15px;
    }
    #typeDetectionBox {
      /*display: block;*/
      padding: 10px 0 10px 10px;
      color: var(--light-text-low-emph);
    }
    tag-small {
      /* avoid moving down of stuff when element appears */
      display: inline;
      margin-right: 5px;
    }
    #linktitle {
      color: var(--light-text-med-emph);
    }
    #comment {
      display: none;
      margin-bottom: 5px;
    }
    #comment.active {
      display: block;
    }
    #imageUploadBox {
      margin-top: 7px;
      display: flex;
      flex-wrap: wrap;
    }
    .previewBox {
      width: 100px;
      overflow-wrap: break-word;
    }
    .previewBox small {
      font-size: 0.8em;
    }
    .newImagePreview {
      width: 50px;
    }
  </style>
`;

// adapted from: https://stackoverflow.com/questions/27078285/simple-throttle-in-js
function throttle(func, delay=1000) {
  //console.log("throttle :D:D:D");
  let timeout = null;
  return function() {
    if (!timeout) {
      timeout = setTimeout(() => {
        func.call();
        timeout = null;
      }, delay);
    }
  }
}

const compressImage = (file, maxWidth=1920, maxHeight=1920) => {
  return new Promise((res, rej) => {
    new Compressor(file, {
      maxWidth,
      maxHeight,
      success(result) {
        res(result);
      },
      error(err) {
        rej(err);
      }
    });
  });
};

// base64 encode data
const encodeData = (file) => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      res(reader.result);
    }
    reader.readAsDataURL(file);
  });
};

class EntryInput extends HTMLElement {
  set oldEntry(v) {
    this._oldEntry = v;
    this.dispatchEvent(new CustomEvent('loaded', {detail: v}));
  }
  get oldEntry() {
    return this._oldEntry || {};
  }
  set ready(v) {
    this._ready = v;
    this.dispatchEvent(new CustomEvent('ready', {detail: v}));
  }
  get ready() {
    return this._ready || false;
  }
  set status(v) {
    this._status = v;
    // include pending here in order to avoid "flickering" of
    // selection display
    this.ready = (v === 'complete' || v === 'pending') ? true : false;
    this.update();
  }
  get status() {
    return this._status || 'initial';
  }
  set result(v) {
    this._result = v;
    //console.log(v);
    this.dispatchEvent(new CustomEvent('inputchange', {detail: v}));
    this.update();
  }
  get result() {
    return this._result || this.oldEntry;
  }
  set comment(v) {
    this._comment = v;
    this.result = {...this.result, comment: v};
  }
  get comment() {
    return this._comment || "";
  }
  get placeholder() {
    return this.getAttribute('placeholder') || "New Entry...";
  }
  get rows() {
    return this.getAttribute('rows') || 1;
  }
  get cols() {
    return this.getAttribute('cols') || 30;
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.newImages = [];
    this.update();
    //this.detectThrottled = throttle((v)=>{this.detect(v)}, 1000);
    /*
    (v) => {
      this.result = {text: v, detection: 'typing'};
      this.update();
      throttle(()=>{this.detect(v)}, 1000);
    }*/
  }
  async setUrlInfo(url) {
    await apiGetRequest(
      urlInfoUrl + '?url=' + encodeURIComponent(url),
      getAuthHeaderJSON()
    )
      .then(data => {
        // shorten the content type string from utf-iso-blabla stuff..
        const contentType = data.contentType.startsWith('text/html') ?
          'text/html' : data.contentType;
        this.result = {
          ...this.result,
          info: contentType,
          title: data.title
        };
        this.status = 'complete';
      })
      .catch((e)=>{
        if (e.code === 'ERESPONSE') {
          this.result = {
            ...this.result,
            type: 'brokenlink',
            info: "broken link :(",
            title: e.message
          };
          this.status = 'complete';
        } else {
          console.log("url info request error: " + e.message);
          console.log(e);
          this.result = {
            ...this.result,
            info: "(url info request failed...)",
            title: ""
          };
          this.status = 'complete';
        }
      });
  }
  async detect(text) {
    // using the URL constructor for detection leads to wrong results
    // e.g. "todos:" is detected as a url...
    if (typeof(text) === 'undefined' || text === "") {
      this.result = {};
      this.status = 'initial';
      return;
    }
    if (text.startsWith("http://") || text.startsWith("https://")) {
      this.status = 'pending';
      this.result = { url: text, type: 'link', comment: this.comment };
      await this.setUrlInfo(text);
      return;
    }
    if (/^<image_placeholder .*?>/.test(text)) {
      this.result = { ...this.result, text: text, type: 'image',
        comment: this.comment };
      this.status = 'complete';
      return
    }
    this.result = { ...this.result, text: text, type: 'note' };
    this.status = 'complete';
    return;
  }
  triggerDetect(text) {
    // (by Luca)
    //console.log("triggered");
    //this.text = text;
    if (this.detectPending) return;
    this.detectQueue = (async ()=>{
      await this.detectQueue;
      this.detectPending = false;
      await this.detect(text);
    })();
    this.detectPending = true;
  }
  loadText(text) {
    this.shadowRoot.querySelector('textarea-input').loadText(text);
    //this.triggerDetect(text);
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
      // generate and insert placeholder
      const placeholder = `<image_placeholder ${file.name}>`;
      const textareaInputElement = this.shadowRoot.querySelector('textarea-input');
      const textareaElement = textareaInputElement.shadowRoot.querySelector('textarea');
      let prefix = "";
      if (textareaElement.value !== "" && textareaElement.value.slice(-1) !== '\n')
        prefix = '\n';
      const inputText = textareaElement.value += prefix + placeholder + '\n';
      textareaElement.value = inputText;
      textareaInputElement.value = inputText;

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
        uploaded: false
      };
      console.log(image);
      this.newImages.push(image);
    }
    this.result = {
      ...this.result,
      images: this.newImages
    };
    this.update();
  }
  reset() {
    this.shadowRoot.querySelector('#entry-text').reset();
    this.shadowRoot.querySelector('#comment').reset();
    this.newImages = [];
    this.status = 'initial';
    this.result = {};
  }
  getTypeDetect() {
    if (this.status.detection === 'typing')
      return html`<small>typing...</small>`;
    if (this.result.type === 'note')
      return html`<tag-small type="note">Note</tag-small>`;
    if (this.result.type === 'link' && this.status === 'pending') {
      return html`<tag-small type="link">Link</tag-small>
                  <small>getting URL info...</small>`;
    }
    if (this.result.type === 'link' && this.status === 'complete') {
      return html`<tag-small type="link">Link</tag-small>
                  <tag-small type="linkinfo">${this.result.info}</tag-small>
                  <small>Title: <span id="linktitle">${this.result.title}</span></small>`;
    }
    if (this.result.type === 'brokenlink' && this.status === 'complete') {
      return html`<tag-small type="link">Link</tag-small>
                  <tag-small type="brokenlink">${this.result.info}</tag-small>
                  <small>${this.result.title}</small>`;
    }
    if (this.result.type === 'image')
      return html`<tag-small type="image">Image</tag-small>`;
    return html`<small>Autodetect<small>`;
  }
  update() {
    const commentClasses = { active: (this.result.type === 'link' ||
      this.result.type === 'brokenlink') || (this.result.type === 'image') };
    let loadtext = "";
    let loadcomment = "";
    if (this.oldEntry.type === 'note') loadtext = this.oldEntry.text;
    else if (this.oldEntry.type === 'link' || this.oldEntry.type === 'brokenlink') {
      loadtext = this.oldEntry.url;
      loadcomment = this.oldEntry.comment;
    }
    else if (this.oldEntry.type === 'image') {
      loadtext = this.oldEntry.text;
      loadcomment = this.oldEntry.comment;
    }
    render(html`${style}
      <div id="inputArea">
        <textarea-input id="entry-text" rows=${this.rows} cols=${this.cols}
                    @input=${(e)=>this.triggerDetect(e.target.value)}
                    placeholder=${this.placeholder}
                    loadtext=${loadtext}></textarea-input>
        <upload-button
          @change=${(e)=>this.loadImage(e.detail)}>Image(s)...</upload-button>
        <div id="imageUploadBox">
          ${ this.newImages.map((i) => html`
            <div class="previewBox">
              <img class="newImagePreview" src="${i.previewData}" />
              <small>${i.filename}</small>
              <!--<labelled-button><small>Keep local</small></labelled-button>-->
            </div>`) }
        </div>
      </div>
      <div id="typeDetectionBox">
        <small id="typeDetection">Type: </small>${this.getTypeDetect()}
      </div>
      <text-input id="comment" size="25" class=${classMap(commentClasses)}
                  @input=${(e)=>{this.comment = e.target.value.trim()}}
                  placeholder="Add a comment..."
                  loadtext=${loadcomment}></text-input>
      `,
      this.shadowRoot);
  }
}

customElements.define('entry-input', EntryInput);
