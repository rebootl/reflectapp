#!/bin/bash
#
#
. config.sh

docker exec reflectapp-mongodb \
  sh -c 'exec mongodump --authenticationDatabase=admin \
    -u "reflectapp-admin" -p "example123" \
    -d reflectapp --archive' \
  > dump/reflectapp.dump
