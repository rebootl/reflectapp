import fs from 'fs';
//import path from 'path';

// files/paths
const dataFile = 'db.json';

// load data
let data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

// write data
const writeData = (f) => {
  fs.writeFileSync(f, JSON.stringify(data));
};

// write backup
writeData(dataFile + '.dbupdate-backup');

for (const entry of data) {
  entry.user = 'rebootl';
/*  if (entry.type === 'link' && entry.hasOwnProperty('url')) {
    entry.text = entry.url;
    delete entry.url;
  }*/
}

writeData(dataFile);
