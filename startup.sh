#!/bin/sh

# Ensure /pnpm is in PATH if it exists (common in our Docker setup) and contains an executable pnpm
if [ -d "/pnpm" ] && [ -x "/pnpm/pnpm" ]; then
  # Check if /pnpm is already in PATH using a robust method
  case ":$PATH:" in
    *:"/pnpm":*) ;; # Already in PATH, do nothing
    *)
      printf "Found executable pnpm in /pnpm. Adding to PATH.\n"
      export PATH="/pnpm:$PATH"
      ;;
  esac
fi

# Try to find pnpm via npm's global installation path if not found in PATH from Docker ENV or the /pnpm check above
if ! command -v pnpm >/dev/null 2>&1; then
  printf "pnpm not found in PATH initially. Attempting to find npm global bin directory...\n"
  if command -v npm >/dev/null 2>&1; then
    # Use 'npm bin -g' which directly gives the global bin path.
    # Suppress stderr from 'npm bin -g' and use '|| true' to prevent script exit if 'set -e' is active and command fails.
    NPM_GLOBAL_BIN_PATH_RAW=$(npm bin -g 2>/dev/null || true)

    if [ -n "$NPM_GLOBAL_BIN_PATH_RAW" ] && [ -d "$NPM_GLOBAL_BIN_PATH_RAW" ] && [ -x "$NPM_GLOBAL_BIN_PATH_RAW/pnpm" ]; then
      NPM_GLOBAL_BIN_PATH="$NPM_GLOBAL_BIN_PATH_RAW"
      # Check if the path is already in PATH to avoid duplicates
      case ":$PATH:" in
        *:"$NPM_GLOBAL_BIN_PATH":*) ;; # Already in PATH, do nothing
        *) 
          printf "Found pnpm in '%s'. Adding to PATH.\n" "$NPM_GLOBAL_BIN_PATH"
          export PATH="$NPM_GLOBAL_BIN_PATH:$PATH"
          ;;
      esac
    else
      printf "pnpm not found in npm global bin directory (derived from 'npm bin -g', which outputted: '%s'). The path might be invalid, not a directory, pnpm might not be executable there, or 'npm bin -g' itself might have failed if its output was empty.\n" "$NPM_GLOBAL_BIN_PATH_RAW" >&2
    fi
  else
    printf "npm command not found. Cannot locate pnpm via 'npm bin -g'.\n" >&2
  fi
fi

# Exit immediately if a command exits with a non-zero status.
# Placed here after PATH manipulations which might involve commands that can fail gracefully.
set -e

# Determine the absolute path of the directory where the script is located.
# This assumes startup.sh is in the monorepo root.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MONOREPO_ROOT="$SCRIPT_DIR"

printf "Starting application setup (via startup.sh from %s)...\n" "$MONOREPO_ROOT"

# Check if pnpm is installed and in PATH (relevant for the environment running this script)
if ! command -v pnpm >/dev/null 2>&1; then
  printf "Error: pnpm is not installed or not found in your PATH for startup.sh (even after attempting to find it).\n" >&2
  printf "Current PATH: %s\n" "$PATH" >&2
  printf "Please install pnpm to continue if running this script outside Docker builds.\n" >&2
  printf "Visit https://pnpm.io/installation for instructions.\n" >&2
  exit 1
fi

# The following build commands are for when startup.sh is responsible for builds.
# In a Docker-centric workflow with Dockerfiles handling builds, these are typically handled there.
# This section is useful if running this script to build on the host, e.g., before `docker-compose up` (without --build).
if [ "${SKIP_BUILDS_IN_STARTUP_SH}" != "true" ]; then
  printf "Building Web application (via startup.sh)...\n"
  (cd "$MONOREPO_ROOT" && pnpm --filter web build)

  printf "Building API application (via startup.sh)...\n"
  (cd "$MONOREPO_ROOT" && pnpm --filter api build)
else
  printf "Skipping build steps in startup.sh as SKIP_BUILDS_IN_STARTUP_SH is true.\n"
fi

# Start the API server
# This part is specific to running the API directly using this script.
# Docker containers will typically use their own CMD (e.g., `pnpm start` or `pnpm dev` from package.json).
printf "Starting API server (via startup.sh)...\n"

# Change to the API's directory to run the server
# This is important if the server expects to be run from its own directory (e.g., for relative paths to assets or config)
API_DIR="$MONOREPO_ROOT/apps/api"

if [ ! -d "$API_DIR" ]; then
    printf "Error: API directory '%s' not found.\n" "$API_DIR" >&2
    exit 1
fi

cd "$API_DIR"

# PORT will be inherited from the environment (e.g., docker-compose.yml or Dockerfile ENV).
# The server.ts defaults to 3001 if process.env.PORT is not set.

# Check if dist/server.js exists before trying to execute it
# This is crucial if builds were skipped or failed.
if [ ! -f "dist/server.js" ]; then
    printf "Error: API build artifact 'dist/server.js' not found in '%s'.\n" "$API_DIR" >&2
    printf "Please ensure the API is built correctly.\n" >&2
    printf "You might need to run 'pnpm --filter api build' from '%s', or ensure SKIP_BUILDS_IN_STARTUP_SH is not set to true.\n" "$MONOREPO_ROOT" >&2
    exit 1
fi

# Use exec to replace the shell process with the Node.js process.
exec node dist/server.js
