#!/bin/bash
set -e

if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi

if ! docker compose version > /dev/null 2>&1; then
  echo "Error: docker compose (v2) not found. Please upgrade Docker Desktop."
  exit 1
fi

docker compose up --build "$@"
