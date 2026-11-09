FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source code
COPY . .

# Ensure upload directory exists
RUN mkdir -p src/uploads

# Expose port
EXPOSE 5000

# Start script
CMD ["npm", "start"]
