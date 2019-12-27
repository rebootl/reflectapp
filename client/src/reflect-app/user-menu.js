import { html, render } from 'lit-html';
import './user-dropdown-button.js';
import './user-dropdown-menu.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      height: 100%;
      /*width: 65px;*/
      overflow: visible;
      position: relative;
    }
    user-dropdown-menu {
      /*float: right;*/
      position: absolute;
      right: 10px;
      top: 57px;
      display: none;
    }
    .show_menu {
      display: block;
    }
  </style>
`;

class UserMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  toggle_menu() {
    const user_dd_button_el = this.shadowRoot.querySelector('user-dropdown-button');
    user_dd_button_el.classList.toggle('active');
    user_dd_button_el.update();
    this.shadowRoot.querySelector('user-dropdown-menu')
    .classList.toggle('show_menu');
  }
  update() {
    render(html`
      ${style}
      <user-dropdown-button @click=${()=>this.toggle_menu()}></user-dropdown-button>
      <user-dropdown-menu @close=${()=>this.toggle_menu()}></user-dropdown-menu>
    `
    , this.shadowRoot);
  }
}

customElements.define('user-menu', UserMenu);
