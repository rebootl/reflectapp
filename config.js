// example/development settings

// server port
export const port = 4040;

// random secret for json webtoken
export const secret = 'abcdefgh';

export const user = {
  name: 'rebootl',
  pwhash: '$2b$10$wbm.5m27QVoQKvVh1Lar4uabKplVvoZFGjKuKYFCQfqilkZ5ij9oi'
};
// create with:
// const bcrypt = require('bcrypt');
// bcrypt.hashSync('beboop', 10);
