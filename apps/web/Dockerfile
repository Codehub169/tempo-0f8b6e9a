# Base stage with Node.js and pnpm, and a non-root user
FROM node:18-alpine AS base
# Install specific pnpm version matching package.json
# npm install -g pnpm will install pnpm to a standard global location (e.g., /usr/local/bin) which is typically already in PATH.
RUN npm install -g pnpm@8.6.0

# Create a non-root user 'node' and group 'node'
RUN addgroup -S node && adduser -S node -G node

# Builder stage for web app
FROM base AS builder
WORKDIR /app

# Copy workspace setup files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Copy application code for Web and any shared packages
COPY apps/web apps/web
COPY packages packages

# Install all dependencies for the workspace
RUN pnpm install --frozen-lockfile

# Build the Web application (generates .next for 'next start' and 'out' for static export)
# The build script in apps/web/package.json is "next build && next export"
RUN pnpm --filter web build
# Output includes apps/web/out (static export) and apps/web/.next (for next start)

# Prepare production deployment for Web (for running with 'next start')
# This will create a pruned package in /app/prod_deploy_web
# including apps/web/.next, apps/web/public, apps/web/package.json, and necessary node_modules for 'next start'.
RUN pnpm deploy --filter web --prod /app/prod_deploy_web

# Production image for Next.js (if serving with Next.js server using 'next start')
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy deployed Web application (pruned with production dependencies for 'next start')
# The content of /app/prod_deploy_web will be copied into /app in the runner stage.
# This means apps/web/.next will be at /app/apps/web/.next, etc. and node_modules at /app/node_modules.
COPY --chown=node:node --from=builder /app/prod_deploy_web .

# Set user to non-root 'node' user
USER node

# Set working directory for the Web application for the CMD instruction
# This is /app/apps/web, where the web's package.json is located after the COPY from prod_deploy_web.
WORKDIR /app/apps/web

EXPOSE 3000
# This CMD is if you want to run `next start` for the web app.
# The `start` script in apps/web/package.json is "next start -p 3000".
# For static export serving, the API container is responsible if configured to do so.
CMD ["pnpm", "start"]