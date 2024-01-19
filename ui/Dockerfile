FROM node:18-slim as builder

WORKDIR /app

# Setup a path for using local npm packages
RUN mkdir -p /opt/node_modules

COPY ./package.json /app
COPY ./package-lock.json /app

RUN npm ci

COPY ./ /app

# server build needs to run after client build because the client build using Vite
# removes the dist/ folder before compiling its code
RUN npm run build

FROM nginx:alpine

EXPOSE 80

COPY --from=builder ./app/dist /usr/share/nginx/html
COPY --from=builder ./app/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]