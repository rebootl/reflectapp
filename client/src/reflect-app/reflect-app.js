import { html, render } from 'lit-html';
import { myrouter } from './resources/router.js';
import { loggedIn } from './resources/auth.js';
import './main-header.js';
import './editor-menu.js';
//import './main-content.js';
import './view-entries.js';
//import './view-single-entry.js';
import './view-edit-entry.js';

const style = html`
  <style>
    :host {
      /* "theme" colors, fonts, etc.
         -> evtl. move to base.css later    */

      /* material dark theme color scheme */
      --primary: #9cdede;
      --primary-variant: #287b7b;
      --secondary: #c47be0;
      --background: #121212;
      /* alt */
      /*--background: #020202;*/
      --surface: #0b0b0b;
      --error: #cf6679;
      --on-primary: #000;
      --on-primary-variant: #fff;
      --on-secondary: #000;
      --on-background: #fff;
      --on-surface: #fff;
      --on-error: #000;

      --light-text-hig-emph: rgba(255, 255, 255, 0.87);
      --light-text-med-emph: rgba(255, 255, 255, 0.6);
      --light-text-low-emph: rgba(255, 255, 255, 0.38);

      --on-background-border: #222;
      --on-surface-line: #333;

      --focus: #2f5077;

      /* header */
      --bg-header: #000;
      /* alt. */
      /*--bg-header: #121212;*/
      --bg-header-active: rgb(15, 15, 15);
      --header-bottom-line: rgb(20, 20, 20);
      --header-bottom-line: #101010;

      /* -> remove */
      /* background */
      --bg-floor: rgb(15, 15, 15);
      /* general */
      --bg-front: rgb(41, 41, 41);
      --bg-back: rgb(30, 30, 30);
      --text: rgb(175, 175, 175);
      --border-back: rgb(24, 24, 24);
      --link-text: rgb(156, 222, 222);
      /* menu */
      --bg-menu: rgb(20, 20, 20);
      --bg-menu-hover: rgb(25, 25, 25);
      --bg-menu-active: rgb(30, 30, 30);
      --text-menu: rgb(170, 170, 170);
      --text-menu-inactive: rgb(110, 110, 110);
      --menu-line: rgb(45, 45, 45);
      /* entries */
      --text-inactive: rgb(90, 90, 90);
      --bg-private: rgb(35, 35, 35);
      --text-private: rgb(125, 125, 125);
      --link-private: rgb(196, 123, 224);
      font-family: Helvetica, sans-serif;

      display: block;
      box-sizing: border-box;
      background-color: var(--background);
      height: 100vh;
      overflow: auto;
      color: var(--on-background);
    }
    a {
      color: var(--primary);
    }
    #wrapper-container {
      display: grid;
      grid-template-columns: 100%;
      grid-template-areas:
        "header"
        "main-menu"
        "add-box"
        "main-content";
    }
    header {
      grid-area: header;
    }
    nav {
      grid-area: main-menu;
      background-color: var(--surface);
    }
    #add-box {
      grid-area: add-box;
      height: 50px;
      /*border: 1px dashed #333;*/
    }
    main {
      grid-area: main-content;
    }
    @media all and (min-width: 680px) {
      #wrapper-container {
        grid-template-columns: 230px auto;
        grid-template-rows: auto 1fr;
        grid-template-areas:
          "header     header"
          "main-menu  main-content"
          "add-box    main-content";
        min-height: calc(100vh - 49px);
      }
      main {
        max-width: 650px;
      }
    }
    @media all and (min-width: 870px) {
      #wrapper-container {
      }
    }
    @media all and (min-width: 1142px) {
      /* 1130px + 12px scrollbar */
      #wrapper-container {
        grid-template-columns: 230px auto 230px;
        grid-template-rows: 48px auto;
        grid-template-areas:
          "header     header        header"
          "main-menu  main-content  add-box";
      }
      main {
        width: 650px;
        justify-self: center;
      }
    }
    #add-box {
      display: block;
      background-color: var(--surface);
      height: 100%;
    }
  </style>
`;

class ReflectApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    myrouter.register(this);
  }
  routerUpdate() {
    this.update();
  }
  _getBrowseMenu() {
    return html`<nav><browse-menu>[ -> browse menu ]</browse-menu></nav>`;
  }
  _getOverviewMenu() {
    return html`<nav><overview-menu>[ -> overview menu ]</overview-menu></nav>`;
  }
  _getContent() {
    const r = myrouter.getRoute();
    if (r.startsWith('~')) {
      return html`${this._getBrowseMenu()}
                  <main><browse-content>[ -> browse content ]</browse-content></main>`;
    }
    if (r === 'editor') {
      if (!loggedIn()) return html`${this._getOverviewMenu()}
                                   <main>[ -> login or sign-up ]</main>`;
      // if <part> starts with ~ load the edit view
      const p0 = myrouter.getParts(0)[0];
      if (p0) if (p0.startsWith('~'))
        return html`<nav><editor-menu></editor-menu></nav>
                    <main><view-edit-entry .id=${p0.slice(1)}></view-edit-entry></main>`;
      return html`<nav><editor-menu></editor-menu></nav>
                  <main><view-entries></view-entries><main>`;
    }
    if (r === 'signup') {
      if (loggedIn()) return html`${this._getOverviewMenu()}
                                  <main>[ -> you've got an account already... ]</main>`;
      return html`${this._getBrowseMenu()}
                  <main>[ -> show signup page ]<main>`;
    }
    myrouter.setUrl('', [], []);
    return html`${this._getOverviewMenu()}
                <main>[ -> show overview ]</main>`;
  }
  update() {
    render(html`${style}
        <div id="wrapper-container">
          <header><main-header></main-header></header>
          ${this._getContent()}
          <div id="add-box"></div>
        </div>
      `
      , this.shadowRoot);
  }
}

customElements.define('reflect-app', ReflectApp);
