import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user
// This should align with how you structure your User model/type
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    // Add other user properties you might need, e.g., roles
  };
}

// Mock user ID for MVP development. Replace with actual auth logic.
const MOCK_USER_ID = 'clwqg0o960000z2qc9j8g3f7x'; // Example: Replace with a valid UUID from your seed or test data if needed

/**
 * Middleware to simulate user authentication for MVP.
 * Attaches a mock user object to the request.
 * In a real application, this would validate a JWT or session token.
 */
export const protect = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Simulate fetching user based on a token or session
  // For MVP, we'll just attach a mock user
  req.user = {
    id: MOCK_USER_ID,
  };
  console.log(`Mock authentication: User ${req.user.id} attached to request.`);
  next();
};

/**
 * Utility function to get user ID from the request.
 * To be used by controllers/services that need the authenticated user's ID.
 * Throws an error if user is not found on the request (i.e., protect middleware wasn't used or failed).
 */
export const getUserIdFromRequest = (req: AuthenticatedRequest): string => {
  if (!req.user || !req.user.id) {
    console.error('User ID not found on request. Ensure protect middleware is used.');
    // This should ideally not happen if 'protect' middleware is correctly applied before routes needing auth.
    // Throwing an error here can help catch misconfigurations during development.
    throw new Error('Authentication error: User ID is missing from the request.');
  }
  return req.user.id;
};

// Placeholder for role-based access control if needed in the future
// export const authorize = (roles: string[]) => {
//   return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({ message: 'Not authorized, no token' });
//     }
//     // Example role check - adapt to your user model
//     // if (!roles.includes(req.user.role)) { 
//     //   return res.status(403).json({ message: 'User role not authorized' });
//     // }
//     next();
//   };
// };
