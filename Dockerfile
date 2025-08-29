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

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Use npm start (ensure "start" script in package.json points to your server)
CMD ["npm", "start"]
