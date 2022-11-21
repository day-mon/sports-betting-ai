
FROM node:14-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./src ./src

RUN npm build

EXPOSE 3000

ENV HOST=0.0.0.0

CMD [ "npm", "start" ]