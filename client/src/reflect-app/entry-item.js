import { html, render } from 'lit-html';
import { classMap } from 'lit-html/directives/class-map.js';
import { loggedIn } from './resources/auth.js';
import './entry-header.js';
import './entry-content.js';
import './gen-elements/tag-small.js';
import './gen-elements/icon-button.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      position: relative;
      padding: 15px 20px 15px 20px;
    }
    #editbuttons {
      position: absolute;
      right: 0;
      top: 0;
      z-index: 10;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .editbutton {
      margin-top: 10px;
      margin-right: 10px;
    }
    /* add padding space for buttons,
       still needed tho? */
    .loggedIn {
      padding-right: 35px;
    }
    entry-content {
      margin-top: 16px;
      margin-bottom: 16px;
    }
    #labelslist {
      display: flex;
    }
    tag-small {
      margin-right: 5px;
    }
  </style>
`;

class EntryItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  get entry() {
    return this._entry;
  }
  set entry(v) {
    this._entry = v;
    this.update();
  }
  update() {
    //console.log(this.entry)
    const loggedInClass = { loggedIn: loggedIn() };
    render(html`${style}
        ${ loggedIn() ? html`
          <div id="editbuttons">
            <icon-button id="editbutton" class="editbutton" type="edit"
              title="edit entry"
              @click=${(e)=>window.location.hash = "#edit-entry?id=" + this.entry.id}
              ></icon-button>
          ` : '' }
        <div class=${classMap(loggedInClass)}>
          <entry-header .entry=${this.entry}></entry-header>
          <entry-content .entry=${this.entry}></entry-content>
          <div id="labelslist">
            ${this.entry.topics.map((t) =>
              html`<tag-small type="topic">${t}</tag-small>`)}
            ${this.entry.tags.map((t) =>
              html`<tag-small type="tag">${t}</tag-small>`)}
          </div>
        <div>
      `, this.shadowRoot);
  }
}

customElements.define('entry-item', EntryItem);
