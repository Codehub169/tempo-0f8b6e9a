import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '@radix-ui/react-icons'; // Using Radix for icons

// Placeholder ProductType - replace with actual type from API client or types definition
interface ProductType {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category?: string; // Optional category
}

// Placeholder ProductCard component structure - replace with actual import
// import ProductCard from '../components/ProductCard';
const ProductCard = ({ product }: { product: ProductType }) => (
  <div className="bg-white shadow-lg rounded-xl overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
    <div className="relative w-full h-56">
      <Image src={product.imageUrl || '/placeholder.jpg'} alt={product.name} layout="fill" objectFit="cover" />
    </div>
    <div className="p-6">
      {product.category && <p className="text-xs text-primary uppercase font-semibold tracking-wider mb-1">{product.category}</p>}
      <h3 className="text-xl font-semibold text-textHeading mb-2 truncate" title={product.name}>{product.name}</h3>
      <p className="text-2xl font-bold text-accent mb-4">${product.price.toFixed(2)}</p>
      <Link href={`/products/${product.id}`} passHref>
        <a className="btn btn-primary w-full text-center">View Details</a>
      </Link>
    </div>
  </div>
);

const featuredProducts: ProductType[] = [
  // This is mock data. Replace with API call using useProducts hook later.
  { id: '1', name: 'Premium Wireless Headphones', price: 199.99, imageUrl: '/placeholder.jpg', category: 'Electronics' },
  { id: '2', name: 'Organic Cotton T-Shirt', price: 29.99, imageUrl: '/placeholder.jpg', category: 'Apparel' },
  { id: '3', name: 'Artisan Coffee Beans', price: 18.50, imageUrl: '/placeholder.jpg', category: 'Groceries' },
];

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Welcome to Our E-commerce Store</title>
        <meta name="description" content="Discover amazing products at great prices." />
      </Head>

      {/* Hero Section */}
      <section 
        className="relative py-20 md:py-32 bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white overflow-hidden"
        style={{
          backgroundImage: "url('https://source.unsplash.com/1600x900/?online,shopping,modern&sig=0')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div> {/* Overlay for text readability */}
        <div className="container-max relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fadeIn">
            Find Your Next Favorite Thing
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fadeIn delay-200">
            Explore our curated collection of high-quality products, designed to inspire and delight.
          </p>
          <Link href="/products" passHref>
            <a className="btn btn-accent text-lg px-8 py-4 inline-flex items-center group animate-fadeIn delay-400 transform hover:scale-105">
              Shop All Products <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-background-alt">
        <div className="container-max">
          <h2 className="text-3xl md:text-4xl font-bold text-textHeading text-center mb-12">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/products" passHref>
              <a className="btn btn-secondary text-lg px-8 py-4">
                Explore More
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action / Value Proposition Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-max grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-textHeading mb-6">Why Shop With Us?</h2>
            <ul className="space-y-4 text-lg text-textSecondary">
              <li className="flex items-start">
                <svg className="flex-shrink-0 h-6 w-6 text-accent mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                Curated selection of high-quality items.
              </li>
              <li className="flex items-start">
                <svg className="flex-shrink-0 h-6 w-6 text-accent mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                Fast, reliable shipping across the country.
              </li>
              <li className="flex items-start">
                <svg className="flex-shrink-0 h-6 w-6 text-accent mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                Exceptional customer support, here for you.
              </li>
            </ul>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="https://source.unsplash.com/800x600/?ecommerce,gallery&sig=0" 
              alt="Happy customer shopping"
              width={800}
              height={600}
              objectFit="cover"
              className="transform hover:scale-110 transition-transform duration-500 ease-out"
            />
          </div>
        </div>
      </section>
    </>
  );
}
