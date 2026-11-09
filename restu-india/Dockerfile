# Step 1: Build the React application
FROM node:20-slim AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Accept build arguments (Vite needs this at build-time)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Step 2: Serve the built static files using Nginx
FROM nginx:alpine

# Copy the built React app from stage 1
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy our custom Nginx config for routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
