// example/development settings

// server port
const port = 4040;

// random secret for json webtoken
const secret = 'abcdefgh';

const user = {
  name: 'rebootl',
  pwhash: '$2b$10$wbm.5m27QVoQKvVh1Lar4uabKplVvoZFGjKuKYFCQfqilkZ5ij9oi'
};
// create with:
// const bcrypt = require('bcrypt');
// bcrypt.hashSync('beboop', 10);

// database setup
const dbUser = 'reflectapp-admin';
const dbPassword = 'example123';
const dbUrl = 'mongodb://localhost:27017';
const dbName = 'reflectapp';

// files/paths
// -> deprecate when db works
const dataFile = 'db/db.json';
const staticDir = 'client/dist';
// (mediaDir is below staticDir)
const mediaDir = 'media';

export { port, secret, user, dbUser, dbPassword, dbUrl, dbName, dataFile,
  staticDir, mediaDir };
