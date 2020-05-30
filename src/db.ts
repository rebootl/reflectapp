import { default as mongodb } from 'mongodb';
import * as config from '../config.js';

// db setup
let conn;

const MongoClient = mongodb.MongoClient;
const client = new MongoClient(config.dbUrl, {
  auth: { user: config.dbUser, password: config.dbPassword },
  useUnifiedTopology: true
});

function getDb() {
  return new Promise((res, rej) => {
    client.connect((err, db) => {
      if (err) {
        console.log("Error connecting to db: ");
        rej(err);
      }
      console.log("Connected successfully to server");
      res(db);
      conn = db;
    });
  });
}

function getConn() {
  return conn;
}

export { getDb, getConn };
