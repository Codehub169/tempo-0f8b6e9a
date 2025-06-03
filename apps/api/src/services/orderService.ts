import prisma from '../prisma/client';
import { OrderStatus, Prisma } from '@prisma/client';
import { cartService } from './cartService'; // Assuming cartService is in the same directory or correctly pathed

const ORDER_INCLUDE_OPTIONS: Prisma.OrderInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
        },
      },
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    }
  }
};

export const orderService = {
  async createOrder(userId: string, data: { shippingAddress: string; billingAddress: string; paymentMethod: string; paymentToken: string }) {
    const cart = await cartService.getCartByUserId(userId);
    if (!cart.items.length) {
      throw new Error('Cart is empty. Cannot create order.');
    }

    return prisma.$transaction(async (tx) => {
      let orderTotal = 0;
      const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

      for (const item of cart.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price, // Use current product price at time of order
        });
        orderTotal += item.quantity * product.price;

        // Update stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      
      // Simulate payment processing with paymentToken - in a real app, integrate with a payment gateway
      // For now, we assume payment is successful if a token is provided.
      if (!data.paymentToken) {
        throw new Error('Payment token is required.');
      }

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount: orderTotal,
          status: OrderStatus.PENDING,
          shippingAddress: data.shippingAddress,
          billingAddress: data.billingAddress,
          paymentMethod: data.paymentMethod,
          paymentResult: { token: data.paymentToken, status: 'SIMULATED_SUCCESS' }, // Store mock payment result
          items: {
            createMany: {
              data: orderItemsData,
            },
          },
        },
        include: ORDER_INCLUDE_OPTIONS,
      });

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });
  },

  async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: ORDER_INCLUDE_OPTIONS,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
    const totalOrders = await prisma.order.count({ where: { userId } });
    return {
      data: orders,
      meta: {
        total: totalOrders,
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit),
      }
    }
  },

  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: ORDER_INCLUDE_OPTIONS,
    });

    if (!order || order.userId !== userId) {
      throw new Error('Order not found or access denied.');
    }
    return order;
  },

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    if (!Object.values(OrderStatus).includes(status)) {
        throw new Error('Invalid order status.');
    }
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found.');
    }

    // Add logic here if status transitions are restricted (e.g., cannot go from SHIPPED to PENDING)

    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: ORDER_INCLUDE_OPTIONS,
    });
  },
};
