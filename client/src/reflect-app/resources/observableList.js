import { html } from 'lit-html';
import { asyncReplace } from 'lit-html/directives/async-replace.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { until } from 'lit-html/directives/until.js';

export function observableList(pv, mapper, loading) {
    if (!mapper) mapper = (v, i) => html`<pre>${i}: ${JSON.stringify(v, null, 4)}</pre>`;
    if (loading === undefined) loading = html`<pre>loading...</pre>`;
    pv = Promise.resolve(pv);

    return html`${until(
        pv.then(
            v=>asyncReplace(
                v,
                (v)=>repeat(
                    v,
                    v=>v,
                    mapper
                )
            )
    ), loading)}`;
}
