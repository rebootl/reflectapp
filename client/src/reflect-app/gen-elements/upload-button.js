import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: inline-block;
      box-sizing: border-box;
    }
    label input[type="file"] {
      position:absolute;
      top: -1000px;
    }
    label {
      background-color: rgba(0, 0, 0, 0.4);
      color: var(--light-text-med-emph);
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      padding: 5px 15px 5px 15px;
      font-weight: bold;
      font-size: 16px;
      cursor: pointer;
      outline: none;
    }
    /* improve focus on firefox (dotted line) */
    label::-moz-focus-inner {
      border: 0;
    }
    label:focus {
      border: 2px solid var(--focus);
    }
    label:disabled {
      color: var(--light-text-low-emph);
      cursor: auto;
    }
    .disabled {
      color: var(--light-text-low-emph);
      cursor: auto;
    }
  </style>
`;

class UploadButton extends HTMLElement {
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
  change(e) {
    this.dispatchEvent(new CustomEvent('change', {detail: e.files}));
  }
  update() {
    render(html`${style}
        <label>
          <input @change=${(e)=>this.change(e.target)} type="file"
            accept="image/*" multiple>
          <span><slot /></span>
        </label>
        `
      , this.shadowRoot);
  }
}

customElements.define('upload-button', UploadButton);
