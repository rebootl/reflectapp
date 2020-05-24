mongoimport --db reflectapp \
  --collection entries \
  --jsonArray \
  --file /docker-entrypoint-initdb.d/entries.json
