import { html, render } from 'lit-html';
import { myrouter } from './resources/router.js';
import { login, logout, loggedIn } from './resources/auth.js';
import './gen-elements/text-input.js';
import './gen-elements/password-input.js';
import './gen-elements/labelled-button.js';
import './gen-elements/close-button.js';

const style = html`
  <style>
    :host {
      display: flex;
      box-sizing: border-box;
      background-color: var(--surface);
      border-radius: 3px;
      position: relative;
      overflow: hidden;
      color: var(--light-text-hig-emph);
      z-index: 1000;
    }
    .overlay {
      background-color: rgba(255, 255, 255, 0.16);
    }
    #loginbox {
      padding: 20px 25px 15px 25px;
    }
    .inputfield {
      margin-bottom: 15px;
    }
    #buttonbox {
      margin-top: 5px;
      display: flex;
      justify-content: center;
    }
    #logout-button {
      margin: 20px;
    }
    small {
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }
    a {
      color: var(--primary);
    }
    .menuitem {
      background-color: rgba(0, 0, 0, 0.28);
      border-bottom: 1px solid rgba(255, 255, 255, 0.16);
    }
    .menuitem a {
      display: inline-block;
      width: 100%;
      height: 100%;
      padding: 20px;
      color: var(--light-text-hig-emph);
      text-decoration: none;
    }
  </style>
`;

const event_close = new CustomEvent('close', {
  bubbles: true,
});

class UserDropdownMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  async submit() {
    const username = this.shadowRoot.getElementById('username').value;
    const pw = this.shadowRoot.getElementById('password').value;
    //console.log(username);
    //console.log(pw);
    // -> make some checks !!!
    const res = await login(username, pw);
    //console.log(res);
    if (res) {
      // login successful
      // -> flash message -> do in menu
      // -> update dropdown-menu, clear form
      // -> update content
      //console.log('login successful');
      //window.location.reload();
      this.updateAfterSuccess();
    }
    //else {
      // login unsuccessful
      // -> flash message -> do in menu
      // -> evtl. clear form -> do in menu
      //console.log('login unsuccessful');
    //}
  }
  logout() {
    if (!confirm("Warning, logging out will delete all locally stored images!"))
      return;
    logout();
    //window.location.reload();
    // -> check return ?
    this.updateAfterSuccess();
  }
  close() {
    this.dispatchEvent(event_close);
  }
  updateAfterSuccess() {
    this.close();
    this.update();
    myrouter.triggerUpdate();
  }
  getLoginContent() {
    if (loggedIn()) {
      return html`
        <div class="menuitem"><a @click=${()=>this.close()} href="#">Overview</a></div>
        <div class="menuitem"><a @click=${()=>this.close()} href="#editor">My Entries</a></div>
        <labelled-button id="logout-button"
                         @click=${()=>this.logout()}
                         label="Logout"></labelled-button>`;
    } else {
      return html`
        <div id="loginbox">
          <text-input id="username" class="inputfield"
                      placeholder="Username"></text-input>
          <password-input id="password" class="inputfield"
                          placeholder="Password"></password-input>
          <div id="buttonbox">
            <labelled-button @click=${()=>this.submit()}
                             label="Login"></labelled-button>
          </div>
          <small><a href="#signup">Sign up</a></small>
        </div>`;
    }
  }
  update() {
    render(html`${style}
      <div class="overlay">
        ${this.getLoginContent()}
      </div>
      `, this.shadowRoot);
  }
}

customElements.define('user-dropdown-menu', UserDropdownMenu);
