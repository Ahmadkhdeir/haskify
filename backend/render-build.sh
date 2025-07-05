#!/bin/bash

cd backend

# GHC installieren
apt-get update
apt-get install -y ghc

# Node-Dependencies
npm install
