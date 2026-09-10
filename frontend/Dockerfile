# ---- Build stage ----
FROM node:24-alpine AS build

WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy rest of the source
COPY . .

# Pass the API URL in at build time (Vite bakes env vars in at build, not runtime)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Production stage ----
FROM nginx:alpine AS production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Needed so client-side routing (React Router etc.) doesn't 404 on refresh
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]