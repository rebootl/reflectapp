import { html, render } from 'lit-html';
import './main-header.js';
import './main-menu.js';
import './main-content.js';

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
        "main-menu"
        "add-box"
        "main-content";
    }
    main-menu {
      grid-area: main-menu;
    }
    #add-box {
      grid-area: add-box;
      height: 50px;
      /*border: 1px dashed #333;*/
    }
    main-content {
      grid-area: main-content;
    }
    @media all and (min-width: 680px) {
      #wrapper-container {
        grid-template-columns: 230px auto;
        grid-template-rows: auto 1fr;
        grid-template-areas:
          "main-menu  main-content"
          "add-box    main-content";
        min-height: calc(100vh - 49px);
      }
      main-content {
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
        grid-template-rows: auto;
        grid-template-areas:
          "main-menu  main-content  add-box";
      }
      main-content {
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

/* handle params in subcomp.
const params = new URLSearchParams(params_str);
for (let p of params) {
  console.log(p);
}
console.log(params.getAll('foo'));
*/

class ReflectApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.update();
  }
  update() {
    render(html`${style}
        <main-header></main-header>
        <div id="wrapper-container">
          <main-menu></main-menu>
          <div id="add-box"></div>
          <main-content></main-content>
        </div>
      `
      , this.shadowRoot);
  }
}

customElements.define('reflect-app', ReflectApp);
