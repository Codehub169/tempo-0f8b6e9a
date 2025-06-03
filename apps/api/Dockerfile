# Base stage with Node.js and pnpm, and a non-root user
FROM node:18-alpine AS base
# Install specific pnpm version matching package.json
# npm install -g pnpm will install pnpm to a standard global location (e.g., /usr/local/bin) which is typically already in PATH.
RUN npm install -g pnpm@8.6.0

# Create a non-root user 'node' and group 'node'
RUN addgroup -S node && adduser -S node -G node

# Builder stage: Build the application
FROM base AS builder
WORKDIR /app

# Copy workspace setup files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Copy application code for API, shared packages, and Web (as API serves web's static output)
COPY apps/api apps/api
COPY apps/web apps/web
COPY packages packages

# Install all dependencies for the workspace
# Using --shamefully-hoist or public-hoist-pattern might be needed if there are issues with peer deps resolution in hoisted node_modules
RUN pnpm install --frozen-lockfile

# Build the API application (output to apps/api/dist)
RUN pnpm --filter api build

# Build the Web application (output to apps/web/out for static export)
RUN pnpm --filter web build

# Prepare production deployment for API using pnpm deploy
# This creates a pruned package in /app/prod_deploy_api with only production dependencies for 'api'.
# It includes apps/api/dist, apps/api/package.json, and necessary node_modules.
# It also copies files specified in api's package.json "files" array (e.g., prisma schema if listed).
RUN pnpm deploy --filter api --prod /app/prod_deploy_api

# Production image: Minimal image to run the application
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy deployed API application (pruned with production dependencies)
# The content of /app/prod_deploy_api will be copied into /app in the runner stage.
# This means apps/api/dist will be at /app/apps/api/dist, etc. and node_modules at /app/node_modules.
COPY --chown=node:node --from=builder /app/prod_deploy_api . 

# Copy static web assets from the builder stage's web build output
# This places them at /app/apps/web/out in the runner stage.
COPY --chown=node:node --from=builder /app/apps/web/out ./apps/web/out

# Copy Prisma schema for runtime if not included by 'pnpm deploy'
# This is a safeguard. Ideally, 'apps/api/package.json' should list 'src/prisma' (or specific files like 'src/prisma/schema.prisma') in its 'files' field.
# If so, 'pnpm deploy' would include it. This explicit COPY ensures it's present.
# This places it at /app/apps/api/src/prisma in the runner stage.
COPY --chown=node:node --from=builder /app/apps/api/src/prisma ./apps/api/src/prisma

# Set user to non-root 'node' user
USER node

# Set working directory for the API application for the CMD instruction
# This is /app/apps/api, where the api's package.json is located after the COPY from prod_deploy_api.
WORKDIR /app/apps/api

EXPOSE 3001
# The 'start' script is defined in apps/api/package.json ('node dist/server.js')
CMD ["pnpm", "start"]