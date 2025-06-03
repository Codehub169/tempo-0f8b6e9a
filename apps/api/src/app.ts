import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import mainRouter from './routes'; // Uncommmented: Ensure this provides your API routes

const app: Express = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(morgan('dev')); // HTTP request logger

// Mount main API routes
app.use('/api/v1', mainRouter);

// Serve static files from the Next.js build output (apps/web/out)
// This path is relative to where the script is run (apps/api/dist/server.js)
const staticWebPath = path.join(__dirname, '../../../apps/web/out');
app.use(express.static(staticWebPath));

// Health check route (can be part of mainRouter or standalone)
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'API is healthy' });
});

// Catch-all for SPA: For any GET request not matching API routes or static files, serve index.html
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    // If it's an API path not caught by mainRouter, let it fall through to 404 or error handler
    return next();
  }
  // For non-API GET requests, attempt to serve index.html from the static path
  res.sendFile(path.join(staticWebPath, 'index.html'), (err) => {
    if (err) {
      // If index.html is not found or other error, pass to global error handler or 404
      // This avoids sending a 404 for the SPA's client-side routes
      // but will correctly 404 if index.html truly doesn't exist.
      // For a pure SPA, you might always want to send index.html if no static file matches.
      // However, if index.html is missing, a 404 is appropriate.
      if (!res.headersSent) {
        res.status(404).json({ message: 'Resource not found or SPA entry point missing.' });
      }
    }
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error stack:', err.stack);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

export default app;
