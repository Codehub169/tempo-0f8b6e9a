import prisma from '../prisma/client';
import { Prisma } from '@prisma/client';

interface GetAllProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sortBy?: string; // e.g., 'price_asc', 'price_desc', 'name_asc', 'createdAt_desc'
  minPrice?: number;
  maxPrice?: number;
}

export const productService = {
  async getAllProducts(options: GetAllProductsOptions = {}) {
    const { page = 1, limit = 10, search, categoryId, sortBy, minPrice, maxPrice } = options;
    const skip = (page - 1) * limit;

    let where: Prisma.ProductWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) {
      where.categories = {
        some: { categoryId },
      };
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }; // Default sort
    if (sortBy) {
      const [field, direction] = sortBy.split('_');
      if (['price', 'name', 'createdAt'].includes(field) && ['asc', 'desc'].includes(direction)) {
        orderBy = { [field]: direction as Prisma.SortOrder };
      }
    }

    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        categories: { include: { category: true } },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } } // Select only rating for avg calculation
      },
    });

    const totalProducts = await prisma.product.count({ where });

    // Calculate average rating for each product
    const productsWithAvgRating = products.map(product => {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { reviews, ...productData } = product; // Exclude full reviews array from final product object unless needed
      return {
        ...productData,
        averageRating: parseFloat(avgRating.toFixed(2)),
        reviewCount: product._count.reviews
      };
    });

    return {
      data: productsWithAvgRating,
      meta: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    };
  },

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        reviews: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' }
        },
      },
    });

    if (!product) return null;

    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

    return {
      ...product,
      averageRating: parseFloat(avgRating.toFixed(2)),
      reviewCount: product.reviews.length
    };
  },

  async createProduct(data: Prisma.ProductCreateInput & { categoryIds?: string[] }) {
    const { categoryIds, ...productData } = data;
    return prisma.product.create({
      data: {
        ...productData,
        categories: categoryIds ? {
          create: categoryIds.map(catId => ({ categoryId: catId }))
        } : undefined,
      },
      include: { categories: { include: { category: true } } }
    });
  },

  async updateProduct(id: string, data: Prisma.ProductUpdateInput & { categoryIds?: string[] }) {
    const { categoryIds, ...productData } = data;

    return prisma.$transaction(async (tx) => {
      if (categoryIds) {
        // Remove existing category associations
        await tx.productCategory.deleteMany({ where: { productId: id } });
        // Add new category associations
        if (categoryIds.length > 0) {
          await tx.productCategory.createMany({
            data: categoryIds.map(catId => ({ productId: id, categoryId: catId }))
          });
        }
      }
      const updatedProduct = await tx.product.update({
        where: { id },
        data: productData,
        include: { categories: { include: { category: true } } }
      });
      return updatedProduct;
    });
  },

  async deleteProduct(id: string) {
    // Prisma's cascading delete rules in schema.prisma should handle related data like reviews, orderItems, cartItems.
    // ProductCategories are handled manually if not set to cascade or if more complex logic is needed.
    return prisma.$transaction(async (tx) => {
      await tx.productCategory.deleteMany({ where: { productId: id } });
      // Cascade delete should take care of Review, CartItem, OrderItem based on schema relations
      // If not, they need to be manually deleted here.
      // Example: await tx.review.deleteMany({ where: { productId: id } });
      const deletedProduct = await tx.product.delete({ where: { id } });
      return deletedProduct;
    });
  },
};
