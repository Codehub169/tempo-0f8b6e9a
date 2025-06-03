import http from 'http';
import app from './app';
import { PrismaClient } from './prisma/client';

const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

async function main() {
  // Optional: Add any startup logic here, e.g., DB connection check
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`API Server is running on http://localhost:${PORT}`);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        console.log('HTTP server closed');
        await prisma.$disconnect();
        console.log('Prisma client disconnected');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(async () => {
        console.log('HTTP server closed');
        await prisma.$disconnect();
        console.log('Prisma client disconnected');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to connect to the database or start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
