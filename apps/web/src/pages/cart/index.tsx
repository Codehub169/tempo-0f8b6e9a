import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { Trash2Icon, PlusCircleIcon, MinusCircleIcon, ShoppingBagIcon, ArrowRightIcon } from 'lucide-react';

const CartPage: NextPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartSubtotal, getEstimatedTax } = useCart();

  const subtotal = getCartSubtotal();
  const estimatedTax = getEstimatedTax();
  const total = getCartTotal();

  if (cartItems.length === 0) {
    return (
      <Layout>
        <Head>
          <title>Shopping Cart - E-commerce</title>
        </Head>
        <div className="container-max py-12 px-4 text-center">
          <ShoppingBagIcon className="mx-auto h-24 w-24 text-gray-300 mb-6" />
          <h1 className="text-3xl font-poppins font-semibold text-gray-800 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet. Explore our products and find something you love!</p>
          <Link href="/products" legacyBehavior>
            <a className="btn btn-primary inline-flex items-center group">
              Continue Shopping
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"/>
            </a>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Shopping Cart - E-commerce</title>
      </Head>
      <div className="container-max py-8 px-4">
        <h1 className="text-4xl font-poppins font-bold text-gray-900 mb-8">Your Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-start space-x-4 bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image 
                    src={item.imageUrl || 'https://picsum.photos/200/200?random=c81e728d9d'}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold text-gray-800 hover:text-primary-600 transition-colors">
                    <Link href={`/products/${item.id}`}>{item.name}</Link>
                  </h2>
                  <p className="text-sm text-gray-500">Price: ${item.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Category: {item.category || 'N/A'}</p>
                  <div className="flex items-center mt-3 space-x-3">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                      disabled={item.quantity <= 1}
                      className="text-gray-500 hover:text-primary-600 disabled:opacity-50 transition-colors p-1 rounded-full hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      <MinusCircleIcon className="h-6 w-6" />
                    </button>
                    <span className="text-md font-medium text-gray-700 w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                      className="text-gray-500 hover:text-primary-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      <PlusCircleIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between h-full">
                  <p className="text-lg font-semibold text-primary-700">${(item.price * item.quantity).toFixed(2)}</p>
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="text-red-500 hover:text-red-700 transition-colors mt-auto p-1 rounded-full hover:bg-red-50"
                    aria-label="Remove item"
                  >
                    <Trash2Icon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg shadow-xl sticky top-24">
            <h2 className="text-2xl font-poppins font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-300">Order Summary</h2>
            <div className="space-y-3 mb-6 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (10%)</span>
                <span className="font-medium">${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" legacyBehavior>
              <a className="btn btn-primary w-full flex items-center justify-center group shadow-lg hover:shadow-primary-400/50 transform hover:scale-105 transition-transform">
                Proceed to Checkout
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Link>
            <p className="text-xs text-gray-500 mt-4 text-center">Shipping costs will be calculated at checkout.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
