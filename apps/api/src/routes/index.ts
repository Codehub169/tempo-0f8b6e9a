import { Router } from 'express';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';
import orderRoutes from './orderRoutes';
// import reviewRoutes from './reviewRoutes'; // Will be added in a future batch

const router = Router();

// Mount product routes
router.use('/products', productRoutes);

// Mount cart routes
router.use('/cart', cartRoutes);

// Mount order routes
router.use('/orders', orderRoutes);

// Mount review routes - Placeholder for future implementation
// router.use('/reviews', reviewRoutes);

export default router;
