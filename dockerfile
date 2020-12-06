FROM node:latest

WORKDIR /usr/app

COPY . .
RUN yarn install

EXPOSE 8000