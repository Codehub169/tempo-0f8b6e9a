import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

// For MVP, we'll assume a userId is passed in the request body or params.
// In a real app, this would come from an authenticated session (e.g., req.user.id).
const getUserIdFromRequest = (req: Request): string => {
  // Ideal: return req.user.id; (after implementing auth middleware)
  return (req.body.userId as string) || (req.query.userId as string) || 'cltestuser123'; // MVP: Allow userId in body/query or fallback to mock
};

// Get the user's cart
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdFromRequest(req);

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { createdAt: 'asc' }
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { 
            items: { 
                include: { product: true }, 
                orderBy: { createdAt: 'asc' }
            }
        }, 
      });
    }

    const subtotal = cart.items.reduce((acc, item) => acc + item.quantity * item.product.price, 0);
    const total = subtotal; // Add tax, shipping, etc. in future iterations

    res.status(200).json({ 
      message: 'Cart fetched successfully', 
      data: { ...cart, subtotal: parseFloat(subtotal.toFixed(2)), total: parseFloat(total.toFixed(2)) } 
    });
  } catch (error) {
    next(error);
  }
};

// Add an item to the cart
export const addItemToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdFromRequest(req);
    const { productId, quantity = 1 } = req.body;

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Valid Product ID and positive integer quantity are required' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingCartItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    const requestedTotalQuantity = (existingCartItem ? existingCartItem.quantity : 0) + quantity;
    if (product.stock < requestedTotalQuantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}. Available: ${product.stock}, Requested total: ${requestedTotalQuantity}` });
    }

    let updatedOrNewCartItem;
    if (existingCartItem) {
      updatedOrNewCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: { product: true }
      });
    } else {
      updatedOrNewCartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
        include: { product: true }
      });
    }
    
    // Refetch cart to get updated totals
    const updatedCart = await getCart(req, res, next); // This will send the response
    // res.status(200).json({ message: 'Item added to cart', data: updatedOrNewCartItem }); // Or just return the item

  } catch (error) {
    next(error);
  }
};

// Update item quantity in cart
export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdFromRequest(req); // To ensure user owns the cart item
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive integer. To remove, use the delete endpoint.' });
    }

    const cartItem = await prisma.cartItem.findUnique({ 
        where: { id: itemId }, 
        include: { product: true, cart: true }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (cartItem.cart.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden: You do not own this cart item.' });
    }

    if (product.stock < quantity) {
        return res.status(400).json({ message: `Not enough stock for ${cartItem.product.name}. Available: ${cartItem.product.stock}, Requested: ${quantity}` });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    
    // Refetch cart to get updated totals
    const updatedCart = await getCart(req, res, next); // This will send the response

  } catch (error) {
    next(error);
  }
};

// Remove an item from the cart
export const removeItemFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdFromRequest(req); // To ensure user owns the cart item
    const { itemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({ 
        where: { id: itemId },
        include: { cart: true }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (cartItem.cart.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden: You do not own this cart item.' });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    // Refetch cart to get updated totals
    const updatedCart = await getCart(req, res, next); // This will send the response

  } catch (error) {
    next(error);
  }
};

// Clear the cart
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdFromRequest(req);

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      // If cart doesn't exist, it's already effectively 'cleared' for this user
      return res.status(200).json({ message: 'Cart is already empty or does not exist.' });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Refetch cart to get updated totals (which should be empty)
    const updatedCart = await getCart(req, res, next); // This will send the response

  } catch (error) {
    next(error);
  }
};
