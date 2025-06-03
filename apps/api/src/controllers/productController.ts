import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

// Get all products with optional filtering, sorting, and pagination
export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, sortBy, order = 'asc', page = 1, limit = 10, search } = req.query;

    const where: any = {};
    if (category) {
      where.categories = {
        some: {
          category: {
            name: category as string,
          },
        },
      };
    }
    if (search) {
        where.OR = [
            { name: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } }
        ];
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy as string] = order;
    } else {
      orderBy.createdAt = 'desc'; // Default sort
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: Number(limit),
      include: {
        categories: { include: { category: true } },
        reviews: { select: { rating: true } }, // Only select rating for product list performance
      },
    });

    const totalProducts = await prisma.product.count({ where });
    
    // Calculate average rating for each product
    const productsWithAvgRating = products.map(product => {
        const avgRating = product.reviews.length > 0 
            ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
            : 0;
        const { reviews, ...productWithoutReviews } = product; // Exclude detailed reviews from list
        return { ...productWithoutReviews, averageRating: parseFloat(avgRating.toFixed(1)) };
    });

    res.status(200).json({
      message: 'Products fetched successfully',
      data: productsWithAvgRating,
      pagination: {
        totalItems: totalProducts,
        currentPage: Number(page),
        itemsPerPage: Number(limit),
        totalPages: Math.ceil(totalProducts / Number(limit)),
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single product by ID
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        reviews: { 
            include: { user: { select: { id: true, name: true }} }, // Select specific user fields
            orderBy: { createdAt: 'desc' }
        },
      },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const avgRating = product.reviews.length > 0 
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
        : 0;

    res.status(200).json({ 
        message: 'Product fetched successfully', 
        data: { ...product, averageRating: parseFloat(avgRating.toFixed(1)) } 
    });
  } catch (error) {
    next(error);
  }
};

// Create a new product (Admin/Seller role typically)
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, stock, imageUrls, categoryIds } = req.body;
    if (!name || !description || price == null || stock == null) {
        return res.status(400).json({ message: 'Missing required fields: name, description, price, stock' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        imageUrls: imageUrls || [],
        categories: categoryIds && categoryIds.length > 0 ? {
          create: categoryIds.map((categoryId: string) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        } : undefined,
      },
      include: {
        categories: { include: { category: true } }
      }
    });
    res.status(201).json({ message: 'Product created successfully', data: product });
  } catch (error) {
    next(error);
  }
};

// Update an existing product (Admin/Seller role typically)
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, imageUrls, categoryIds } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productDataToUpdate: any = {};
    if (name !== undefined) productDataToUpdate.name = name;
    if (description !== undefined) productDataToUpdate.description = description;
    if (price !== undefined) productDataToUpdate.price = parseFloat(price);
    if (stock !== undefined) productDataToUpdate.stock = parseInt(stock, 10);
    if (imageUrls !== undefined) productDataToUpdate.imageUrls = imageUrls;

    // Handle category updates in a transaction if categoryIds are provided
    if (categoryIds && Array.isArray(categoryIds)) {
        await prisma.$transaction(async (tx) => {
            await tx.productCategory.deleteMany({ where: { productId: id } });
            if (categoryIds.length > 0) {
                await tx.product.update({
                    where: { id },
                    data: {
                        categories: {
                            create: categoryIds.map((categoryId: string) => ({
                                category: {
                                    connect: { id: categoryId },
                                },
                            })),
                        }
                    }
                });
            }
            // Update other product fields
            await tx.product.update({
                where: { id },
                data: productDataToUpdate,
            });
        });
    } else {
        // Update only product fields if no category changes
        await prisma.product.update({
            where: { id },
            data: productDataToUpdate,
        });
    }
    
    const finalProduct = await prisma.product.findUnique({
        where: { id },
        include: { 
            categories: { include: { category: true } }, 
            reviews: { include: { user: {select: {id: true, name: true}} } }
        }
    });

    res.status(200).json({ message: 'Product updated successfully', data: finalProduct });
  } catch (error) {
    next(error);
  }
};

// Delete a product (Admin/Seller role typically)
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Use a transaction to ensure all related data is deleted with the product
    await prisma.$transaction(async (tx) => {
        await tx.productCategory.deleteMany({ where: { productId: id } });
        await tx.review.deleteMany({ where: { productId: id } });
        await tx.cartItem.deleteMany({ where: { productId: id } });
        await tx.orderItem.deleteMany({ where: { productId: id } });
        await tx.product.delete({ where: { id } });
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
