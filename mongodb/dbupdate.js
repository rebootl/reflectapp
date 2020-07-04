import fs from 'fs';

// files/paths
const dataFile = 'entries.json';

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
  /*if (entry.type === 'link' && entry.hasOwnProperty('url')) {
    entry.text = entry.url;
    delete entry.url;
  }*/
  // add field user
  entry.user = 'rebootl';
}

writeData();
