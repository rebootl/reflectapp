
// components that want routing should register using:
//   Router.register(this)
//
// they shall implement:
//   comp.router_register(url_state_obj)
//   comp.router_update(url_state_obj)
//   comp.router_load(url_state_obj)
// which will be called on url update/page load/register
//
// url_state_obj being something like: {
//  route: 'blabla',
//  params: {
//    k1: 'v1',
//    k2: 'v2'
//  }
// }
//
//
// example.com/#<route>/<part>/<part>/?<parameters>
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
    console.log("router register: ", comp);
    registeredComponents.add(comp);
  }
  triggerUpdate() {
    this.urlChange();
  }
  urlChange() {
    this.parseUrl();
    console.log("router update");
    for (const c of registeredComponents) {
      console.log("comp: ", c)
      c.routerUpdate(this._route, this._parts, this._parameters);
    }
  }
  parseUrl() {
    const hashString = location.hash.slice(1) || '';
    // ~username/Chess+Computing+Misc/KSP+Linux/ ? <parameters>
    const [ path, parameters ] = hashString.split('?');
    const pathParts = path.split('/');
    // ~username
    this._route = pathParts[0];
    // [ Chess+Computing+Misc, KSP+Linux ]
    // [ [ Chess, Computing, Misc ], [ KSP, Linux ] ]
    this._parts = pathParts.slice(1).map(p=>p.split('+').map(p=>dec(p)));
    this._parameters = parameters ? parameters.split('&').map((p)=>dec(p)) : [];
  }
  setUrl(route, parts, parameters) {
    const parameterString = parameters.map(p=>enc(p)).join('&');
    const partsStrings = [];
    for (const p of parts) {
      partsStrings.push(p.map(p=>enc(p)).join('+'));
    }
    const partsString = partsStrings.join('/');
    const hashString = '#' + route;
    if (partsString.length > 0) hashString += '/' + partsString;
    if (parameterString.length > 0) hashString += '?' + parameterString;
    window.location.hash = hashString;
  }
}

export const myrouter = new Router();
