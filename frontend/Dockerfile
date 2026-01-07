# Étape 1 : build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Étape 2 : production avec Nginx
FROM nginx:alpine

# Copier le build dans le dossier public d'nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la config Nginx personnalisée si nécessaire
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrage Nginx
CMD ["nginx", "-g", "daemon off;"]
