import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      /*height: 30px; --> 25px maybe
      line-height: 30px;*/
      padding: 11px 9px 11px 9px;
      border: 2px solid var(--on-surface-line);
      border-radius: 20px;
      margin: 7px 5px 7px 5px;
      color: var(--light-text-med-emph);
      font-size: 16px;
    }
    :host(:hover) {
      cursor: pointer;
      color: var(--light-text-hig-emph);
      background-color: rgba(255, 255, 255, 0.04);
    }
    :host(.active) {
      color: var(--light-text-hig-emph);
      background-color: rgba(255, 255, 255, 0.08);
    }
  </style>
`;

class SubtagItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    this.update();
  }
  update() {
    render(html`${style}
      <slot></slot>`,
      this.shadowRoot);
  }
}

customElements.define('subtag-item', SubtagItem);
