import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as config from '../config.js';

// login / jwt stuff

function createToken() : string {
  // sign with default (HMAC SHA256)
  //let expirationDate =  Math.floor(Date.now() / 1000) + 30 //30 seconds from now
  var token = jwt.sign({ user: config.user.name }, config.secret);
  return token;
}

export default async (req : any, res : any) => {
  const usersCollection = await req.app.locals.db.collection('users');
  const dbUser = await usersCollection.findOne({ name: req.body.username });
  if (!dbUser) {
    console.log("user not found :(")
    res.sendStatus(401);
    return;
  }
  bcrypt.compare(req.body.password, dbUser.pwhash).then((check) => {
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
}
