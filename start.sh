#!/bin/bash
set -e

echo "--------------------------------------------------------"
echo " Folio: Structured Notes SPA - Setup & Launch"
echo "--------------------------------------------------------"

# 1. Environment variables setup
if [ ! -f .env ]; then
  echo "[1/3] Creating root .env from .env.example..."
  cp .env.example .env
else
  echo "[1/3] Root .env already exists."
fi

if [ ! -f backend/.env ]; then
  echo "[2/3] Creating backend/.env from backend/.env.example..."
  cp backend/.env.example backend/.env
else
  echo "[2/3] Backend .env already exists."
fi

# 2. Check for Docker
if ! command -v docker > /dev/null 2>&1; then
  echo "Error: Docker is not installed. Please install Docker and try again."
  exit 1
fi

if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi

# 3. Launch services
echo "[3/3] Launching services via Docker Compose..."
echo "      This will build the images and start the database."
echo "--------------------------------------------------------"

docker compose up --build "$@"
