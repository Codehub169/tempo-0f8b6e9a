import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
// import { useProducts } from '../../hooks/useProducts'; // To be created
// import ProductCard from '../../components/ProductCard'; // To be created

// Placeholder ProductType - replace with actual type from API client or types definition
interface ProductType {
  id: string;
  name:string;
  price: number;
  imageUrl?: string; // Optional, will use placeholder if not provided
  description?: string;
  averageRating?: number;
  stock?: number;
  category?: string; // Example, adjust as per actual data model
}

// Placeholder ProductCard component (inline for now, ideally imported)
const ProductCard = ({ product }: { product: ProductType }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group transform hover:shadow-xl transition-all duration-300 ease-in-out">
    <Link href={`/products/${product.id}`} passHref>
      <a className="block relative w-full h-64 overflow-hidden">
        <Image 
          src={product.imageUrl || '/placeholder.jpg'} 
          alt={product.name} 
          layout="fill" 
          objectFit="cover" 
          className="group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        {product.stock !== undefined && product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">Out of Stock</span>
        )}
      </a>
    </Link>
    <div className="p-6 flex flex-col flex-grow">
      {product.category && <p className="text-xs text-primary uppercase font-semibold tracking-wider mb-1">{product.category}</p>}
      <Link href={`/products/${product.id}`} passHref>
        <a className="block">
          <h3 className="text-lg font-semibold text-textHeading mb-2 truncate group-hover:text-primary transition-colors" title={product.name}>{product.name}</h3>
        </a>
      </Link>
      {product.description && <p className="text-sm text-textSecondary mb-3 line-clamp-2 flex-grow">{product.description}</p>}
      <div className="flex items-center justify-between mt-auto">
        <p className="text-xl font-bold text-accent">${product.price.toFixed(2)}</p>
        {product.averageRating && (
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`w-4 h-4 fill-current ${i < Math.round(product.averageRating!) ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.averageRating.toFixed(1)})</span>
          </div>
        )}
      </div>
      <Link href={`/products/${product.id}`} passHref>
        <a className="btn btn-primary w-full mt-4 text-center">
          View Product
        </a>
      </Link>
    </div>
  </div>
);

// Mock implementation of useProducts hook for demonstration
const useProducts = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call e.g., `await apiClient.get('/products')`
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        const mockProducts: ProductType[] = [
          { id: '1', name: 'Elegant Smartwatch Series 7', price: 299.00, imageUrl: 'https://source.unsplash.com/400x400/?smartwatch', description: 'Stay connected and track your fitness with this sleek smartwatch.', averageRating: 4.5, stock: 15, category: 'Electronics' },
          { id: '2', name: 'Noise-Cancelling Over-Ear Headphones', price: 179.50, imageUrl: 'https://source.unsplash.com/400x400/?headphones', description: 'Immerse yourself in sound with these comfortable noise-cancelling headphones.', averageRating: 4.8, stock: 8, category: 'Audio' },
          { id: '3', name: 'Professional DSLR Camera Kit', price: 899.99, imageUrl: 'https://source.unsplash.com/400x400/?camera', description: 'Capture stunning photos and videos with this versatile DSLR kit.', averageRating: 4.2, stock: 0, category: 'Photography' }, 
          { id: '4', name: 'Organic Green Tea Blend (50 Bags)', price: 15.00, imageUrl: 'https://source.unsplash.com/400x400/?tea', description: 'A refreshing and healthy blend of organic green teas.', averageRating: 4.9, stock: 50, category: 'Groceries' },
          { id: '5', name: 'Modern Minimalist Desk Lamp', price: 45.00, imageUrl: 'https://source.unsplash.com/400x400/?lamp', description: 'Illuminate your workspace with this stylish and functional desk lamp.', averageRating: 4.0, stock: 22, category: 'Home Goods' },
          { id: '6', name: 'Leather Messenger Bag for Laptops', price: 120.00, imageUrl: 'https://source.unsplash.com/400x400/?bag', description: 'Carry your essentials in style with this durable leather messenger bag.', averageRating: 4.6, stock: 12, category: 'Accessories' },
        ];
        setProducts(mockProducts);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products.');
        console.error(err);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return { products, loading, error };
};

export default function ProductsPage() {
  const { products, loading, error } = useProducts();

  return (
    <>
      <Head>
        <title>Our Products - E-commerce Platform</title>
        <meta name="description" content="Browse our wide selection of products." />
      </Head>

      <div className="container-max py-8 md:py-12">
        <header className="mb-8 md:mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-textHeading">Discover Our Collection</h1>
          <p className="mt-3 text-lg text-textSecondary max-w-2xl mx-auto">
            Find everything you need from electronics to home goods. High quality, great prices.
          </p>
        </header>

        {/* Placeholder for Filters and Sorting - to be implemented later */}
        <div className="mb-8 p-4 bg-gray-100 rounded-lg text-center text-gray-600">
          Advanced Filters & Sorting Options Coming Soon!
        </div>

        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-textSecondary">Loading Products...</p>
          </div>
        )}
        {error && <p className="text-center text-red-500 py-10 text-lg">Error: {error}</p>}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
           <div className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-textHeading">No Products Found</h3>
            <p className="mt-1 text-sm text-textSecondary">Check back later or try adjusting your filters.</p>
          </div>
        )}
      </div>
    </>
  );
}
