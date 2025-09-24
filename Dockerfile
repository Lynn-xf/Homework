FROM node:18-alpine

# Install AWS CLI and jq to pasrse JSON secrets
RUN apk add --no-cache aws-cli jq

# Create app dir
WORKDIR /usr/src/app

# Copy package files and install dependencies deterministically
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Ensure upload dir exists and has permissive perms (adjust for prod)
RUN mkdir -p /usr/src/app/src/utils/images && chmod -R 0755 /usr/src/app/src/utils/images

# Copy SSL certificates for HTTPS
COPY ssl/ /usr/src/app/ssl/

# Copy env varaibles in secretManagers.sh
COPY secretManagers.sh /usr/local/bin/secretManagers.sh
RUN chmod +x /usr/local/bin/secretManagers.sh

ENV NODE_ENV=production
ENV PORT=3000
ENV HTTPS_PORT=3443

EXPOSE 3000 3443

# Use secretManagers.sh as "entrypoint" to inject secrets called from AWS Secret Manager
ENTRYPOINT ["/usr/local/bin/secretManagers.sh"]

# Use npm start ("start" script in package.json points to server)
CMD ["npm", "start"]
