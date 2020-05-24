#!/bin/bash
#
#
. config.sh

#-p 27017:27017 \
#-d
docker run -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME="$USER" \
  -e MONGO_INITDB_ROOT_PASSWORD="$PASSWORD" \
  -e MONGO_INITDB_DATABASE=reflectapp \
  -v "$(pwd)/mongodb-data:/data/db" \
  --network reflectapp-network \
  --restart unless-stopped \
  --name reflectapp-mongodb \
  reflectapp-mongodb \
  mongod --replSet rs0
