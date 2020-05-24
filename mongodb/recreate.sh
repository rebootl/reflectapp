#!/bin/bash
#
#
docker stop reflectapp-mongodb
docker rm reflectapp-mongodb

sudo rm -rf mongodb-data/

./create.sh
./run.sh
