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

// files/paths
const dataFile = 'db/db.json';
const staticDir = 'client/dist';
// (mediaDir is below staticDir)
const mediaDir = 'media';

export { port, secret, user, dataFile, staticDir, mediaDir };
