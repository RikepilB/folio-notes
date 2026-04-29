#!/bin/bash
# ============================================================
# Folio — Git branch setup script
# Run this ONCE after cloning / initializing the repo.
# ============================================================
set -e

echo ""
echo "Folio Git Setup"
echo "==============="
echo ""

# --- CONFIGURE THESE BEFORE RUNNING ---
GIT_NAME="Your Name"
GIT_EMAIL="you@email.com"
REMOTE_URL="https://github.com/YOUR_HANDLE/YOUR_REPO.git"
# --- END CONFIG ---

echo "1. Configuring author identity..."
git config user.name  "$GIT_NAME"
git config user.email "$GIT_EMAIL"
echo "   name:  $GIT_NAME"
echo "   email: $GIT_EMAIL"

echo ""
echo "2. Creating branch structure..."

git checkout -b main 2>/dev/null || git checkout main

# docs branch — for all documentation updates
git checkout -b docs || git checkout docs
echo "   Created: docs"
git checkout main

# develop branch — integration branch, PRs merge here first
git checkout -b develop || git checkout develop
echo "   Created: develop"
git checkout main

# feature branches — one per major feature
git checkout develop
git checkout -b feature/phase-1-notes || git checkout feature/phase-1-notes
echo "   Created: feature/phase-1-notes"

git checkout develop
git checkout -b feature/phase-2-categories || git checkout feature/phase-2-categories
echo "   Created: feature/phase-2-categories"

git checkout develop
git checkout -b feature/search-trash || git checkout feature/search-trash
echo "   Created: feature/search-trash"

git checkout develop
git checkout -b feature/docker-devops || git checkout feature/docker-devops
echo "   Created: feature/docker-devops"

git checkout main

echo ""
echo "3. Branch structure:"
git branch -a
echo ""
echo "4. Workflow:"
echo "   main       ← stable, only accept PRs from develop"
echo "   develop    ← integration; merge features here first"
echo "   docs       ← documentation-only changes"
echo "   feature/*  ← one branch per US group; PR → develop"
echo ""
echo "5. Commit message format (Conventional Commits):"
echo "   feat:     new feature (US-01 create note)"
echo "   fix:      bug fix"
echo "   docs:     documentation only"
echo "   refactor: code restructure, no behavior change"
echo "   test:     adding or updating tests"
echo "   chore:    build, Docker, config changes"
echo ""
echo "6. Example commit messages:"
echo "   feat: add note CRUD endpoint (US-01 US-02 US-03)"
echo "   feat: add archive toggle endpoint (US-04 US-05 US-06)"
echo "   feat: add soft-delete and recently deleted (US-14)"
echo "   feat: add categories module (US-07 US-08 US-09)"
echo "   feat: add search by title and content (US-13)"
echo "   feat: wire frontend NoteCard and NoteList components"
echo "   test: add notes service unit tests"
echo "   chore: add docker-compose and start script"
echo "   docs: add PRD user stories and design system"
echo ""

if [ "$REMOTE_URL" != "https://github.com/YOUR_HANDLE/YOUR_REPO.git" ]; then
  echo "7. Adding remote origin..."
  git remote add origin "$REMOTE_URL" 2>/dev/null || git remote set-url origin "$REMOTE_URL"
  echo "   origin → $REMOTE_URL"
  echo ""
  echo "   Push all branches:"
  echo "   git push -u origin --all"
else
  echo "7. Remote not set. Edit REMOTE_URL in this script and run:"
  echo "   git remote add origin https://github.com/YOUR_HANDLE/YOUR_REPO.git"
  echo "   git push -u origin --all"
fi

echo ""
echo "Setup complete. You are on: $(git branch --show-current)"
echo ""
