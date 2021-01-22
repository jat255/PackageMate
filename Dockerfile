FROM node:14.10.1-stretch
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

RUN apt update
RUN apt-get install -y netcat ffmpeg libnss3 libnspr4 libatk-bridge2.0-0 libx11-xcb1 libxcb-dri3-0 libdrm2 libgbm1 libasound2 libatspi2.0-0 libgtk-3-0 

WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install
RUN npm install playwright
COPY --chown=node:node . .
ENV  DEBUG=pw:api 

CMD [ "node", "index.js" ]
