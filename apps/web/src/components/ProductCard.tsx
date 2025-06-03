import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Zap } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category?: string;
  averageRating?: number | null;
  reviewCount?: number;
  stock: number;
  tagline?: string;
  originalPrice?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  imageUrl = 'https://source.unsplash.com/800x600/?product_placeholder&sig=0', 
  category = 'General',
  averageRating,
  reviewCount = 0,
  stock,
  tagline,
  originalPrice,
}) => {
  const isOutOfStock = stock <= 0;
  const discountPercentage = originalPrice && originalPrice > price 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col group transition-all duration-300 ease-in-out hover:shadow-primary-glow transform hover:-translate-y-1">
      <Link href={`/products/${id}`} legacyBehavior>
        <a className="block relative aspect-square overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 ease-in-out group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false} 
            loading="lazy"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white text-lg font-semibold uppercase tracking-wider">Out of Stock</span>
            </div>
          )}
          {discountPercentage > 0 && (
            <div className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1 shadow-md">
              <Zap size={14} />
              <span>{discountPercentage}% OFF</span>
            </div>
          )}
        </a>
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        {category && (
          <span className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">{category}</span>
        )}
        <Link href={`/products/${id}`} legacyBehavior>
          <a className="block">
            <h3 className="text-lg font-semibold text-text-primary mb-1 truncate group-hover:text-primary transition-colors duration-300" title={name}>
              {name}
            </h3>
          </a>
        </Link>
        {tagline && <p className="text-sm text-text-secondary mb-2 h-10 overflow-hidden text-ellipsis">{tagline}</p>}

        <div className="flex items-center justify-between mb-3 mt-auto pt-2">
          <div>
            <span className="text-xl font-bold text-primary">
              ${price.toFixed(2)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-text-tertiary line-through ml-2">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {averageRating !== null && averageRating !== undefined && (
            <div className="flex items-center space-x-1 text-sm text-yellow-500">
              <Star size={18} className="fill-current" />
              <span>{averageRating.toFixed(1)}</span>
              <span className="text-text-tertiary">({reviewCount})</span>
            </div>
          )}
        </div>

        <button 
          disabled={isOutOfStock}
          className={`w-full flex items-center justify-center py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 ease-in-out 
            ${isOutOfStock 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg focus:ring-2 focus:ring-primary-light focus:outline-none transform hover:scale-105 active:scale-100'}
          `}
          // onClick event for 'Add to Cart' will be handled by the parent page/context
        >
          <ShoppingCart size={20} className="mr-2"/>
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;