import express from 'express';
import compression from 'compression';
import expressJwt from 'express-jwt';
import fileupload from 'express-fileupload';
import cors from 'cors';
// projectData
import Endpoint from '@lsys/projectData/esm/Endpoint';
// routes
import routeUrlInfo from './routeUrlInfo.js';
import routeUploadMultiImages from './routeUploadMultiImages.js';
import routeLogin from './routeLogin.js';
// db
import getDb from './db.js';
import getEntriesEndpointConfig from './entriesEndpoint.js';
import getUserEndpointConfig from './userEndpoint.js';
// config
import * as config from '../config.js';
// setup app
const app = express();
app.use(cors({
    origin: function (origin, callback) { callback(null, true); },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(compression());
app.use(expressJwt({
    secret: config.secret,
    credentialsRequired: false
}));
app.use(fileupload({
    createParentPath: true
}));
// static files (incl. client)
app.use('/', express.static(config.staticDir));
// routes w/o db access
app.get('/api/urlinfo', async (req, res) => routeUrlInfo(req, res));
app.post('/api/uploadMultiImages', async (req, res) => routeUploadMultiImages(req, res));
// routes that need db access
async function main() {
    const db = await getDb();
    //const entriesCollection = await db.collection('entries');
    //const usersCollection = await db.collection('users');
    app.locals.db = db;
    // login
    app.post('/api/login', async (req, res) => routeLogin(req, res));
    // -> route userlist
    // -> route userentries
    // projectData endpoints
    app.use('/api/user', new Endpoint(await getUserEndpointConfig(db)).router);
    app.use('/api/entries', new Endpoint(await getEntriesEndpointConfig(db)).router);
    // app start
    app.listen(config.port);
    console.log('listening on ' + config.port);
}
main();
