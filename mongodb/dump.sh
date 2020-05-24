#!/bin/bash
#
#
. config.sh

docker exec reflectapp-mongodb \
  sh -c 'exec mongodump --authenticationDatabase=admin \
    -u "$USER" -p "$PASSWORD" \
    -d reflectapp --archive' \
  > dump/reflectapp.dump
