import http from 'http';
import app from './app';
import { prisma } from './prisma/client'; // Corrected: Import the singleton prisma instance

const PORT = process.env.PORT || 3001; // Default to 3001 for docker-compose, startup.sh will set PORT=9000

async function main() {
  try {
    await prisma.$connect(); // Use the imported singleton prisma instance
    console.log('Database connected successfully');

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`API Server is running on http://localhost:${PORT}`);
    });

    const shutdown = (signal: string) => {
      console.log(`${signal} signal received: closing HTTP server`);
      server.close(async () => {
        console.log('HTTP server closed');
        try {
          await prisma.$disconnect(); // Use the imported singleton prisma instance
          console.log('Prisma client disconnected');
        } catch (e) {
          console.error('Error disconnecting Prisma:', e);
        } finally {
          console.log('Shutdown sequence finished.');
          process.exit(0);
        }
      });

      // Force shutdown if server.close() hangs
      setTimeout(() => {
        console.error('Graceful shutdown timed out. Forcing exit.');
        process.exit(1);
      }, 10000); // 10 seconds timeout
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to connect to the database or start server:', error);
    try {
      await prisma.$disconnect(); // Use the imported singleton prisma instance
      console.log('Prisma client disconnected due to server startup error.');
    } catch (e) {
      console.error('Error disconnecting Prisma after server startup failure:', e);
    }
    process.exit(1);
  }
}

main();
