# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=18.20.3

FROM node:${NODE_VERSION}-bullseye

# Use production node environment by default.
ENV NODE_ENV production

# Install dependencies.
RUN apt-get update && \
    apt-get install gnupg curl && \
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor && \
   echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" | \
   tee /etc/apt/sources.list.d/mongodb-org-7.0.list && \
    apt-get update && \
    apt-get install -y mongodb-org mongodb-mongosh systemctl sudo && \
    rm -rf /var/lib/apt/lists/*


RUN mkdir -p /data/db;
RUN groupadd -g 999 mongod && \
    useradd -u 999 -g mongod mongod && \
    chmod 4755 /usr/bin/mongod && \
    chown -R mongod:mongod /data/db

RUN usermod -a -G mongod root
RUN usermod -a -G mongod node

COPY ./mongodb/mongod.conf /etc/mongod.conf

COPY ./mongodb/mongod.service /etc/systemd/system/mongod.service

RUN systemctl daemon-reload && \
    systemctl enable mongod && \
    systemctl start mongod

WORKDIR /usr/network_dashboard


# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them into
# into this layer.
RUN --mount=type=bind,source=./src/package.json,target=package.json \
    --mount=type=bind,source=./src/package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev


# Copy the rest of the source files into the image.
COPY ./src .

# Set config dir
ENV NODE_CONFIG_DIR ./lib/config

# Expose the ports that the application listens on.
EXPOSE 49152
EXPOSE 27017

# Install your Node.js dependencies
RUN npm install


COPY ./entrypoint.sh .
RUN chown root ./entrypoint.sh && \
    chmod 4755 ./entrypoint.sh

# Run the application as a non-root user.
# USER node 

# Run the application.
ENTRYPOINT ["./entrypoint.sh"];