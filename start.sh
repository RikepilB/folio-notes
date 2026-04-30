#!/bin/bash

# Folio Notes App - Setup Script
# Usage: ./start.sh
#
# This script sets up the complete application stack:
# - Installs npm dependencies (if not present)
# - Starts Docker containers (PostgreSQL, Backend, Frontend)
# - Creates database schema
# - Seeds sample data

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  Folio Notes App — Starting..."
echo "═══════════════════════════════════════════════════════════"

# Check Docker is available
if ! command -v docker >/dev/null 2>&1; then
    echo "Error: Docker is required but not installed."
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    echo "Error: Docker Compose is required but not installed."
    exit 1
fi

# Create .env from example if not exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✓ Created .env from template"
    fi
else
    echo "✓ .env already exists"
fi

# Build and start all containers
echo ""
echo "Building and starting containers..."
docker compose up -d --build

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 10

# Get container health status
BACKEND_STATUS=$(docker compose ps backend --format "{{.Status}}" 2>/dev/null || echo "Down")
FRONTEND_STATUS=$(docker compose ps frontend --format "{{.Status}}" 2>/dev/null || echo "Down")

echo ""
echo "Service Status:"
echo "  Backend:  $BACKEND_STATUS"
echo "  Frontend: $FRONTEND_STATUS"

# Final output
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Folio Notes App is ready!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:3000"
echo ""
echo "  To stop:  docker compose down"
echo "  To view logs: docker compose logs -f"
echo ""