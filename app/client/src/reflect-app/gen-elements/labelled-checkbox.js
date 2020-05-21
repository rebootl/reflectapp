import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: inline-block;
      box-sizing: border-box;
      color: var(--light-text-med-emph);
    }
    button {
      width: 27px;
      height: 27px;
      padding: 0px 5px 0px 5px;
      background-color: rgba(0, 0, 0, 0.4);
      color: var(--light-text-hig-emph);
      border: 2px solid rgba(0, 0, 0, 0.1);
	    border-radius: 3px;
      vertical-align: middle;
      text-align: center;
      font-weight: bold;
      font-size: 16px;
      outline: bono;
    }
    /* improve focus on firefox (dotted line) */
    button::-moz-focus-inner {
      border: 0;
    }
    button:focus {
      border: 2px solid var(--focus);
    }
    label {
      margin-left: 5px;
    }
  </style>
`;

class LabelledCheckbox extends HTMLElement {
  set value(v) {
    this._value = v;
    this.dispatchEvent(new CustomEvent('changed'));
    this.update();
  }
  get value() {
    return this._value || false;
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.hasAttribute('checked') ? this.value = true : this.value = false;
    this.update();
  }
  toggle() {
    this.value ? this.value = false : this.value = true;
  }
  update() {
    render(html`${style}
        <button id="checkbox" @click=${(e)=>this.toggle()}>
          ${ this.value ? html`&#10003;` : html`` }
        </button><label id="label"><slot></slot></label>
      `
      , this.shadowRoot);
  }
}

customElements.define('labelled-checkbox', LabelledCheckbox);
