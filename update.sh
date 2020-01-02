#!/bin/bash
#

cp db/db.json db.json_backup
docker build -t reflect .
docker stop reflect
docker rm reflect
docker run -d -p 4040:4040 \
  --mount type=bind,source="$(pwd)"/db,target=/usr/src/app/db \
  --restart always \
  --name reflect \
  reflect
