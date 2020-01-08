import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    button {
      background-color: var(--bg-back);
      color: var(--text);
      border: 1px solid var(--border-back);
      width: 30px;
      height: 30px;
      padding: 4px 0 0 0;
      cursor: pointer;
    }
  </style>
`;

class CloseButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  update() {
    render(html`${style}
        <button><img src="layout/icons/close_20.png"></button>`
      , this.shadowRoot);
  }
}

customElements.define('close-button', CloseButton);
