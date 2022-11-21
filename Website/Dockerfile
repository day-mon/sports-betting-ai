FROM node:14-slim

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

EXPOSE 3000

CMD ["npm", "startprod"] 
