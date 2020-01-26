import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import request from 'request'; // for url info request
import cheerio from 'cheerio'; // html parsing
import multer from 'multer'; // multipart form upload (used for images)
import Endpoint from 'projectData/dist/Endpoint';
import { CustomQuery } from 'projectData/dist/Misc/Custom';
import { port, secret, user } from './config.js';

// files/paths
const dataFile = 'db/db.json';
const staticDir = 'client/dist';
// (mediaDir is below staticDir)
const mediaDir = 'media';

// setup app

const app = express();

app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(compression());
app.use(expressJwt({
  secret: secret,
  credentialsRequired: false
}));

// static files (incl. client)
app.use('/', express.static(staticDir,));

// persistent storage

// load data
let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// write data
const writeData = () => {
  const str = JSON.stringify(data);
  fs.writeFileSync(dataFile, str);
};

// setup image storage

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const randomDirName = crypto.randomBytes(20).toString('hex');
    const imagepath = path.join(staticDir, mediaDir, randomDirName);
    fs.mkdir(imagepath, {recursive: true}, (err) => {
      if (err) console.log('error creating path:', err);
      cb(null, imagepath);
    });
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
// -> setup image filter (check for image)

const upload = multer({ storage: storage });

function deleteImage(image) {
  if (!image.uploaded) return image;
  if (!image.filepath) {
    console.log("image has no filepath argument, returning");
    return image;
  }
  const filepath = path.join(staticDir, image.filepath);
  fs.unlink(filepath, (err) => {
    if (err) console.log('error deleting image:', err);
    console.log('deleted image', filepath);
    fs.rmdir(path.dirname(filepath), (err) => {
      if (err) console.log('error removing directory: ', err);
      console.log('directory removed:', path.dirname(filepath));
    });
  });
}

function handleUpdateImages(newImages, oldImages) {
  // compare new/old ids, delete removed images
  const newIds = newImages.map((e)=>e.filename);
  const oldIds = oldImages.map((e)=>e.filename);
  for (const oldId of oldIds) {
    if (!newIds.includes(oldId)) {
      for (const image of oldImages) {
        if (image.filename === oldId) deleteImage(image);
      }
    }
  }
}

// login / jwt stuff

function createToken() {
  // sign with default (HMAC SHA256)
  //let expirationDate =  Math.floor(Date.now() / 1000) + 30 //30 seconds from now
  var token = jwt.sign({ user: user.name }, secret);
  return token;
}

// routes

app.post('/api/login', (req, res) => {
  if (req.body.username !== user.name) {
    res.sendStatus(401);
    return;
  }
  bcrypt.compare(req.body.password, user.pwhash).then((check) => {
    if (check) {
      console.log("login ok");
      res.send({
        success: true,
        token: createToken()
      });
    } else {
      console.log("login failed");
      res.sendStatus(401);
    }
  });
});

app.get('/api/urlinfo', (req, res) => {
  if (!req.user) res.sendStatus(401);
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
    const c = cheerio.load(response.body);
    const title = c('title').text();
    res.send({
      success: true,
      contentType: contentType,
      statusCode: response.statusCode,
      title: title
    });
  });
});

app.post('/api/uploadImage', upload.single('data'), (req, res) => {
  if (!req.user) res.sendStatus(401);
  const path = req.file.path.replace(staticDir, '');
  console.log('store image:', path);
  res.send({
    success: true,
    filepath: path,
  });
});

// projectData endpoints

new Endpoint(app.route('/api/entries'), {
  query: new CustomQuery({ update: ()=>data }),
  id: (e) => e.id,
  filter: (e, req) => {
    if (e.private) {
      if (req.user) return e;
      else return;
    }
    return e;
  },
  add: async (obj, req) => {
    console.log("add entry user: ", req.user);
    if (!req.user) return;
    data.push(obj);
    writeData();
  },
  delete: async (obj, req) => {
    if (!req.user) return;
    for (const image of obj.images) {
      deleteImage(image);
    }
    data = data.filter((v) => v.id !== obj.id);
    writeData();
  },
  update: async (newObj, oldObj, req) => {
    if (!req.user) return;
    console.log("UPDATE");
    // remove old entry
    data = data.filter((v) => v.id !== oldObj.id);
    // handle images
    if (!newObj.images) newObj.images = [];
    if (!oldObj.images) oldObj.images = [];
    handleUpdateImages(newObj.images, oldObj.images);
    // insert new entry
    data.push(newObj);
    writeData();
  }
});

app.listen(port);
console.log('listening on ' + port);
