import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import apiClient from '@/lib/apiClient';
import { Product, Review as ReviewType } from '@/types'; // Assuming types are defined in @/types
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import { StarIcon, ShoppingCartIcon, ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

// Define a more detailed Product type for this page if different from a generic one
interface ProductDetail extends Product {
  description: string;
  images: { url: string; alt: string }[];
  stock: number;
  reviews: ReviewType[]; // Assuming ReviewType includes user, rating, comment, date
  averageRating: number;
  totalReviews: number;
  category?: string; // From previous ProductCard, let's keep it
}

const ProductDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          // Replace with actual API call
          // const response = await apiClient.get(`/products/${id}`);
          // setProduct(response.data);
          
          // Mock data for now, assuming API client and types are set up
          // In a real scenario, images would come from product.images array
          // For mock, ensure product images are available or use a placeholder
          const mockProduct: ProductDetail = {
            id: id as string,
            name: `Premium Comfort T-Shirt ${id}`,
            description: 'Experience unparalleled comfort and style with our Premium Comfort T-Shirt. Made from 100% ethically sourced Supima cotton, this t-shirt offers a luxuriously soft feel and exceptional durability. Its tailored fit flatters all body types, while the reinforced neckline ensures it maintains its shape wash after wash. Available in a range of sophisticated colors, it\'s the perfect staple for any modern wardrobe, whether dressed up or down.',
            price: 29.99,
            images: [
              { url: 'https://source.unsplash.com/800x600/?tshirt,product&sig=1', alt: 'Product Image 1' },
              { url: 'https://source.unsplash.com/800x600/?tshirt,model&sig=2', alt: 'Product Image 2' },
              { url: 'https://source.unsplash.com/800x600/?cotton,fabric&sig=3', alt: 'Product Image 3' },
            ],
            stock: 25,
            category: 'Apparel',
            reviews: [
              { id: '1', userId: 'user1', productId: id as string, rating: 5, comment: 'Absolutely love this t-shirt! So soft and fits perfectly.', createdAt: new Date().toISOString(), user: { id: 'user1', name: 'Alice Wonderland' } },
              { id: '2', userId: 'user2', productId: id as string, rating: 4, comment: 'Great quality, very comfortable. Color is slightly different than expected.', createdAt: new Date().toISOString(), user: { id: 'user2', name: 'Bob The Builder' } },
            ],
            averageRating: 4.5,
            totalReviews: 2,
          };
          setProduct(mockProduct);
          
        } catch (err) {
          setError('Failed to fetch product details. Please try again later.');
          console.error(err);
        }
        setLoading(false);
      };
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, imageUrl: product.images[0]?.url || '/placeholder.jpg' }, quantity);
      // Optionally, show a notification
    }
  };

  const handleReviewSubmitted = (newReview: ReviewType) => {
    if (product) {
      setProduct(prevProduct => {
        if (!prevProduct) return null;
        const updatedReviews = [...prevProduct.reviews, newReview];
        const newAverageRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
        return {
          ...prevProduct,
          reviews: updatedReviews,
          totalReviews: updatedReviews.length,
          averageRating: parseFloat(newAverageRating.toFixed(1)),
        };
      });
    }
  };

  if (loading) return <Layout><div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div></div></Layout>;
  if (error) return <Layout><div className="container-max text-center py-10 text-red-500">{error}</div></Layout>;
  if (!product) return <Layout><div className="container-max text-center py-10">Product not found.</div></Layout>;

  return (
    <Layout>
      <Head>
        <title>{product.name} - E-commerce</title>
        <meta name="description" content={product.description} />
      </Head>

      <div className="container-max py-8 px-4">
        <Link href="/products" className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors mb-6 group">
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Product Image Gallery */}
          <div className="grid gap-4">
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-gray-100">
              <Image 
                src={product.images[0]?.url || 'https://picsum.photos/800/600?random=cfcd208495'} 
                alt={product.images[0]?.alt || product.name}
                layout="fill"
                objectFit="cover"
                className="transform hover:scale-105 transition-transform duration-500 ease-in-out"
                priority
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.slice(1, 4).map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-md overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-50 cursor-pointer">
                  <Image 
                    src={img.url} 
                    alt={img.alt}
                    layout="fill"
                    objectFit="cover"
                    className="transform hover:scale-105 transition-transform duration-300"
                    onClick={() => { /* Could implement main image change here */ }}
                    />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 font-poppins">{product.name}</h1>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`h-5 w-5 ${i < Math.round(product.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill={i < Math.round(product.averageRating) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-gray-600">({product.totalReviews} reviews)</span>
            </div>

            <p className="text-3xl text-primary-600 font-semibold">${product.price.toFixed(2)}</p>
            
            <div className="prose prose-lg text-gray-700">
              <p>{product.description}</p>
            </div>

            <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>

            {product.stock > 0 && (
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-l-md transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    readOnly 
                    className="w-12 text-center border-transparent focus:border-transparent focus:ring-0"
                    aria-label="Quantity"
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} 
                    className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-r-md transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="btn btn-primary flex-grow flex items-center justify-center space-x-2 transform hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-primary-400/50"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          <h2 className="text-3xl font-poppins font-semibold text-gray-900 mb-8">Customer Reviews</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Write a review</h3>
              <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">What others are saying</h3>
              <ReviewList reviews={product.reviews} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
