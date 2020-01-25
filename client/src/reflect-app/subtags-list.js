import { html, render } from 'lit-html';
import { api } from './resources/api-service.js';
import { observableList } from './resources/observableList';
import './subtag-item.js';

async function getValidTags(activeTopics) {
  const subtagsSource = await api.getSource('entries');
  const res = await subtagsSource.query([
    {$unwind: "$topics"},
    {$project: {
      topic: "$topics",
      tags: "$tags",
      selected: {$in: [
        "$topics",
        activeTopics
      ]}}
    },
    {$match: {selected: true}},
    {$unwind: "$tags"},
    {$group: {_id: "$tags"}}
  ]);
  return res.map((t)=>t._id);
}

const style = html`
<style>
  :host {
    display: block;
    box-sizing: border-box;
    background-color: var(--surface);
    color: var(--light-text-hig-emph);
    /* stub height */
    /*padding-top: 5px;*/
    /*border: 1px dashed #333;*/
  }
  ul {
    margin: 0;
    padding-left: 0;
    list-style: none;
  }
  #subtags {
  }
  #subtags ul {
    -border-top: 1px solid var(--on-surface-line);
    padding: 5px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .add-topic-tag {
    display: inline;
  }
</style>
`;

class SubtagsList extends HTMLElement {
  get activeTopics() {
    return this._activeTopics || [];
  }
  set activeTopics(v) {
    this._activeTopics = v;
    this.updateTagsFromTopics(v);
    //if (this.observableSubtags) this.update_query();
  }
  get activeSubtags() {
    return this._activeSubtags || [];
  }
  set activeSubtags(v) {
    this._activeSubtags = v;
    if (this.observableSubtags) this.update_query();
  }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  connectedCallback() {
    this.observableSubtags = api.observe('entries');
    this.update_query();
    this.update();
  }
  update_query() {
    // get subtags of selected topics
    //console.log(this.activeSubtags);
    this.observableSubtags.query([
      {$unwind: "$topics"},
      {$project: {
        topic: "$topics",
        tags: "$tags",
        selected: {$in: [
          "$topics",
          this.activeTopics
        ]}}
      },
      {$match: {selected: true}},
      {$unwind: "$tags"},
      {$group: {_id: "$tags"}},
      {$project: {
        _id: -1,
        name: "$_id",
        selected: {$in: [
          "$_id",
          this.activeSubtags
        ]}
      }},
      {$sort: {name: 1}}
    ]);
  }
  async updateTagsFromTopics() {
    // -> why use this function and not update_query?
    const validTags = await getValidTags(this.activeTopics);
    const oldTags = this.activeSubtags;
    this.activeSubtags = this.activeSubtags.filter(t=>validTags.includes(t));
    if (oldTags.length != this.activeSubtags.length) {
      this.selectionchanged();
    }
  }
  toggleSubtag(name) {
    if (this.activeSubtags.includes(name)) {
      this.activeSubtags.splice(this.activeSubtags.indexOf(name), 1);
    } else {
      this.activeSubtags.push(name);
    }
    this.selectionchanged();
    //this.update_url();
  }
  reset() {
    this.activeSubtags = [];
    this.selectionchanged();
  }
  selectionchanged() {
    this.dispatchEvent(new CustomEvent('selectionchanged',
      {detail: this.activeSubtags}));
  }
  update() {
    render(html`${style}
      <nav id="subtags">
        <ul>
          ${observableList(
              this.observableSubtags,
              (v, i) => html`<li>
                <subtag-item class=${ v.selected ? 'active' : ''}
                             @click=${()=>this.toggleSubtag(v.name)}>
                  ${v.name}
                </subtag-item>
              </li>`,
              html`<pre>loading...</pre>`
            )}
        </ul>
      </nav>`,
      this.shadowRoot);
  }
}

customElements.define('subtags-list', SubtagsList);
