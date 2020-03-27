import fs from 'fs';
import path from 'path';
import { port, secret, user } from './config.js';

// files/paths
const dataFile = 'db/db.json';
const staticDir = 'client/dist';
// (mediaDir is below staticDir)
const mediaDir = 'media';

// persistent storage

// load data
let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// write data
const writeData = () => {
  const str = JSON.stringify(data);
  fs.writeFileSync(dataFile, str);
};

// write backup
fs.writeFileSync(dataFile + '.dbupdate-backup', JSON.stringify(data));

for (const entry of data) {
  if (entry.type === 'link' && entry.hasOwnProperty('url')) {
    entry.text = entry.url;
    delete entry.url;
  }
}

writeData();
