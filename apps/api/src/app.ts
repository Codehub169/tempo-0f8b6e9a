import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
// import mainRouter from './routes'; // To be implemented later

const app: Express = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(morgan('dev')); // HTTP request logger

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'API is healthy' });
});

// TODO: Mount main API routes (e.g., app.use('/api/v1', mainRouter));
// For now, a placeholder for future routes
app.get('/api/v1', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the E-commerce API v1' });
});

// Basic 404 handler for unhandled routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

export default app;
