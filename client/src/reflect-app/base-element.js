import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      background-color: var(--bg-front);
    }
  </style>
`;

class BaseElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  update() {
    render(html`${style}

      `, this.shadowRoot);
  }
}

customElements.define('base-element', BaseElement);
