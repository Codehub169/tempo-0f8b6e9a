import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';

const CART_INCLUDE_OPTIONS: Prisma.CartInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          images: true, // Assuming images is an array of strings
        },
      },
    },
    orderBy: {
      createdAt: 'asc'
    }
  },
};

const calculateCartTotals = (cart: Prisma.CartGetPayload<{ include: typeof CART_INCLUDE_OPTIONS }>) => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  // Add tax, shipping, etc. as needed in a real application
  const tax = 0; // Placeholder
  const total = subtotal + tax;
  return { subtotal, tax, total };
};

export const cartService = {
  async getCartByUserId(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: CART_INCLUDE_OPTIONS,
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: CART_INCLUDE_OPTIONS,
      });
    }
    const totals = calculateCartTotals(cart);
    return { ...cart, ...totals };
  },

  async addItemToCart(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive.');
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new Error('Product not found.');
    }
    if (product.stock < quantity) {
      throw new Error('Insufficient stock.');
    }

    const cart = await this.getCartByUserId(userId);

    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new Error('Insufficient stock for updated quantity.');
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }
    return this.getCartByUserId(userId); // Return updated cart
  },

  async updateCartItem(userId: string, cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive.');
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true, cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new Error('Cart item not found or access denied.');
    }
    if (cartItem.product.stock < quantity) {
      throw new Error('Insufficient stock.');
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
    return this.getCartByUserId(userId);
  },

  async removeItemFromCart(userId: string, cartItemId: string) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new Error('Cart item not found or access denied.');
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    return this.getCartByUserId(userId);
  },

  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new Error('Cart not found.');
    }
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCartByUserId(userId);
  },
};
