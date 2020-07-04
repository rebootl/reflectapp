mongodb container setup for reflectapp

using single node replica set (replica set needed for 'change' listener feat.)

incl. import, dump and export scripts/setup

## initial setup:

- copy and adapt config-example.sh config.sh
- place entries.json file
- create network

 $ docker network create reflectapp-network

- connect and initiate replica set

 $ docker exec -it reflectapp-mongodb mongo -u $USER -p $PASSWORD
 > rs.initiate()

e.g.:
 $ docker exec -it reflectapp-mongodb mongo -u reflectapp-admin -p example123
 > rs.initiate()
