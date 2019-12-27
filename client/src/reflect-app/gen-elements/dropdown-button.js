import { html, render } from 'lit-html';

const style = html`
  <style>
    :host {
      display: flex;
      box-sizing: border-box;
      background-color: rgba(0, 0, 0, 0);
      justify-content: center;
      align-items: center;
    }
    #icon {
      padding-left: 5px;
      padding-right: 15px;
    }
    #text {
      min-width: 10px;
    }
  </style>
`;

class DropdownButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});

    // unicode user icon: &#x1F464; doesn't work in chromium :(
    const templ = html`${style}
      <img id="user" src="layout/icons/user-dark_20.png"><span id="text"></span><img id="icon" src="/layout/icons/down_20.png">
    `;

    render(templ, this.shadowRoot);
  }
}

customElements.define('dropdown-button', DropdownButton);
