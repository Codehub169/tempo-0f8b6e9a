#!/bin/sh

# Ensure /pnpm is in PATH if it exists (common in our Docker setup) and contains an executable pnpm
if [ -d "/pnpm" ] && [ -x "/pnpm/pnpm" ]; then
  # Check if /pnpm is already in PATH using a robust method
  case ":$PATH:" in
    *:"/pnpm":*) ;; # Already in PATH, do nothing
    *)
      echo "Found executable pnpm in /pnpm. Adding to PATH."
      export PATH="/pnpm:$PATH"
      ;;
  esac
fi

# Try to find pnpm via npm's global bin if not found in PATH from Docker ENV or the /pnpm check above
if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found in PATH yet. Attempting to find via 'npm bin -g'..."
  if command -v npm >/dev/null 2>&1; then
    NPM_GLOBAL_BIN_PATH=$(npm bin -g)
    # Check if 'npm bin -g' succeeded and returned a non-empty path, and if pnpm is executable there
    if [ -n "$NPM_GLOBAL_BIN_PATH" ] && [ -d "$NPM_GLOBAL_BIN_PATH" ] && [ -x "$NPM_GLOBAL_BIN_PATH/pnpm" ]; then
      # Check if the path is already in PATH to avoid duplicates
      case ":$PATH:" in
        *:"$NPM_GLOBAL_BIN_PATH":*) ;; # Already in PATH, do nothing
        *) 
          echo "Found pnpm in '$NPM_GLOBAL_BIN_PATH'. Adding to PATH."
          export PATH="$NPM_GLOBAL_BIN_PATH:$PATH"
          ;;
      esac
    else
      echo "pnpm not found in npm global bin path '$NPM_GLOBAL_BIN_PATH', or path is not a directory, or pnpm is not executable there, or 'npm bin -g' command failed."
    fi
  else
    echo "npm command not found. Cannot locate pnpm via 'npm bin -g'."
  fi
fi

# Exit immediately if a command exits with a non-zero status.
# Placed here after PATH manipulations which might involve commands that can fail gracefully.
set -e

# Determine the absolute path of the directory where the script is located.
# This assumes startup.sh is in the monorepo root.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MONOREPO_ROOT="$SCRIPT_DIR"

echo "Starting application setup (via startup.sh from $MONOREPO_ROOT)..."

# Check if pnpm is installed and in PATH (relevant for the environment running this script)
if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is not installed or not found in your PATH for startup.sh (even after attempting to find it)." >&2
  echo "Current PATH: $PATH" >&2
  echo "Please install pnpm to continue if running this script outside Docker builds." >&2
  echo "Visit https://pnpm.io/installation for instructions." >&2
  exit 1
fi

# The following build commands are for when startup.sh is responsible for builds.
# In a Docker-centric workflow with Dockerfiles handling builds, these are typically handled there.
# This section is useful if running this script to build on the host, e.g., before `docker-compose up` (without --build).
if [ "${SKIP_BUILDS_IN_STARTUP_SH}" != "true" ]; then
  echo "Building Web application (via startup.sh)..."
  (cd "$MONOREPO_ROOT" && pnpm --filter web build)

  echo "Building API application (via startup.sh)..."
  (cd "$MONOREPO_ROOT" && pnpm --filter api build)
else
  echo "Skipping build steps in startup.sh as SKIP_BUILDS_IN_STARTUP_SH is true."
fi

# Start the API server
# This part is specific to running the API directly using this script.
# Docker containers will typically use their own CMD (e.g., `pnpm start` or `pnpm dev` from package.json).
echo "Starting API server (via startup.sh)..."

# Change to the API's directory to run the server
# This is important if the server expects to be run from its own directory (e.g., for relative paths to assets or config)
API_DIR="$MONOREPO_ROOT/apps/api"

if [ ! -d "$API_DIR" ]; then
    echo "Error: API directory '$API_DIR' not found." >&2
    exit 1
fi

cd "$API_DIR"

# PORT will be inherited from the environment (e.g., docker-compose.yml or Dockerfile ENV).
# The server.ts defaults to 3001 if process.env.PORT is not set.

# Check if dist/server.js exists before trying to execute it
# This is crucial if builds were skipped or failed.
if [ ! -f "dist/server.js" ]; then
    echo "Error: API build artifact 'dist/server.js' not found in '$API_DIR'." >&2
    echo "Please ensure the API is built correctly." >&2
    echo "You might need to run 'pnpm --filter api build' from '$MONOREPO_ROOT', or ensure SKIP_BUILDS_IN_STARTUP_SH is not set to true." >&2
    exit 1
fi

# Use exec to replace the shell process with the Node.js process.
exec node dist/server.js
