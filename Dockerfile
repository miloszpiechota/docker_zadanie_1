# Etap 1: Budowanie aplikacji klienta
FROM node:16 AS build

LABEL author="MIŁOSZ PIECHOTA IO 6.7"

WORKDIR /app

# Kopiowanie plików projektu do katalogu roboczego
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/

# Instalacja zależności serwera
RUN npm install

# Przejście do folderu klienta i instalacja zależności klienta
WORKDIR /app/client
COPY client/public ./public
COPY client/src ./src
RUN npm install
RUN npm run build

# Etap 2: Budowanie obrazu końcowego
FROM node:16-slim

LABEL author="MIŁOSZ PIECHOTA"

WORKDIR /app

# Kopiowanie zbudowanej aplikacji klienta
COPY --from=build /app/client/build ./client/build

# Kopiowanie zależności serwera i kodu źródłowego
COPY package.json package-lock.json ./
COPY server.js ./

# Instalacja tylko produkcyjnych zależności serwera
RUN npm install --only=production

# Ustawienie zmiennej środowiskowej na produkcję
ENV NODE_ENV=production

# Ustawienie punktu wejścia
ENTRYPOINT ["node", "server.js"]

# Otwarcie portu na serwerze
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1
