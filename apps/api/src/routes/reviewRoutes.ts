import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
// import { authMiddleware } from '../middlewares/authMiddleware'; // To be added later

const router = Router();

// Get all reviews for a specific product
router.get('/products/:productId/reviews', reviewController.getProductReviews);

// Create a new review for a product
// For MVP, allowing review creation without strict auth, associate with MOCK_USER_ID in controller
router.post('/products/:productId/reviews', reviewController.createReview);

// Get a specific review by ID
router.get('/:reviewId', reviewController.getReviewById);

// Update a review
// router.put('/:reviewId', authMiddleware, reviewController.updateReview); // Placeholder for auth
router.put('/:reviewId', reviewController.updateReview);

// Delete a review
// router.delete('/:reviewId', authMiddleware, reviewController.deleteReview); // Placeholder for auth
router.delete('/:reviewId', reviewController.deleteReview);

export default router;
