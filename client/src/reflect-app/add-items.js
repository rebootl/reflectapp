import { html, render } from 'lit-html';
import './gen-elements/text-input.js';
import './gen-elements/labelled-button.js';
import './item-small.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      background-color: var(--surface);
      color: var(--light-text-hig-emph);
      /* stub height */
      padding-top: 5px;
      padding-left: 5px;
      /*border: 1px dashed #333;*/
    }
    .inline-block {
      display: inline-block;
    }
    .inline {
      display: inline;
    }
  </style>
`;

class AddItems extends HTMLElement {
  get inputValue() {
    return this._inputValue || "";
  }
  set inputValue(v) {
    this._inputValue = v;
    this.update();
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.newItems = [];
    this.update();
  }
  add_topic() {
    if (this.newItems.includes(this.inputValue)) return;
    this.newItems.push(this.inputValue);
    this.inputValue = "";
    this.shadowRoot.querySelector('text-input').reset();
    this.itemschanged();
  }
  remove_topic(t) {
    this.newItems = this.newItems.filter((e)=> e !== t );
    this.itemschanged();
  }
  reset() {
    this.newItems = [];
    this.itemschanged();
  }
  itemschanged() {
    this.dispatchEvent(new CustomEvent('itemschanged',
      {detail: this.newItems}));
    this.update();
  }
  update() {
    render(html`${style}
      ${this.newItems.map((t) => html`<item-small>${t}</item-small>
      <labelled-button @click=${()=>this.remove_topic(t)}>
        <svg width="1em" height="1em" viewbox="0 0 100 100">
          <line x1="10"  y1="10" x2="90" y2="90" stroke="currentColor" stroke-width="16px" />
          <line x1="90"  y1="10" x2="10" y2="90" stroke="currentColor" stroke-width="16px" />
        </svg>
      </labelled-button>`)}
      <text-input @input=${(e)=>this.inputValue = e.target.value.trim()}
                  placeholder=${this.getAttribute('label')}></text-input>
      <labelled-button ?disabled=${!this.inputValue}
                       @click=${()=>this.add_topic()}>
        <svg width="1em" height="1em" viewbox="0 0 100 100">
          <line x1="50"  y1="00" x2="50" y2="100" stroke="currentColor" stroke-width="16px" />
          <line x1="100"  y1="50" x2="0" y2="50" stroke="currentColor" stroke-width="16px" />
        </svg>
      </labelled-button>
      `,
      this.shadowRoot);
  }
}

customElements.define('add-items', AddItems);
