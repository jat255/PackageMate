FROM node:20-bullseye-slim
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

RUN apt-get update
RUN apt-get install -y netcat ffmpeg libnss3 libnspr4 libatk-bridge2.0-0 libx11-xcb1 libxcb-dri3-0 libdrm2 libgbm1 libasound2 libatspi2.0-0 libgtk-3-0 

WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
ENV  DEBUG=pw:api 

CMD [ "node", "index.js" ]
