import { html, render } from 'lit-html';
import { apiGetRequest } from './resources/api_request_helpers.js';
import { urlInfoUrl } from './resources/api-service.js';
import { getAuthHeaderJSON } from './resources/auth.js';
import './gen-elements/textarea-input.js';
import './upload-images.js';
import './gen-elements/text-input.js';
import './gen-elements/tag-small.js';
import './gen-elements/upload-button.js';

// smartly insert s into text
function insertString(text, s) {
  let prefix = "";
  if (text !== "" && text.slice(-1) !== '\n') prefix = '\n';
  return text += prefix + s + '\n';
}

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
    textarea-input {
      margin-right: 10px;
      margin-bottom: 10px;
    }
    upload-images {
      margin-top: 7px;
    }
    #typeDetectionBox {
      /*display: block;*/
      padding: 0 0 10px 10px;
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
      margin-bottom: 5px;
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
    return this._comment || this.oldEntry.comment || "";
  }
  get initialText() {
    return this.oldEntry.text || "";
  }
  /*set images(v) {
    this._images = v;
  }
  get images() {
    if (this._images) return this._images;
    if (this.oldEntry) return this.oldEntry.images || [];
  }*/
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
      this.result = { text: text, type: 'link', comment: this.comment };
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
  addImage(image) {
    // generate and insert placeholder
    const textareaInputElement = this.shadowRoot.querySelector('textarea-input');
    const textareaElement = textareaInputElement.shadowRoot.querySelector('textarea');
    const newText = insertString(textareaElement.value, image.placeholder);
    textareaElement.value = newText;
    textareaInputElement.value = newText;
    // insert image result
    // -> query on save / set below / _call store function on save_, too much
    // info has to be passed up otherwise, the images, newImages, keepLocal etc.
    //this.newImages = { ...this.newImages, image };
    this.update();
  }
  removeImage(image) {
    const textareaInputElement = this.shadowRoot.querySelector('textarea-input');
    const textareaElement = textareaInputElement.shadowRoot.querySelector('textarea');
    const newText = textareaElement.value.replace(image.placeholder + '\n', '');
    textareaElement.value = newText;
    textareaInputElement.value = newText;
    this.update()
  }
  async storeUploadImages() {
    return await this.shadowRoot.querySelector('upload-images').storeUploadImages();
  }
  reset() {
    this.shadowRoot.querySelector('#entry-text').reset();
    if (this.shadowRoot.querySelector('#comment'))
      this.shadowRoot.querySelector('#comment').reset();
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
    if (this.result.type === 'link') {
      return html`<tag-small type="link">Link</tag-small>
                  <tag-small type="linkinfo">${this.result.info}</tag-small>
                  <small>Title: <span id="linktitle">${this.result.title}</span></small>`;
    }
    if (this.result.type === 'brokenlink') {
      return html`<tag-small type="link">Link</tag-small>
                  <tag-small type="brokenlink">${this.result.info}</tag-small>
                  <small>${this.result.title}</small>`;
    }
    if (this.result.type === 'image')
      return html`<tag-small type="image">Image</tag-small>`;
    return html`<small>Autodetect<small>`;
  }
  update() {
    const showComment = (this.result.type === 'link' ||
      this.result.type === 'brokenlink' ||
      this.result.type === 'image') ? true : false;
    const disableImageButton =  (this.result.type === 'link' ||
      this.result.type === 'brokenlink') ? true : false;
    render(html`${style}
      <div id="inputArea">
        <textarea-input id="entry-text" rows=${this.rows} cols=${this.cols}
                        @input=${(e)=>this.triggerDetect(e.target.value)}
                        placeholder=${this.placeholder}
                        loadtext=${this.initialText}>
        </textarea-input>
        <upload-images @addimage=${(e)=>this.addImage(e.detail)}
                       @removeimage=${(e)=>this.removeImage(e.detail)}
                       ?disabled=${disableImageButton}>
        </upload-images>
      </div>
      <div id="typeDetectionBox">
        <small id="typeDetection">Type: </small>${this.getTypeDetect()}
      </div>
      ${ showComment ? html`
        <text-input id="comment" size="25"
                    @input=${(e)=>{this.comment = e.target.value.trim()}}
                    placeholder="Add a comment..."
                    loadtext=${this.comment}></text-input>
        ` : html`` }
    `, this.shadowRoot);
  }
}

customElements.define('entry-input', EntryInput);
