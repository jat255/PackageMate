FROM node:10-alpine
RUN mkdir -p /home/node/app/client/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app/client
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
EXPOSE 3000

CMD [ "node", "index.js" ]
