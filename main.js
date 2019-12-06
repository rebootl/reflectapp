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

const secret = 'abcdefgh';

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

app.use('/', express.static('static'));

// login / jwt stuff

const user = {
  name: 'rebootl',
  pwhash: '$2b$10$wbm.5m27QVoQKvVh1Lar4uabKplVvoZFGjKuKYFCQfqilkZ5ij9oi'
};
// const bcrypt = require('bcrypt');
// bcrypt.hashSync('beboop', 10);

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
const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const writeData = () => {
  const str = JSON.stringify(data);
  fs.writeFileSync(dataFile, str);
};

new Endpoint(app.route('/entries'), {
  query: new CustomQuery({ update: ()=>data }),
  filter: (e, req) => {
    console.log(req.user);
    if (e.private) {
      if (req.user) return e;
      else return;
    }
    return e;
  },
  add: async (obj, _user) => {
    data.push(obj);
    writeData();
  },
  delete: async (obj, _user) => {
  },
  update: async (newObj, oldObj, _user) => {
  }
});

app.listen(4040);
console.log('listening on 4040');
