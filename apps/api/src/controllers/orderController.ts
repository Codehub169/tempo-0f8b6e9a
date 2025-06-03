import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

// For MVP, we'll assume a userId is passed in the request body or params.
// In a real app, this would come from an authenticated session (e.g., req.user.id).
const getUserIdFromRequest = (req: Request): string => {
  // Ideal: return req.user.id; (after implementing auth middleware)
  return (req.body.userId as string) || (req.query.userId as string) || 'cltestuser123'; // MVP: Allow userId in body/query or fallback to mock
};

const ALLOWED_ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED', 'REFUNDED'];

// Create a new order
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { shippingAddress, billingAddress, paymentMethod, paymentConfirmationToken } = req.body; // Added paymentConfirmationToken

    if (!shippingAddress || !billingAddress || !paymentMethod || !paymentConfirmationToken) {
        return res.status(400).json({ message: 'Missing required fields: shippingAddress, billingAddress, paymentMethod, paymentConfirmationToken' });
    }
    // Basic validation for address objects (can be expanded)
    if (typeof shippingAddress !== 'object' || typeof billingAddress !== 'object') {
        return res.status(400).json({ message: 'shippingAddress and billingAddress must be objects' });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty. Cannot create order.' });
    }

    // Simulate payment processing with the token - in real app, call payment gateway API
    // For MVP, we'll assume payment is successful if token is present
    console.log(`Simulating payment processing for user ${userId} with token ${paymentConfirmationToken}`);

    const totalAmount = cart.items.reduce((acc, item) => acc + item.quantity * item.product.price, 0);

    const order = await prisma.$transaction(async (tx) => {
      // Check stock for all items within the transaction for consistency
      for (const item of cart.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Not enough stock for product: ${item.product.name}. Available: ${product?.stock || 0}, Requested: ${item.quantity}`);
        }
      }
      
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          status: 'PENDING', // Initial order status
          shippingAddress: JSON.stringify(shippingAddress),
          billingAddress: JSON.stringify(billingAddress),
          paymentMethod,
          // paymentConfirmationToken: paymentConfirmationToken, // Store if needed for reference
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: parseFloat(item.product.price.toFixed(2)), // Store price at the time of purchase
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      // Not deleting the cart itself, just its items.

      return newOrder;
    });

    res.status(201).json({ message: 'Order created successfully', data: order });
  } catch (error: any) {
    if (error.message.startsWith('Not enough stock')) {
        return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// Get user's order history
export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdFromRequest(req);

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrls: true} }, // Select specific product fields
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ message: 'Orders fetched successfully', data: orders });
  } catch (error) {
    next(error);
  }
};

// Get a specific order by ID
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params; // Renamed from 'id' to 'orderId' for clarity
    const userId = getUserIdFromRequest(req);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true, // Include full product details for a specific order
          },
        },
        user: { select: { id: true, name: true, email: true } }, // Optionally include user details
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Security check: Ensure the user owns the order or is an admin (admin check not implemented yet)
    if (order.userId !== userId) {
        // In a real app, you might also check if req.user.isAdmin
        return res.status(403).json({ message: 'Forbidden: You do not have access to this order.' });
    }

    res.status(200).json({ message: 'Order details fetched successfully', data: order });
  } catch (error) {
    next(error);
  }
};

// Update order status (Admin role typically)
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params; // Renamed from 'id' to 'orderId'
    const { status } = req.body;

    // const userId = getUserIdFromRequest(req); // For checking if user is admin
    // if (!req.user.isAdmin) return res.status(403).json({ message: 'Forbidden: Admin access required.' });

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }
    
    const upperCaseStatus = status.toUpperCase();
    if (!ALLOWED_ORDER_STATUSES.includes(upperCaseStatus)) {
        return res.status(400).json({ message: `Invalid status. Allowed statuses are: ${ALLOWED_ORDER_STATUSES.join(', ')}` });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: upperCaseStatus }, 
      include: { items: { include: { product: true } } }
    });

    res.status(200).json({ message: 'Order status updated successfully', data: updatedOrder });
  } catch (error) {
    next(error);
  }
};
