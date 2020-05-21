import { html, render } from 'lit-html';
import { api } from './resources/api-service.js';
import { observableList } from './resources/observableList';
import './topic-item.js';

const style = html`
  <style>
    :host {
      box-sizing: border-box;
      background-color: var(--surface);
      color: var(--light-text-hig-emph);
      /* stub height */
      min-height: 100px;
      padding-top: 5px;
      /*border: 1px dashed #333;*/
    }
    ul {
      display: flex;
      flex-wrap: wrap;
      margin: 0;
      padding-left: 0;
      list-style: none;
    }
  </style>
`;

class TopicsList extends HTMLElement {
  get activeTopics() {
    return this._activeTopics || [];
  }
  set activeTopics(v) {
    if (JSON.stringify(v) === JSON.stringify(this._activeTopics)) return;
    this._activeTopics = v;
    if (this.topics) this.update_query();
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.topics = api.observe('entries');
    this.update_query();
    this.update();
  }
  update_query() {
    // get topics
    this.topics.query([
      {$unwind: "$topics"},
      {$group: {_id: "$topics"}},
      {$project: {
        _id: -1, name: "$_id",
        selected: {$in: [
          "$_id",
          this.activeTopics
        ]}
      }},
      {$sort: {name: 1}},
    ]);
  }
  toggle_topic(topic_name) {
    // -> make a setter
    if (this.activeTopics.includes(topic_name)) {
      this.activeTopics.splice(this.activeTopics.indexOf(topic_name), 1);
    } else {
      this.activeTopics.push(topic_name);
    }
    this.selectionchanged();
  }
  reset() {
    this.activeTopics = [];
    this.selectionchanged();
  }
  selectionchanged() {
    this.dispatchEvent(new CustomEvent('selectionchanged',
      {detail: this.activeTopics}));
    this.update_query();
  }
  update() {
    render(html`${style}
      <nav id="topics">
        <ul>
          ${observableList(
              this.topics,
              (v, i) => html`<li>
                <topic-item class=${ v.selected ? 'active' : ''}
                            @click=${() => this.toggle_topic(v.name)}>
                  ${v.name}
                </topic-item>
              </li>`,
              html`<pre>loading...</pre>`
            )}
        </ul>
      </nav>`,
      this.shadowRoot);
  }
}

customElements.define('topics-list', TopicsList);
