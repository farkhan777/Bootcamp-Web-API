FROM node:lts-alpine

WORKDIR /app
ADD --chmod=777 files* /app/

COPY package.json ./

COPY ./package.json ./
RUN npm install --only=production

COPY ./ ./

USER node

CMD ["npm", "start"]

EXPOSE 5000