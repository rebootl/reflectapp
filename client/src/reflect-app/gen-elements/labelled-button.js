import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: inline-block;
      box-sizing: border-box;
    }
    button {
      background-color: rgba(0, 0, 0, 0.4);
      color: var(--light-text-hig-emph);
      border: 2px solid rgba(0, 0, 0, 0.1); /*var(--on-surface-line);*/
      border-radius: 5px;
      padding: 5px 15px 5px 15px;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      outline: none;
    }
    /* improve focus on firefox (dotted line) */
    button::-moz-focus-inner {
      border: 0;
    }
    button:focus {
      border: 2px solid var(--focus);
    }
    button:disabled {
      color: var(--light-text-low-emph);
      cursor: auto;
    }
    .disabled {
      color: var(--light-text-low-emph);
      cursor: auto;
    }
  </style>
`;

class LabelledButton extends HTMLElement {
  static get observedAttributes() {return ['disabled', 'disabledstyle']}
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  attributeChangedCallback() {
    this.update();
  }
  update() {
    render(html`${style}
        <button ?disabled=${this.hasAttribute('disabled')}
          class=${this.hasAttribute('disabledstyle')?'disabled':''}>
          ${this.getAttribute('label') || html`<slot />`}
        </button>`
      , this.shadowRoot);
  }
  //class=${this.hasAttribute('disabled') ? 'disabled' : ''}
}

customElements.define('labelled-button', LabelledButton);
