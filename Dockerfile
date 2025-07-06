# Basis: Debian + GHC + Node
FROM ubuntu:22.04

# GHC + Node installieren
RUN apt-get update && \
    apt-get install -y curl gnupg build-essential && \
    apt-get install -y haskell-platform && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Arbeitsverzeichnis
WORKDIR /app

# Dateien ins Image kopieren
COPY . .

# In backend wechseln und Node-Pakete installieren
WORKDIR /app/backend
RUN npm install

# Port öffnen
EXPOSE 5001

# Backend starten
CMD ["node", "server.js"]
