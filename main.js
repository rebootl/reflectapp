import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
//import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import request from 'request'; // for url info request
import cheerio from 'cheerio'; // html parsing
import Endpoint from 'projectData/dist/Endpoint';
import { CustomQuery } from 'projectData/dist/Misc/Custom';
import { port, secret, user } from './config.js';

// files/paths
const dataFile = 'db/db.json';
const staticDir = 'client/dist';
// (mediaDir is below staticDir)
const mediaDir = 'media';

// app
const app = express();

app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(compression());
app.use(expressJwt({
  secret: secret,
  credentialsRequired: false
}));
//}).unless({path: ['/api/login', '/api/entries', '/']}));
// ^^^ got a "X-Content-Type-Options" error :(
// cors not needed anymore
/*app.use(cors({
  origin: function(origin, callback){callback(null, true)},
  credentials: true
}));*/

// serve the client static
app.use('/', express.static(staticDir,));

// login / jwt stuff

function createToken() {
  // sign with default (HMAC SHA256)
  //let expirationDate =  Math.floor(Date.now() / 1000) + 30 //30 seconds from now
  var token = jwt.sign({ user: user.name }, secret);
  return token;
}

app.post('/api/login', (req, res) => {
  if (req.body.username !== user.name) {
    res.sendStatus(401);
    return;
  }
  bcrypt.compare(req.body.password, user.pwhash).then((check) => {
    if (check) {
      console.log("login ok");
      res.send({ token: createToken() });
    } else {
      console.log("login failed");
      res.sendStatus(401);
    }
  });
});

app.get('/api/urlinfo', (req, res) => {
  // tried to protect route lead to 404..
  //expressJwt({secret: secret}),
  //(err, req, res, next) => {
  //if (err.name === 'UnauthorizedError') { res.sendStatus(401); return; }
  const url = req.query.url;
  console.log("url request: ", url);
  request(url, (error, response, body) => {
    if (error) {
      // (debug info)
      //console.log('error:', error);
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

// load data
let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// write data
const writeData = () => {
  const str = JSON.stringify(data);
  fs.writeFileSync(dataFile, str);
};

function storeImage(image) {
  if (image.uploaded) return image;
  // convert imageData to image file data
  const data = image.imageData.split(';base64,')[1];
  // create filepath
  const randomDirName = crypto.randomBytes(20).toString('hex');
  const imagepath = path.join(staticDir, mediaDir, randomDirName);
  const filepath = path.join(imagepath, image.filename);
  fs.mkdir(imagepath, {recursive: true}, (err) => {
    if (err) console.log('error creating path:', err);
    // store image
    fs.writeFile(filepath, data, {encoding: 'base64'}, (err) => {
      if (err) console.log('error storing image:', err);
      console.log('stored image:', image.filename);
    });
  });
  // update image object
  // -> return inside writeFile?
  return {
    ...image,
    uploaded: true,
    filepath: path.join(mediaDir, randomDirName, image.filename),
    imageData: "",
  };
}

function deleteImage(image) {
  if (!image.uploaded) return image;
  console.log(image.filepath);
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
  // store all the new images, check if already uploaded is in storeImage func.
  const images = [];
  for (const image of newImages) {
    images.push(storeImage(image));
  }
  return images;
}

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
    const images = [];
    for (const image of obj.images) {
      images.push(storeImage(image));
    }
    data.push({
      ...obj,
      images: images,
    });
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
    const updatedImages = handleUpdateImages(newObj.images, oldObj.images);
    // update entry and write to file
    data.push( {
      ...newObj,
      images: updatedImages
    });
    writeData();
  }
});

app.listen(port);
console.log('listening on ' + port);
