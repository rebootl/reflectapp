import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: inline-block;
      box-sizing: border-box;
    }
    :host(:hover) {
      background-color: rgba(255, 255, 255, 0.01);
      border-radius: 5px;
    }
    button {
      /* (padding from chromium) */
      padding: 1px 4px 1px 4px;
      background-color: rgba(0, 0, 0, 0);
      border: 1px solid var(--on-background-border);
      border-radius: 5px;
      cursor: pointer;
      color: var(--light-text-low-emph);
      width: 30px;
      height: 30px;
    }
    /* improve focus on firefox (dotted line) */
    button::-moz-focus-inner {
      border: 0;
    }
    button:focus {
      outline-style: none;
      border: 2px solid var(--focus);
    }
  </style>
`;

class IconButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  getIcon() {
    const type = this.getAttribute('type');
    if (type === 'edit') {
      return html`
        <svg width="100%" height="100%" viewbox="0 0 100 100">
          <line x1="10"  y1="10" x2="80" y2="80" stroke="currentColor" stroke-width="20px"
            transform="rotate(80, 50, 50)" />
          <polygon points="76,89 89,76 93,93" fill="currentColor"
            transform="rotate(80, 50, 50)" />
        </svg>
      `;
    }
    if (type === 'view') {
      return html`
      <svg width="100%" height="100%" viewbox="0 0 100 100">
        <circle cx="50" cy="50" r="20" fill="currentColor" />
        <path d="M 4 50 A 50 45, 0, 0 0, 96 50 A 50 45, 0, 0 0, 4 50"
          style="stroke:currentColor;fill:none;stroke-width:8px;"
          stroke-linecap="round" />
      </svg>`;
    }
    return html`
      <svg viewbox="0 0 100 100">
        <line x1="20" y1="80" x2="50" y2="50" stroke="currentColor" stroke-width="8px" />
        <line x1="30" y1="30" x2="70" y2="70" stroke="currentColor" stroke-width="8px" />
        <polygon points="40,40 60,60 90,30 70,10" stroke="currentColor" stroke-width="8px" fill="none" />
      </svg>
    `;
  }
  update() {
    render(html`${style}
        <button>${this.getIcon()}</button>`
      , this.shadowRoot);
  }
}

customElements.define('icon-button', IconButton);
