FROM node:17

WORKDIR /frontend

COPY package*.json ./
RUN npm install

COPY . .


RUN export NODE_OPTIONS=--openssl-legacy-provider
CMD ["npm", "start"] 