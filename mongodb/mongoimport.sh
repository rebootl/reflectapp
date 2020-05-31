# import entries
mongoimport --db reflectapp \
  --collection entries \
  --jsonArray \
  --file /docker-entrypoint-initdb.d/entries.json

# import users
mongoimport --db reflectapp \
  --collection users \
  --jsonArray \
  --file /docker-entrypoint-initdb.d/users.json
