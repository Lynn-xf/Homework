FROM node:18-alpine

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

ENV NODE_ENV=production
ENV PORT=3000
ENV HTTPS_PORT=3443

EXPOSE 3000 3443

# Use npm start ("start" script in package.json points to server)
CMD ["npm", "start"]
