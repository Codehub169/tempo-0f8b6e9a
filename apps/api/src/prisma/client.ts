import { PrismaClient } from '@prisma/client';

// PrismaClient is instantiated once and exported for use throughout the application.
// This ensures a single connection pool is used.

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'], // Optional: Enable logging for development
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// No need to explicitly call prisma.$connect() here.
// Prisma Client connects lazily when the first query is executed.
