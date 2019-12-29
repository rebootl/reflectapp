import { API } from 'projectData-client';
import { setApi } from 'projectData-client/dist/Inspector.js';
import faker from 'faker';
import { getAuthHeader, loggedIn } from './auth.js';

// request/server urls
export const login_url = '/api/login';
export const url_info_url = '/api/url_info';

// api
export const api = new API(window.location.origin.toString() + '/api/',
  getAuthHeader());
// set api for inspector
setApi(api);

export const create_example_data = async function() {
  // api.setparams...

  // create example data
  const db = await api.getSource('entries');
  await db.delete({"topics": { $size: 3 }});

  const topics  = Array(10).fill(0).map(e => faker.commerce.productName());
  const tags = Array(30).fill(0).map(e => faker.commerce.productAdjective());
  const randomTopic = () => topics[Math.floor(Math.random()*topics.length)];
  const randomTag = () => tags[Math.floor(Math.random()*tags.length)];

  return (async () => {
    for (let x = 0; x < 10; x++) {
      await db.add({topics: Array(3).fill(0).map(e=>({
        topic: randomTopic(),
        tags: Array(6).fill(0).map(e=>randomTag()),
      }))});
    }
    console.log('done');
  })();
}
