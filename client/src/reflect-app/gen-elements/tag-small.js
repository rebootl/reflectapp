import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: inline-block;
      box-sizing: border-box;
      border-radius: 3px;
      padding: 2px;
      font-size: 0.9em;
      color: #000;
    }
    :host([type=topic]) {
      background-color: var(--light-text-med-emph);
      padding: 3px;
    }
    :host([type=tag]) {
      border: 1px solid var(--on-surface-line);
      color: var(--light-text-med-emph);
      border-radius: 9px;
      padding-left: 5px;
      padding-right: 5px;
      background-color: rgba(255, 255, 255, 0.07);
    }
    :host([type=note]) {
      background-color: var(--light-text-med-emph);
    }
    :host([type=link]) {
      background-color: var(--primary);
    }
    :host([type=linkinfo]) {
      background-color: var(--primary-variant);
      color: var(--on-primary);
    }
    :host([type=brokenlink]) {
      background-color: var(--error);
      color: var(--on-error);
    }
    :host([type=image]) {
      background-color: rgb(230, 240, 45);
    }
  </style>
`;

class TagSmall extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  update() {
    render(html`${style}
      <slot></slot>
    `, this.shadowRoot);
  }
}

customElements.define('tag-small', TagSmall);
