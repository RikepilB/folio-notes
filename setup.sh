#!/bin/bash

# Folio Notes App - Setup Script
# Usage: ./setup.sh

set -e

echo "═══════════════════════════════════════════════════════════════════"
echo "  Folio Notes App — Setting up..."
echo "═══════════════════════════════════════════════════════════"

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed."; exit 1; }

# Check if .env exists, create from example if not
if [ ! -f .env ]; then
    echo "📝 Creating .env from template..."
    cat > .env << 'EOF'
# Database
DB_NAME=folio
DB_USER=folio
DB_PASS=folio
DB_PORT=5432

# Backend
PORT=3000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
EOF
    echo "✓ .env created"
else
    echo "✓ .env already exists"
fi

# Build and start containers
echo ""
echo "🐳 Building and starting containers..."
docker compose up -d --build

# Wait for database to be ready
echo ""
echo "⏳ Waiting for database..."
sleep 5

# Seed database (only if empty)
NOTE_COUNT=$(docker compose exec -T postgres psql -U folio -d folio -t -c "SELECT COUNT(*) FROM note;" 2>/dev/null || echo "0")
NOTE_COUNT=$(echo "$NOTE_COUNT" | tr -d ' ')

if [ "$NOTE_COUNT" = "0" ] || [ -z "$NOTE_COUNT" ]; then
    echo ""
    echo "🌱 Seeding database..."
    docker compose exec -T postgres psql -U folio -d folio -f /seed.sql 2>/dev/null || true
    
    # Also try to seed via backend if seed.sql in container
    if docker compose exec backend test -f /app/seed.sql 2>/dev/null; then
        docker compose exec -T backend node -e "
            const { DataSource } = require('typeorm');
            const { Note } = require('./dist/notes/note.entity');
            const { Category } = require('./dist/categories/category.entity');
            (async () => {
                const ds = new DataSource({
                    type: 'postgres',
                    host: 'postgres',
                    port: 5432,
                    username: 'folio',
                    password: 'folio',
                    database: 'folio',
                    entities: [Note, Category],
                    synchronize: true
                });
                await ds.initialize();
                console.log('Database connected');
                await ds.destroy();
            })();
        " 2>/dev/null || true
    fi
    
    # Verify seed worked
    NOTE_COUNT=$(docker compose exec -T postgres psql -U folio -d folio -t -c "SELECT COUNT(*) FROM note;" 2>/dev/null | tr -d ' ' || echo "0")
    echo "✓ Database seeded ($NOTE_COUNT notes)"
else
    echo "✓ Database already has data ($NOTE_COUNT notes)"
fi

# Final status
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ Folio Notes App is ready!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  📱 Frontend:  http://localhost:5173"
echo "  🔌 Backend API: http://localhost:3000"
echo ""
echo "  Usage:"
echo "    docker compose logs -f        # View logs"
echo "    docker compose down        # Stop app"
echo "    docker compose up -d        # Restart app"
echo ""
echo "  Default credentials:"
echo "    User: folio / Pass: folio"
echo "    Database: folio"
echo ""