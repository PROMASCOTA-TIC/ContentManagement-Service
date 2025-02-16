# Etapa 1: Construcción
FROM node:18 AS builder

WORKDIR /app

# Copiar archivos esenciales del monorepo
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./
COPY apps ./apps
COPY .env .env  
# Copia el archivo .env

# Instalar dependencias
RUN npm ci

# Construir todos los microservicios
RUN npx nx reset --verbose
RUN npx nx run-many --target=build --all --verbose

# Etapa 2: Imagen final para producción
FROM node:18

WORKDIR /app

# Copiar solo lo necesario
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env .env  
# Copiar el .env en la imagen final

# Definir la variable de entorno
ENV NODE_ENV=production

# Cargar las variables de entorno y ejecutar los servicios
CMD node dist/apps/advertorials-ms/main.js & \
    node dist/apps/chatbot-ms/main.js & \
    node dist/apps/faqs-ms/main.js & \
    node dist/apps/links-of-interest-ms/main.js & \
    wait