#!/bin/bash
#

cp db/db.json db.json_backup
git pull
docker build -t reflect .
docker stop reflect
docker rm reflect
docker run -d -p 4040:4040 \
  --mount type=bind,source="$(pwd)"/db,target=/usr/src/app/db \
  --mount type=bind,source="$(pwd)"/media,target=/usr/src/app/client/dist/media \
  --restart always \
  --name reflect \
  reflect
