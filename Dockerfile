# build web
FROM node:14-alpine AS builder

WORKDIR /app
RUN apk update && apk upgrade && apk add --no-cache bash git
COPY package.json ./
RUN npm install 
COPY . ./
RUN npm run build

# https://medium.com/geekculture/dockerizing-a-react-application-with-multi-stage-docker-build-4a5c6ca68166
# deploy
FROM nginx:1.19.0
WORKDIR /usr/share/nginx/html
# Remove default nginx static resources
RUN rm -rf ./*
# Copies static resources from builder stage
COPY --from=builder /app/build .
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]