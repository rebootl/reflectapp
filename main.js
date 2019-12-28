import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import fs from 'fs';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Endpoint from 'projectData/dist/Endpoint';
import { CustomQuery } from 'projectData/dist/Misc/Custom';
import { port, secret, user } from './config.js';

const app = express();
app.use(bodyParser.json());
app.use(compression());
app.use(expressJwt({
  secret: secret,
  credentialsRequired: false
}));
app.use(cors({
  origin: function(origin, callback){callback(null, true)},
  credentials: true
}));

// serve the client static
app.use('/', express.static('client/dist'));

// login / jwt stuff

function createToken() {
  // sign with default (HMAC SHA256)
  //let expirationDate =  Math.floor(Date.now() / 1000) + 30 //30 seconds from now
  var token = jwt.sign({ user: user.name }, secret);
  return token;
}

app.post('/login', (req, res) => {
  if (req.body.username !== user.name) {
    res.sendStatus(401);
    return;
  }
  bcrypt.compare(req.body.password, user.pwhash).then((check) => {
    if (check) {
      console.log("login ok");
      res.send({ token: createToken() });
    } else {
      res.sendStatus(401);
    }
  });
});

// db / projectData endpoint

const dataFile = 'db.json'
let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const writeData = () => {
  const str = JSON.stringify(data);
  fs.writeFileSync(dataFile, str);
};

new Endpoint(app.route('/entries'), {
  query: new CustomQuery({ update: ()=>data }),
  filter: (e, req) => {
    if (e.private) {
      if (req.user) return e;
      else return;
    }
    return e;
  },
  add: async (obj, req) => {
    console.log(req.user);
    if (!req.user) return;
    data.push(obj);
    writeData();
  },
  delete: async (obj, req) => {
    if (!req.user) return;
    data = data.filter((v) => v.id !== obj.id);
    writeData();
  },
  //update: async (newObj, oldObj, _user) => {
  //}
});

app.listen(port);
console.log('listening on ' + port);
