FROM node:11-alpine

ENV API_DOCKER_PORT 8080

WORKDIR /opt/cosmos-goz-api
COPY . ./

RUN npm ci

EXPOSE 8080

ENTRYPOINT [ "npm", "start" ]