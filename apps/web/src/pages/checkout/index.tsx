import { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, FormEvent } from 'react';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import apiClient from '@/lib/apiClient';
import { CreditCardIcon, LockIcon, ArrowLeftIcon, ShoppingBagIcon, UserIcon, HomeIcon, MailIcon, PhoneIcon } from 'lucide-react';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
}

const CheckoutPage: NextPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '', email: '', phone: '', address: '', city: '', postalCode: '', country: 'United States',
    cardNumber: '', expiryDate: '', cvc: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const total = getCartTotal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Simulate API call to create order
      // In a real app, this would send formData and cartItems to the backend
      // await apiClient.post('/orders', { cartItems, shippingDetails: formData, paymentDetails: { cardNumber: formData.cardNumber /* etc. */ } });
      console.log('Order submitted:', { cartItems, formData });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      clearCart();
      setOrderSuccess(true);
      // router.push('/orders/success?orderId=mock123'); // Or redirect to a success page
    } catch (err) {
      setError('Failed to place order. Please check your details and try again.');
      console.error(err);
    }
    setLoading(false);
  };

  if (orderSuccess) {
    return (
      <Layout>
        <Head><title>Order Successful - E-commerce</title></Head>
        <div className="container-max py-16 px-4 text-center">
          <ShoppingBagIcon className="mx-auto h-24 w-24 text-green-500 mb-6" />
          <h1 className="text-3xl font-poppins font-semibold text-gray-800 mb-4">Thank You For Your Order!</h1>
          <p className="text-gray-600 mb-8">Your order has been placed successfully. You will receive an email confirmation shortly.</p>
          <div className="space-x-4">
            <Link href="/products" legacyBehavior><a className="btn btn-secondary">Continue Shopping</a></Link>
            <Link href="/orders" legacyBehavior><a className="btn btn-primary">View Order History</a></Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (cartItems.length === 0 && !orderSuccess) {
    // Redirect to cart if it's empty and order wasn't just placed.
    // This check prevents users from directly accessing checkout with an empty cart.
    if (typeof window !== 'undefined') router.push('/cart');
    return <Layout><div className="container-max py-10 text-center">Your cart is empty. Redirecting...</div></Layout>;
  }

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm placeholder-gray-400 text-gray-700";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <Layout>
      <Head>
        <title>Checkout - E-commerce</title>
      </Head>
      <div className="container-max py-8 px-4">
        <Link href="/cart" className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors mb-8 group">
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Cart
        </Link>
        <h1 className="text-4xl font-poppins font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8 bg-white p-8 rounded-xl shadow-2xl">
            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold font-poppins text-gray-800 mb-6 border-b pb-3">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className={labelClass}>Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="John Doe" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>Email Address</label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="you@example.com" required />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>Phone Number</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="(555) 123-4567" />
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="text-2xl font-semibold font-poppins text-gray-800 mb-6 border-b pb-3">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className={labelClass}>Street Address</label>
                  <div className="relative">
                    <HomeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="123 Main St" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label htmlFor="city" className={labelClass}>City</label><input type="text" name="city" id="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="New York" required /></div>
                  <div><label htmlFor="postalCode" className={labelClass}>Postal Code</label><input type="text" name="postalCode" id="postalCode" value={formData.postalCode} onChange={handleChange} className={inputClass} placeholder="10001" required /></div>
                  <div><label htmlFor="country" className={labelClass}>Country</label><input type="text" name="country" id="country" value={formData.country} onChange={handleChange} className={inputClass} placeholder="United States" required /></div>
                </div>
              </div>
            </section>

            {/* Payment Details - Mocked */}
            <section>
              <h2 className="text-2xl font-semibold font-poppins text-gray-800 mb-6 border-b pb-3">Payment Details</h2>
              <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Secure payment processing. Your information is encrypted.</p>
                <div>
                  <label htmlFor="cardNumber" className={labelClass}>Card Number</label>
                  <div className="relative">
                    <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="cardNumber" id="cardNumber" value={formData.cardNumber} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="•••• •••• •••• ••••" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div><label htmlFor="expiryDate" className={labelClass}>Expiry Date</label><input type="text" name="expiryDate" id="expiryDate" value={formData.expiryDate} onChange={handleChange} className={inputClass} placeholder="MM/YY" required /></div>
                  <div><label htmlFor="cvc" className={labelClass}>CVC</label><input type="text" name="cvc" id="cvc" value={formData.cvc} onChange={handleChange} className={inputClass} placeholder="•••" required /></div>
                </div>
              </div>
            </section>
            
            {error && <p className="text-red-600 text-sm bg-red-100 p-3 rounded-md">{error}</p>}

            <button 
              type="submit" 
              disabled={loading || cartItems.length === 0}
              className="btn btn-primary w-full text-lg py-4 flex items-center justify-center space-x-2 shadow-xl hover:shadow-primary-500/60 transform hover:scale-105 transition-transform duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <LockIcon className="h-5 w-5" />
                  <span>Place Order (${total.toFixed(2)})</span>
                </>
              )}
            </button>
          </form>

          {/* Order Summary (Checkout) */}
          <div className="lg:col-span-1 bg-gray-50 p-8 rounded-xl shadow-xl sticky top-24">
            <h2 className="text-2xl font-poppins font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-300">Order Summary</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto mb-6 pr-2 custom-scrollbar">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-start space-x-4 py-3 border-b border-gray-200 last:border-b-0">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={item.imageUrl || 'https://picsum.photos/100/100?random=d2d0954be7'} alt={item.name} layout="fill" objectFit="cover" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t border-gray-300 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">${(total / 1.1).toFixed(2)}</span> {/* Assuming 10% tax was included in total */}
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span className="font-medium">${(total - total / 1.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-semibold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
