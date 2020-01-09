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
    #viewbutton-box {
      position: relative;
    }
    #viewlink {
      margin-left: 5px;
      border: 1px solid var(--on-surface-line);
      border-radius: 5px;
      padding: 1px 3px 0 3px;
    }
    #viewlink:hover {
      background-color: rgba(255, 255, 255, 0.01);
    }
    /* improve focus on firefox (dotted line) */
    #viewlink::-moz-focus-inner {
      border: 0;
    }
    #viewlink:focus {
      outline-style: none;
      border: 2px solid var(--focus);
    }
    #viewlink svg {
      opacity: 0.7;
      font-size: 1.2em;
      vertical-align: -3px;
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
                  <a id="viewlink" href="#entry?id=${this.entry.id}"
                    title="view entry">
                    <svg width="1em" height="1em" viewbox="0 0 100 100">
                      <circle cx="50" cy="50" r="20" fill="currentColor" />
                      <path d="M 4 50 A 50 45, 0, 0 0, 96 50 A 50 45, 0, 0 0, 4 50"
                        style="stroke:currentColor;fill:none;stroke-width:8px;"
                        stroke-linecap="round" />
                    </svg>
                  </a>
                </small>
      `, this.shadowRoot);
  }
}

customElements.define('entry-header', EntryHeader);
