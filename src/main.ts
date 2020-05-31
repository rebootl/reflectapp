import express from 'express';
import compression from 'compression';
import expressJwt from 'express-jwt';
import fileupload from 'express-fileupload';

// projectData
import Endpoint from '@lsys/projectData/esm/Endpoint';

// routes
import routeUrlInfo from './routeUrlInfo.js'
import routeUploadMultiImages from './routeUploadMultiImages.js';
import routeLogin from './routeLogin.js';
// db
import getDb from './db.js';
import getEntriesEndpointConfig from './entriesEndpoint.js';
// config
import * as config from '../config.js';

// setup app

const app = express();
app.use(express.json({limit: '10mb'}));
app.use(compression());
app.use(expressJwt({
  secret: config.secret,
  credentialsRequired: false
}));
app.use(fileupload({
  createParentPath: true
}));

// static files (incl. client)
app.use('/', express.static(config.staticDir,));

// routes w/o db access

app.get('/api/urlinfo', async (req: any, res, any) => routeUrlInfo(req, res));
app.post('/api/uploadMultiImages',
  async (req : any, res : any) => routeUploadMultiImages(req, res));

// routes that need db access

async function main() {
  const db = await getDb();
  //const entriesCollection = await db.collection('entries');
  //const usersCollection = await db.collection('users');
  app.locals.db = db;

  // login
  app.post('/api/login', async (req: any, res: any) => routeLogin(req, res));

  // projectData endpoints
  const entriesEndpointConfig = await getEntriesEndpointConfig(db);
  app.use('/api/entries', new Endpoint(entriesEndpointConfig).router);

  // app start
  app.listen(config.port);
  console.log('listening on ' + config.port);
}
main();
