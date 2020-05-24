#!/bin/bash
#
#
. config.sh

docker exec -it reflectapp-mongodb mongoexport \
  --authenticationDatabase=admin \
  -u "$USER" -p "$PASSWORD" \
  -d reflectapp -c entries \
  --jsonArray --pretty > export/entries.json
