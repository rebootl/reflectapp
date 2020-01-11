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
    .inlinesvgicon {
      width: 17px;
      height: 17px;
      vertical-align: -4px;
    }
    #pin {
      color: #ff336c;
    }
    #privatetag {
      color: var(--secondary);
    }
    #viewlink {
      text-decoration: none;
      padding-left: 3px;
    }
    #linkicon {
      width: 13px;
      opacity: 1;
    }
    #privateicon {
      width: 22px;
      vertical-align: -6px;
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
                  ${ this.entry.pinned ?
                    html`<svg id="pin" class="inlinesvgicon" width="1em" height="1em" viewbox="0 0 100 100">
                      <polygon points="95,30 65,60 60,80 20,40 40,35 70,5" fill="currentColor" />
                      <line x1="60" y1="40" x2="20" y2="80" stroke="currentColor" stroke-width="6px" />
                      <polygon points="18,78 12,88 22,82" fill="currentColor" />
                    </svg>` : html`` }
                  ${ this.entry.private ?
                    html`<span id="privatetag"><img id="privateicon"
                      class="svgicon"
                      src="/layout/icons/mask.svg" /> (private)</span>` :
                    html``}
                  <a id="viewlink" href="#entry?id=${this.entry.id}"
                    title="url"><img id="linkicon"
                      class="svgicon" src="/layout/icons/link.svg" /></a>
                </small>
      `, this.shadowRoot);
  }
  // &#128204; pin symbol
  // &#128279; link symbol
  // &#128373; &#65039;	&#128374; &#65039; detective/private
}

customElements.define('entry-header', EntryHeader);
