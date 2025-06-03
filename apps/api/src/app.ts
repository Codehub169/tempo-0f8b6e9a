import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import mainRouter from './routes'; // Main application routes
import errorHandler from './middlewares/errorHandler'; // Centralized error handler

const app: Express = express();

// Middleware
// Configure CORS appropriately for your production environment
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : '*', // Example: restrict in prod
  credentials: true, 
}));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // HTTP request logger

// Mount main API routes
app.use('/api/v1', mainRouter);

// Serve static files from the Next.js build output (apps/web/out) in production
if (process.env.NODE_ENV === 'production') {
  // Path is relative to where the script is run (e.g., /app/apps/api/dist/server.js)
  // It needs to point to /app/apps/web/out based on Dockerfile structure.
  const staticWebPath = path.join(__dirname, '../../../apps/web/out');
  console.log(`Serving static files from: ${staticWebPath}`);
  app.use(express.static(staticWebPath));

  // Health check route specific to production (if needed differently, or move to mainRouter)
  app.get('/api/health-prod', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', message: 'API is healthy (Production Mode)' });
  });

  // Catch-all for SPA: For any GET request not matching API routes or static files, serve index.html
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    // If the request is for an API path that wasn't caught by mainRouter, let it fall through (typically to a 404 from errorHandler).
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // For non-API GET requests, attempt to serve index.html from the static path for client-side routing.
    res.sendFile(path.join(staticWebPath, 'index.html'), (err) => {
      if (err) {
        // If index.html itself is not found or another error occurs sending it,
        // and headers haven't been sent yet, pass to the error handler.
        if (!res.headersSent) {
          console.error('Error serving index.html:', err);
          // Create a specific error for the handler if index.html is missing
          const spaError = new Error('SPA entry point (index.html) not found.');
          (spaError as any).statusCode = 404;
          next(spaError);
        }
      }
    });
  });
} else {
  // In development, Next.js dev server handles frontend routes.
  // Health check for development (if needed differently, or move to mainRouter)
  app.get('/api/health-dev', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', message: 'API is healthy (Development Mode)' });
  });
}

// Use the centralized error handler as the last middleware
app.use(errorHandler);

export default app;
