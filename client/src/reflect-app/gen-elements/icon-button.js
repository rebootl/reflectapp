import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: inline-block;
      box-sizing: border-box;
      width: 40px;
    }
    :host(:hover) {
      background-color: rgba(255, 255, 255, 0.01);
    }
    button {
      padding: 5px 5px 0 5px;
      background-color: rgba(0, 0, 0, 0);
      border: 1px solid var(--on-background-border);
      border-radius: 3px;
      cursor: pointer;
    }
    svg {
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
        <svg viewbox="0 0 100 100">
          <line x1="10"  y1="10" x2="80" y2="80" stroke="currentColor" stroke-width="20px"
            transform="rotate(80, 50, 50)" />
          <polygon points="76,89 89,76 93,93" fill="currentColor"
            transform="rotate(80, 50, 50)" />
        </svg>
      `;
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
