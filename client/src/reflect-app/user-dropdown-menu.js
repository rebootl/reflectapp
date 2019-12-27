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
      display: block;
      box-sizing: border-box;
      background-color: var(--surface);
      /*border: 1px solid var(--border-back);*/
      border-radius: 3px;
      position: relative;
      overflow: hidden;
      color: var(--light-text-hig-emph);
      z-index: 1000;
    }
    .overlay {
      background-color: rgba(255, 255, 255, 0.16);
      padding: 20px 25px 20px 25px;
    }
    /*close-button {
      position: absolute;
      right: 20px;
      top: 12px;
    }*/
    .inputfield {
      margin-bottom: 15px;
    }
    #buttonbox {
      margin-top: 5px;
      display: flex;
      justify-content: center;
    }
    /*#logout-button {
      margin-top: 15px;
    }*/
  </style>
`;

const event_close = new CustomEvent('close', {
  bubbles: true,
});

class UserDropdownMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
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
      this.update_after_success();
    }
    //else {
      // login unsuccessful
      // -> flash message -> do in menu
      // -> evtl. clear form -> do in menu
      //console.log('login unsuccessful');
    //}
  }
  logout() {
    logout();
    //window.location.reload();
    // -> check return ?
    this.update_after_success();
  }
  close() {
    this.dispatchEvent(event_close);
  }
  update_after_success() {
    this.close();
    this.update();
    myrouter.trigger_update();
  }
  get_login_content() {
    if (loggedIn()) {
      return html`<labelled-button id="logout-button"
                                   @click=${()=>this.logout()}
                                   label="Logout"></labelled-button>`;
    } else {
      return html`
      <form>
        <text-input id="username" class="inputfield"
                    placeholder="Username"></text-input>
        <password-input id="password" class="inputfield"
                        placeholder="Password"></password-input>
        <div id="buttonbox">
          <labelled-button @click=${()=>this.submit()}
                           label="Login"></labelled-button>
        </div>
      </form>`;
    }
  }
  /*<h3>Login:</h3>
  <close-button @click=${()=>this.close()}></close-button>*/
  update() {
    render(html`${style}
      <div class="overlay">
        ${this.get_login_content()}
      </div>
      `, this.shadowRoot);
  }
}

customElements.define('user-dropdown-menu', UserDropdownMenu);
