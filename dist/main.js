import express from 'express';
import compression from 'compression';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fileupload from 'express-fileupload';
// projectData
import Endpoint from '@lsys/projectData/esm/Endpoint';
// own imports
import * as config from '../config.js';
import routeUrlInfo from './routeUrlInfo.js';
import routeUploadMultiImages from './routeUploadMultiImages.js';
import getDb from './db.js';
import getEntriesEndpointConfig from './entriesEndpoint.js';
// setup app
const app = express();
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
// login / jwt stuff
function createToken() {
    // sign with default (HMAC SHA256)
    //let expirationDate =  Math.floor(Date.now() / 1000) + 30 //30 seconds from now
    var token = jwt.sign({ user: config.user.name }, config.secret);
    return token;
}
// routes w/o db access
app.get('/api/urlinfo', async (req, res, any) => routeUrlInfo(req, res));
app.post('/api/uploadMultiImages', async (req, res) => routeUploadMultiImages(req, res));
// routes that need db access
async function main() {
    const db = await getDb();
    const entriesCollection = await db.collection('entries');
    // login
    app.post('/api/login', (req, res) => {
        if (req.body.username !== config.user.name) {
            res.sendStatus(401);
            return;
        }
        bcrypt.compare(req.body.password, config.user.pwhash).then((check) => {
            if (check) {
                console.log("login ok");
                res.send({
                    success: true,
                    token: createToken()
                });
            }
            else {
                console.log("login failed");
                res.sendStatus(401);
            }
        });
    });
    // projectData endpoints
    const entriesEndpointConfig = await getEntriesEndpointConfig(db, entriesCollection);
    app.use('/api/entries', new Endpoint(entriesEndpointConfig).router);
    app.listen(config.port);
    console.log('listening on ' + config.port);
}
main();
