import { html, render } from 'lit-html';
// (used in add topics/tags)

const style = html`
  <style>
    :host {
      display: inline-block;
      box-sizing: border-box;
      height: 33px;
      line-height: 33px;
      padding-left: 5px;
      padding-right: 5px;
      border-radius: 3px;
      font-size: 14px;
      color: var(--light-text-hig-emph);
      background-color: rgba(255, 255, 255, 0.08);
    }
  </style>
`;

class ItemSmall extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  update() {
    render(html`${style}
      <slot></slot>`,
      this.shadowRoot);
  }
}

customElements.define('item-small', ItemSmall);
