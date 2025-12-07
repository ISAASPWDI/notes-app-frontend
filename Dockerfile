# frontend/Dockerfile - generado por scripts/setup.sh
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
# copiar lockfile si existe
COPY package-lock.json . || true
RUN npm ci --silent
COPY . .
RUN npm run build

FROM nginx:alpine
# eliminar configuración default (opcional)
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
# Exponer 80 (mapeado por compose)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
