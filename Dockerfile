FROM node:lts-alpine

WORKDIR /app

COPY package.json ./

COPY ./package.json ./
RUN npm install --only=production

COPY ./ ./

USER root

RUN chmod -R 777 public

USER node

CMD ["npm", "start"]

EXPOSE 5000