FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# API-Aufrufe gehen relativ über Caddy (/api → backend)
ENV VITE_API_URL=/api

RUN npm run build

# --- Produktions-Image: Nginx für statische Files ---
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
