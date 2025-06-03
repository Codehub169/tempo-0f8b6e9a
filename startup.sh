#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting application setup..."

# 1. Build the Web application (generates static files in apps/web/out)
echo "Building Web application..."
pnpm --filter web build

# 2. Build the API application (compiles TypeScript to apps/api/dist)
echo "Building API application..."
pnpm --filter api build

# 3. Start the API server
echo "Starting API server on port 9000..."
cd apps/api
export PORT=9000 # Ensure the API server listens on port 9000
exec node dist/server.js
