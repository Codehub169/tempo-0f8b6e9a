import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '../prisma/client';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Creates a new review for a product.
 * @param userId - The ID of the user creating the review.
 * @param productId - The ID of the product being reviewed.
 * @param rating - The rating given (1-5).
 * @param comment - The review comment.
 * @returns The created review.
 * @throws AppError if the product is not found or if the user has already reviewed the product.
 */
export const createReview = async (
  userId: string,
  productId: string,
  rating: number,
  comment: string
) => {
  // In a real application, you might want to check if the user has purchased the product
  // const order = await prisma.order.findFirst({
  //   where: {
  //     userId,
  //     items: {
  //       some: { productId },
  //     },
  //     status: 'COMPLETED', // Or whatever status indicates a completed purchase
  //   },
  // });
  // if (!order) {
  //   throw new AppError('You can only review products you have purchased.', 403);
  // }

  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      productId,
    },
  });

  if (existingReview) {
    throw new AppError('You have already reviewed this product.', 409);
  }

  return prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

/**
 * Gets all reviews for a specific product.
 * @param productId - The ID of the product.
 * @returns A list of reviews for the product.
 */
export const getProductReviews = async (productId: string) => {
  return prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Gets a review by its ID.
 * @param reviewId - The ID of the review.
 * @returns The review or null if not found.
 */
export const getReviewById = async (reviewId: string) => {
  return prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

/**
 * Updates an existing review.
 * @param reviewId - The ID of the review to update.
 * @param userId - The ID of the user attempting to update (for ownership check).
 * @param rating - The new rating (optional).
 * @param comment - The new comment (optional).
 * @returns The updated review.
 * @throws AppError if the review is not found or if the user is not the owner.
 */
export const updateReview = async (
  reviewId: string,
  userId: string,
  rating?: number,
  comment?: string
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError('Review not found.', 404);
  }

  if (review.userId !== userId) {
    throw new AppError('You are not authorized to update this review.', 403);
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      rating,
      comment,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

/**
 * Deletes a review.
 * @param reviewId - The ID of the review to delete.
 * @param userId - The ID of the user attempting to delete (for ownership check).
 * @throws AppError if the review is not found or if the user is not the owner.
 */
export const deleteReview = async (reviewId: string, userId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError('Review not found.', 404);
  }

  if (review.userId !== userId) {
    throw new AppError('You are not authorized to delete this review.', 403);
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });
};
