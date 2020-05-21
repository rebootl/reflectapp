FROM node:13

WORKDIR /usr/src/app

# install npm packages first to make use of caching
# server
COPY package*.json ./
RUN npm install
# client
RUN mkdir ./client
COPY client/package*.json ./client/
RUN cd client && npm install

# install and build client
COPY client/src ./client/src
COPY client/rollup.config.js ./client/
RUN cd client && npm run build

# install server
COPY config.js_prod ./config.js
COPY src ./src
COPY tsconfig.json ./tsconfig.json
RUN npm run build
COPY db ./db
ENV NODE_ENV=production

EXPOSE 4040

CMD ["npm", "start"]
