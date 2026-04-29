#!/bin/bash
set -e

echo ""
echo "  Folio — Your thoughts, structured"
echo "  ================================="
echo ""
echo "  Starting all services via Docker Compose..."
echo "  First run pulls images and installs deps — may take 2-3 min."
echo ""
echo "  URLs after startup:"
echo "    Frontend  → http://localhost:5173"
echo "    API       → http://localhost:3000"
echo ""

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "  ERROR: Docker is not running. Please start Docker and retry."
  exit 1
fi

# Check Docker Compose v2 is available
if ! docker compose version > /dev/null 2>&1; then
  echo "  ERROR: Docker Compose v2 not found. Please install Docker Desktop 4.x or later."
  exit 1
fi

docker compose up --build "$@"
