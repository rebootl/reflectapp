import { html, render } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

const md = window.markdownit().use(window.markdownitEmoji);
// add twemojis
// (attribution req.)
md.renderer.rules.emoji = (token, idx) => {
  return twemoji.parse(token[idx].content);
};
// -> also https://github.com/commonmark/commonmark.js looks kinda nice,
//    used by https://github.com/intcreator/markdown-element

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      color: var(--light-text-med-emph);
      line-height: 1.5em;
    }
    :host(.private) a {
      color: var(--secondary);
    }
    :host(.list-padding) {
      padding: 2px 35px 5px 35px;
    }
    a {
      color: var(--primary);
    }
    .emoji {
      height: 1.5em;
      vertical-align: middle;
    }
    #linkbox {
      display: inline-block;
      border: 1px solid var(--on-background-border);
      border-radius: 4px;
      padding: 10px 15px 10px 15px;
      position: relative;
    }
    #linkbox:hover {
      background-color: rgba(255, 255, 255, 0.01);
    }
    #clickspan {
      position:absolute;
      width:100%;
      height:100%;
      top:0;
      left: 0;
      z-index: 1;
    }
    #linktitle {
      margin: 0;
      margin-top: 3px;
    }
    #linkinfo {
      color: var(--light-text-low-emph);
    }
    #linkcomment {
      margin: 0;
      color: var(--light-text-low-emph);
    }
  </style>
`;

class EntryContent extends HTMLElement {
  get entry() {
    return this._entry;
  }
  set entry(v) {
    this._entry = v;
    this.update();
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  getContent() {
    if (this.entry.type === 'note') {
      return html`${unsafeHTML(md.render(this.entry.text))}`;
    } else if (this.entry.type === 'link' || this.entry.type === 'brokenlink') {
      return html`
        <div id="linkbox">
          <small><a href=${this.entry.url}><span id="clickspan"
            ></span>${this.entry.url}</a></small>
          <!--<small id="linkinfo">${this.entry.info}</small>-->
          <p id="linktitle">${this.entry.title}</p>
          ${ this.entry.comment !== "" ? html`<small id="linkcomment"
            >${this.entry.comment}</small>` : html`` }
        </div>
      `;
    }
  }
  update() {
    render(html`${style}
                ${this.getContent()}
      `, this.shadowRoot);
  }
}

customElements.define('entry-content', EntryContent);
