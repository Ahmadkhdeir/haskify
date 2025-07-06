# Nutze offizielles Haskell-Image als Basis
FROM haskell:latest

# Installiere Node.js und npm
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs npm

# Setze Arbeitsverzeichnis
WORKDIR /app

# Kopiere alle Dateien ins Image
COPY . .

# Gehe in das backend-Verzeichnis und installiere npm-Pakete
WORKDIR /app/backend
RUN npm install

# Exponiere Port 5001 für das Backend
EXPOSE 5001

# Starte das Backend
CMD ["node", "server.js"]
