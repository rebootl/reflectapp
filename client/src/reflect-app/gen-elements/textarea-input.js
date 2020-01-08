import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: inline-block;
      box-sizing: border-box;
    }
    textarea {
      /*background-color: var(--surface);*/
      background-color: rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 3px;
      padding: 10px;
      line-height: 1.6em;
      color: var(--light-text-med-emph);
    }
    /* improve focus on firefox (dotted line) */
    input:focus {
      outline-style: none;
      border: 2px solid var(--focus);
    }
  </style>
`;

class TextareaInput extends HTMLElement {
  get value() {
    return this._value || "";
  }
  set value(v) {
    this._value = v;
    this.dispatchEvent(new CustomEvent('input'));
  }
  get rows() {
    return this.getAttribute('rows') || 1;
  }
  get cols() {
    return this.getAttribute('cols') || 30;
  }
  get placeholder() {
    return this.getAttribute('placeholder') || "...";
  }
  get loadtext() {
    return this.getAttribute('loadtext') || "";
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
    if (this.loadtext !== "")
      this.dispatchEvent(new CustomEvent('loadtext-loaded'));
  }
  reset() {
    this.shadowRoot.querySelector('textarea').value = "";
  }
  update() {
    render(html`
        ${style}
        <textarea rows=${this.rows} cols=${this.cols}
          @input=${(e)=>this.value=e.target.value}
          placeholder=${this.placeholder}>${this.loadtext}</textarea>`
      , this.shadowRoot);
  }
}

customElements.define('textarea-input', TextareaInput);
