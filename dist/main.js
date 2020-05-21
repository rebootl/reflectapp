import express from 'express';
import compression from 'compression';
import fs from 'fs';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fileupload from 'express-fileupload';
// for url info request
import request from 'request';
import HTMLParser from 'node-html-parser';
// image handling
//import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
// projectData
import Endpoint from '@lsys/projectData/esm/Endpoint';
import { CustomQuery } from '@lsys/projectData/esm/Misc/Custom';
// own imports
//import { storeImage, deleteImage, handleUpdateImages } from './imageStorage.js';
import * as config from '../config.js';
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
// persistent storage
// load data
let data = JSON.parse(fs.readFileSync(config.dataFile, 'utf8'));
// write data
const writeData = () => {
    const str = JSON.stringify(data);
    fs.writeFileSync(config.dataFile, str);
};
// login / jwt stuff
function createToken() {
    // sign with default (HMAC SHA256)
    //let expirationDate =  Math.floor(Date.now() / 1000) + 30 //30 seconds from now
    var token = jwt.sign({ user: config.user.name }, config.secret);
    return token;
}
// setup image storage
function storeImage(i) {
    return new Promise((res, rej) => {
        const randomDirName = crypto.randomBytes(20).toString('hex');
        const imagepath = path.join(config.staticDir, config.mediaDir, randomDirName, i.name);
        console.log('saving image: ', imagepath);
        i.mv(imagepath, (err) => {
            if (err)
                rej(err);
            res({
                originalname: i.name,
                path: imagepath.replace(config.staticDir, ''),
                size: i.size
            });
        });
    });
}
function deleteImage(image) {
    if (!image.uploaded)
        return image;
    if (!image.filepath) {
        console.log("image has no filepath argument, returning");
        return image;
    }
    const fp = path.join(config.staticDir, image.filepath);
    fs.unlink(fp, (err) => {
        if (err)
            console.log('error deleting image:', err);
        console.log('deleted image', fp);
        fs.rmdir(path.dirname(fp), (err) => {
            if (err)
                console.log('error removing directory: ', err);
            console.log('directory removed:', path.dirname(fp));
        });
    });
}
function handleUpdateImages(newImages, oldImages) {
    // compare new/old ids, delete removed images
    const newIds = newImages.map((e) => e.filename);
    const oldIds = oldImages.map((e) => e.filename);
    for (const oldId of oldIds) {
        if (!newIds.includes(oldId)) {
            for (const image of oldImages) {
                if (image.filename === oldId)
                    deleteImage(image);
            }
        }
    }
}
// routes
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
app.get('/api/urlinfo', (req, res) => {
    if (!req.user) {
        console.log('unallowed urlinfo request rejected');
        res.sendStatus(401);
        return;
    }
    const url = req.query.url;
    console.log("url request: ", url);
    request(url, (error, response, body) => {
        if (error) {
            res.send({
                success: false,
                errorMessage: error.code
            });
            return;
        }
        const contentType = response.headers['content-type'];
        const root = HTMLParser.parse(response.body);
        const title = root.querySelector('title').text;
        res.send({
            success: true,
            contentType: contentType,
            statusCode: response.statusCode,
            title: title
        });
    });
});
app.post('/api/uploadMultiImages', async (req, res) => {
    if (!req.user) {
        console.log('unallowed image upload rejected');
        res.sendStatus(401);
        return;
    }
    //console.log(req.user)
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    let files = [];
    const filedata = req.files.filedata;
    if (Array.isArray(filedata)) {
        files = await Promise.all(filedata.map(async (f) => await storeImage(f)));
    }
    else {
        files.push(await storeImage(filedata));
    }
    //console.log(files)
    res.send({
        success: true,
        files: files
    });
});
// projectData endpoints
app.use('/api/entries', new Endpoint({
    query: new CustomQuery({ update: () => data }),
    id: (e) => e.id,
    filter: (e, req) => {
        if (e.private) {
            if (req.user)
                return e;
            else
                return;
        }
        return e;
    },
    add: async (obj, req) => {
        console.log("add entry user: ", req.user);
        if (!req.user)
            return;
        data.push(obj);
        writeData();
    },
    delete: async (obj, req) => {
        if (!req.user)
            return;
        console.log("DELETE");
        // backwards compat.
        if (obj.images) {
            for (const image of obj.images) {
                deleteImage(image);
            }
        }
        data = data.filter((v) => v.id !== obj.id);
        writeData();
    },
    update: async (newObj, oldObj, req) => {
        if (!req.user)
            return;
        console.log("UPDATE");
        // remove old entry
        data = data.filter((v) => v.id !== oldObj.id);
        // handle images
        if (!newObj.images)
            newObj.images = [];
        if (!oldObj.images)
            oldObj.images = [];
        handleUpdateImages(newObj.images, oldObj.images);
        // insert new entry
        data.push(newObj);
        writeData();
    }
}).router);
app.listen(config.port);
console.log('listening on ' + config.port);
