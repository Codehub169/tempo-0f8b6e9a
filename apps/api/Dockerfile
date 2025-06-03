# Base stage with Node.js and pnpm, and a non-root user
FROM node:18-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm

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
# This means apps/api/dist will be at /app/apps/api/dist, etc.
COPY --chown=node:node --from=builder /app/prod_deploy_api . 

# Copy static web assets from the builder stage's web build output
COPY --chown=node:node --from=builder /app/apps/web/out ./apps/web/out

# Copy Prisma schema for runtime if not included by 'pnpm deploy'
# This is a safeguard. Ideally, 'apps/api/package.json' should list 'src/prisma' in its 'files' field.
# The path ./apps/api/src/prisma assumes that 'pnpm deploy' correctly placed the api app under /app/apps/api/ within the prod_deploy_api folder.
# If 'prod_deploy_api' contains the 'apps/api' structure, then this copy is fine. 
# Given `COPY --from=builder /app/prod_deploy_api .`, `apps/api/src/prisma` from builder should be copied to `/app/apps/api/src/prisma`
COPY --chown=node:node --from=builder /app/apps/api/src/prisma ./apps/api/src/prisma

# Set user to non-root 'node' user
USER node

# Set working directory for the API application for the CMD instruction
WORKDIR /app/apps/api

EXPOSE 3001
# The 'start' script is defined in apps/api/package.json
CMD ["pnpm", "start"]