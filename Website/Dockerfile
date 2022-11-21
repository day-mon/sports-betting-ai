# Write a dockerfile for a solid js app
# https://hub.docker.com/_/node

# Use the official node image
FROM node:latest

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install

# Copy local code to the container image.
COPY . ./

# EXPOSE PORT 3000
EXPOSE 3000

# Run the web service on container startup.
CMD [ "npm", "start" ]
