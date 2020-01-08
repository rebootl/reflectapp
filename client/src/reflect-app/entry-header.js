import { html, render } from 'lit-html';
import moment from 'moment';
import './gen-elements/icon-button.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      color: var(--light-text-low-emph);
    }
    :host(.private) a {
      color: var(--secondary);
    }
    /*.icon {
      vertical-align: middle;
      padding-left: 3px;
      opacity: 0.87;
    }*/
    a {
      color: var(--primary);
    }
  </style>
`;

class EntryHeader extends HTMLElement {
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
    render(html`${style}
                <small class="le-header-text">
                  ${moment(new Date(this.entry.date)).format('ddd MMM D YYYY - HH:mm:ss')}
                  ${ this.entry.private ? html`(private)` : html``}
                  <a href="#entry?id=${this.entry.id}">view</a>
                </small>
      `, this.shadowRoot);
  }
}

customElements.define('entry-header', EntryHeader);
