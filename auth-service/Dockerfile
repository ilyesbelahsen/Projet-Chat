# Étape 1 : build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers package.json et package-lock.json / yarn.lock
COPY package*.json ./

# Installer toutes les dépendances (y compris dev pour compiler TS)
RUN npm install

# Copier le reste du code
COPY . .

# Compiler le projet NestJS
RUN npm run build

# Étape 2 : production
FROM node:20-alpine AS production

WORKDIR /app

# Copier uniquement les dépendances de production
COPY package*.json ./
RUN npm install --omit=dev

# Copier le code compilé
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["node", "dist/main"]
