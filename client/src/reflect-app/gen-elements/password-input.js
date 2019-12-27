import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
    }
    input {
      background-color: rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 3px;
      padding: 10px;
      line-height: 1.6em;
      font-size: 16px;
      color: var(--light-text-med-emph);
    }
  </style>
`;

class PasswordInput extends HTMLElement {
  get value() {
    return this._value || "";
  }
  set value(v) {
    this._value = v;
    this.dispatchEvent(new CustomEvent('input'));
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  update() {
    render(html`${style}
      <input id="${this.getAttribute('id')}" type="password" size="10"
        @input=${(e)=>this.value=e.target.value}
        placeholder="${this.getAttribute('placeholder')}">`
      , this.shadowRoot);
  }
}

customElements.define('password-input', PasswordInput);
