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
    .emoji {
      height: 1.5em;
      vertical-align: middle;
    }
    a {
      color: var(--primary);
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
      return html`<p id="linktitle">${this.entry.title}</p>
        <a href=${this.entry.url}>${this.entry.url}</a><br />
        <small>${this.entry.info}</small>
        ${ this.entry.comment !== "" ? html`<p id="linkcomment"
          >Comment: ${this.entry.comment}</p>` : html`` }
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
