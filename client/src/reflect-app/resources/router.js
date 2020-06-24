//
// url:
//
// /#<route> / <part>+<part>+.. / <part>+<part>+.. / .. / ?<bool>&<bool>&..
// route     parts                                        boolean-parameters
// str      [ [ str, str, .. ], [ str, str, .. ], .. ]    [ str, str, .. ]
//
// examples:
//
// /#editor/Computing+Chess/openings+ai
// view-entries topics       tags
//
// /#edit-entry/entry-id_fooblabla-a4fa49ebb
// view-editor  entry-id
//
// /#~username/Astro+Nature/snapshots
// view-user   topics       tags
//
//
const registeredComponents = new Set();

const dec = decodeURIComponent;
const enc = encodeURIComponent;

class Router {
  constructor() {
    window.addEventListener('hashchange', ()=>this.urlChange());
    window.addEventListener('load', ()=>this.urlChange());
  }
  register(comp) {
    console.log("router register");
    registeredComponents.add(comp);
  }
  unregister(comp) {
    registeredComponents.delete(comp);
  }
  triggerUpdate() {
    this.urlChange();
  }
  urlChange() {
    this.parseUrl();
    console.log("router update");
    for (const c of registeredComponents) {
      c.routerUpdate();
    }
  }
  getRoute() {
    return this._route;
  }
  getParts(n) {
    return this._parts[n] || [];
  }
  getParameters() {
    return this._parameters || [];
  }
  parseUrl() {
    const hashString = location.hash.slice(1) || '';
    // ~username / Chess+Computing+Misc / KSP+Linux / ? <parameters>
    const [ path, parameters ] = hashString.split('?');
    const pathParts = path.split('/');
    // ~username
    this._route = pathParts[0];
    // [ Chess+Computing+Misc, KSP+Linux ]
    // [ [ Chess, Computing, Misc ], [ KSP, Linux ] ]
    this._parts = pathParts.slice(1).map(p=>p.split('+').map(p=>dec(p)));
    // -> needed?
    if (this._parts[0]) if (this._parts[0][0] === '') this._parts[0] = [];

    this._parameters = parameters ? parameters.split('&').map((p)=>dec(p)) : [];
  }
  setUrl(route, parts=[[]], parameters=[]) {
    const parameterString = parameters.map(p=>enc(p)).join('&');
    const pts = [];
    for (const p of parts) {
      // [ [ "Chess", "Computing", "Misc" ], [ "KSP", "Linux" ] ]
      pts.push(p.map(p=>enc(p)).join('+'));
      // [ "Chess+Computing+Misc", "KSP+Linux" ]
    }
    // "Chess+Computing+Misc/KSP+Linux"
    let s = pts[0];
    if (pts[1]) if (pts[1] !== "") s = pts.join('/');

    let hashString = '#' + route;
    if (pts.length > 0) hashString += '/' + s;
    if (parameterString.length > 0) hashString += '?' + parameterString;
    window.location.hash = hashString;
  }
}

export const myrouter = new Router();
