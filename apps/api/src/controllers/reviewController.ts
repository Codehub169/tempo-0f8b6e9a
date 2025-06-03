import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';

// Mock function to get user ID from request (replace with actual auth later)
const getUserIdFromRequest = (req: Request): string => {
  // In a real app, this would come from an authenticated user session
  // For MVP, we might use a header or a default user ID
  return req.headers['x-user-id'] as string || 'clw20expc0000qrp5psx5h5j1'; // Replace with a valid mock UUID from your seed
};

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const { rating, comment, title } = req.body;
  const userId = getUserIdFromRequest(req);

  if (!userId) {
    return res.status(401).json({ message: 'User ID is required to post a review.' });
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
  }
  if (!comment || typeof comment !== 'string' || comment.trim() === '') {
    return res.status(400).json({ message: 'Comment cannot be empty.' });
  }
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ message: 'Title cannot be empty.' });
  }

  try {
    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if user exists (optional, depends on how users are managed)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      // This case might not happen if getUserIdFromRequest always provides a valid/mocked ID
      // Or if user creation is handled elsewhere and this ID is assumed to be valid.
      return res.status(404).json({ message: 'User not found. Cannot create review.' });
    }

    const newReview = await prisma.review.create({
      data: {
        title,
        rating,
        comment,
        productId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    res.status(201).json(newReview);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle potential unique constraint violations or other DB errors
      if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ message: 'User has already reviewed this product.' });
      }
    }
    next(error);
  }
};

export const getReviewById = async (req: Request, res: Response, next: NextFunction) => {
  const { reviewId } = req.params;
  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  const { reviewId } = req.params;
  const { rating, comment, title } = req.body;
  const userId = getUserIdFromRequest(req); // For ownership check

  if (!userId) {
    return res.status(401).json({ message: 'User ID is required.' });
  }

  try {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    if (review.userId !== userId) {
      return res.status(403).json({ message: 'User not authorized to update this review.' });
    }

    const updatedData: Prisma.ReviewUpdateInput = {};
    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
         return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
      }
      updatedData.rating = rating;
    }
    if (comment !== undefined) {
       if (typeof comment !== 'string' || comment.trim() === '') {
         return res.status(400).json({ message: 'Comment cannot be empty.' });
      }
      updatedData.comment = comment;
    }
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ message: 'Title cannot be empty.' });
     }
     updatedData.title = title;
   }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    res.status(200).json(updatedReview);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  const { reviewId } = req.params;
  const userId = getUserIdFromRequest(req); // For ownership check

  if (!userId) {
    return res.status(401).json({ message: 'User ID is required.' });
  }

  try {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }
    if (review.userId !== userId) {
      return res.status(403).json({ message: 'User not authorized to delete this review.' });
    }

    await prisma.review.delete({ where: { id: reviewId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
