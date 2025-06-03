#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Determine the absolute path of the directory where the script is located.
# This assumes startup.sh is in the monorepo root.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MONOREPO_ROOT="$SCRIPT_DIR"

echo "Starting application setup (via startup.sh from $MONOREPO_ROOT)..."

# This script is now primarily for host-based execution or specific deployment scenarios.
# Docker builds are handled by Dockerfiles.

# Check if pnpm is installed (relevant for the environment running this script)
if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is not installed or not in your PATH for startup.sh." >&2
  echo "Please install pnpm to continue if running this script outside Docker builds." >&2
  echo "Visit https://pnpm.io/installation for instructions." >&2
  exit 1
fi

# The following build commands are for when startup.sh is responsible for builds.
# In a Docker-centric workflow with Dockerfiles handling builds, these are redundant here.
# If you intend to run this script to build on the host before `docker-compose up` (without --build):
if [ "${SKIP_BUILDS_IN_STARTUP_SH}" != "true" ]; then
  echo "Building Web application (via startup.sh)..."
  (cd "$MONOREPO_ROOT" && pnpm --filter web build)

  echo "Building API application (via startup.sh)..."
  (cd "$MONOREPO_ROOT" && pnpm --filter api build)
else
  echo "Skipping build steps in startup.sh as SKIP_BUILDS_IN_STARTUP_SH is true."
fi

# Start the API server
# This part is specific to running the API directly.
# Docker containers will use their own CMD (e.g., `pnpm start` or `pnpm dev` from package.json)
echo "Starting API server on port 9000 (via startup.sh)..."

# Change to the API's directory to run the server
# This is important if the server expects to be run from its own directory (e.g., for relative paths to assets or config)
API_DIR="$MONOREPO_ROOT/apps/api"

if [ ! -d "$API_DIR" ]; then
    echo "Error: API directory $API_DIR not found." >&2
    exit 1
fi

cd "$API_DIR"

export PORT=9000 # This script's convention for the API port

# Check if dist/server.js exists before trying to execute it
if [ ! -f "dist/server.js" ]; then
    echo "Error: API build artifact dist/server.js not found in $API_DIR." >&2
    echo "Please ensure the API is built correctly (e.g., run 'pnpm --filter api build' from $MONOREPO_ROOT, or ensure SKIP_BUILDS_IN_STARTUP_SH is not true)." >&2
    exit 1
fi

exec node dist/server.js
