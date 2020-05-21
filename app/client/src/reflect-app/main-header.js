import { html, render } from 'lit-html';
import './user-menu.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      background-color: var(--bg-header);
      height: 48px;
      border-bottom: 1px solid var(--header-bottom-line);
    }
    #logo-box {
      width: 50px;
      float: left;
    }
    #logo {
      margin-left: auto;
      margin-right: auto;
      display: block;
      padding-top: 4px;
      width: 38px;
    }
    user-menu {
      float: right;
    }
  </style>
`;

class MainHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.update();
  }
  update() {
    render(html`
      ${style}
      <div id="logo-box">
        <a href="#" title="Home">
          <img id="logo" alt="Logo" src="/layout/reflect-logo.svg">
        </a>
      </div>
      <user-menu></user-menu>
    `, this.shadowRoot);
  }
}

customElements.define('main-header', MainHeader);
