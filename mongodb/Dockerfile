FROM mongo

COPY entries.json /docker-entrypoint-initdb.d/
COPY users.json /docker-entrypoint-initdb.d/
COPY mongoimport.sh /docker-entrypoint-initdb.d/
