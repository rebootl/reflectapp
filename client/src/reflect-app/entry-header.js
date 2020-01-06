import { html, render } from 'lit-html';
import { loggedIn } from './resources/auth.js';
//import format from 'date-fns/format';
import moment from 'moment';

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
    .edit-link {
      float: right;
    }
    :host([noedit]) .edit-link {
      display: none;
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
                  ${ loggedIn() ? html`<a class="edit-link" href="#edit-entry?id=${this.entry.id}">edit</a>` : '' }
                </small>
      `, this.shadowRoot);
  }
}

customElements.define('entry-header', EntryHeader);
