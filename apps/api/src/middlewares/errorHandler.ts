import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../services/reviewService'; // Assuming AppError is defined here or a shared location

interface CustomError extends Error {
  statusCode?: number;
  code?: string; // For Prisma errors
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  console.error('Error occurred:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof AppError) {
    // Already handled by AppError class structure
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma known errors
    switch (err.code) {
      case 'P2002': // Unique constraint failed
        statusCode = 409; // Conflict
        message = `Unique constraint failed on field(s): ${(err.meta?.target as string[] || []).join(', ')}`;
        break;
      case 'P2025': // Record to delete not found
        statusCode = 404;
        message = 'Record not found. It may have already been deleted.';
        break;
      // Add more Prisma error codes as needed
      default:
        statusCode = 500;
        message = 'A database error occurred.';
        break;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400; // Bad Request
    message = 'Invalid input data. Please check your request.';
    // err.message often contains detailed validation errors, could be exposed in dev
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload.';
  }
  // Add more specific error types as needed

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack in development
  });
};

export default errorHandler;
