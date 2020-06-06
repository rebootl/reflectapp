import { html, render } from 'lit-html';
import { myrouter } from './resources/router.js';
import './topics-list.js';
import './subtags-list.js';

const style = html`
  <style>
    :host {
      display: block;
      box-sizing: border-box;
      background-color: var(--surface);
      color: var(--light-text-hig-emph);
      /* stub height */
      min-height: 100px;
      padding-top: 5px;
      /*border: 1px dashed #333;*/
    }
    subtags-list {
      border-top: 1px solid var(--on-surface-line);
    }
  </style>
`;

class MainMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    myrouter.register(this);
  }
  /*router_register(url_state_obj) {
    this.update_menu_by_url(url_state_obj);
    this.update();
  }*/
  //router_load(url_state_obj) {}
  routerUpdate(route, parts, parameters) {
    this.activeTopics = parts[0];
    this.activeTags = parts[1];
    this.update();
  }
  /*update_menu_by_url(url_state_obj) {
    const params = url_state_obj.params;
    this.active_topics = params.topics || [];
    this.activeTags = params.subtags || [];
    this.update();
  }*/
  async update_url() {
    // generate url
    // format e.g. #entries?select=true&topic_id[]=3&tag_id[]=2&tag_id[]=3
    // elements:
    // #entries?select=true &topic_id[]=3 &tag_id[]=2 &tag_id[]=3

    let hash_url = "#entries";
    if (this.activeTopics.length > 0) {
      hash_url += "?selected";
      for (const t of this.activeTopics) {
        hash_url += '&topics[]=' + encodeURIComponent(t);
      }
      for (const s of this.activeTags) {
        hash_url += '&subtags[]=' + encodeURIComponent(s);
      }
    }
    // update it
    window.location.hash = hash_url;
  }
  updateUrlTopics(activeTopics) {
    this.activeTopics = activeTopics;
    this.update_url();
  }
  updateUrlSubtags(activeTags) {
    this.activeTags = activeTags;
    this.update_url();
  }
  update() {
    render(html`${style}
      <topics-list
        .activeTopics=${this.activeTopics}
        @selectionchanged=${(e)=>this.updateUrlTopics(e.detail)}>
      </topics-list>
      <subtags-list
        .activeTopics=${this.activeTopics}
        .activeSubtags=${this.activeTags}
        @selectionchanged=${(e)=>this.updateUrlSubtags(e.detail)}>
      </subtags-list>
    `, this.shadowRoot);
  }
}

customElements.define('main-menu', MainMenu);
