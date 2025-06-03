import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import apiClient from '@/lib/apiClient';
import { PackageIcon, CalendarIcon, HashIcon, DollarSignIcon, AlertTriangleIcon, InfoIcon, ShoppingBagIcon, ArrowRightIcon } from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  orderDate: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

const OrdersPage: NextPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        // const response = await apiClient.get('/orders');
        // setOrders(response.data);
        
        // Mock data for now
        const mockOrders: Order[] = [
          {
            id: 'ORD12345',
            orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'Delivered',
            totalAmount: 79.98,
            items: [
              { id: 'item1', productId: 'prodA', name: 'Premium Comfort T-Shirt', quantity: 1, price: 29.99, imageUrl: 'https://source.unsplash.com/200x200/?tshirt,product&sig=10' },
              { id: 'item2', productId: 'prodB', name: 'Classic Cotton Cap', quantity: 1, price: 19.99, imageUrl: 'https://source.unsplash.com/200x200/?cap,product&sig=11' },
            ],
            shippingAddress: { fullName: 'Jane Doe', address: '456 Oak Avenue', city: 'Springfield', postalCode: '62704', country: 'USA' }
          },
          {
            id: 'ORD67890',
            orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'Shipped',
            totalAmount: 45.50,
            items: [
              { id: 'item3', productId: 'prodC', name: 'Stylish Water Bottle', quantity: 1, price: 25.50, imageUrl: 'https://source.unsplash.com/200x200/?bottle,product&sig=12' },
            ],
            shippingAddress: { fullName: 'Jane Doe', address: '456 Oak Avenue', city: 'Springfield', postalCode: '62704', country: 'USA' }
          },
        ];
        setOrders(mockOrders);
      } catch (err) {
        setError('Failed to fetch orders. Please try again later.');
        console.error(err);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Processing': return 'bg-yellow-100 text-yellow-700';
      case 'Pending': return 'bg-gray-100 text-gray-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <Layout><div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div></div></Layout>;
  }

  if (error) {
    return <Layout><div className="container-max py-10 px-4 text-center text-red-600 bg-red-50 p-6 rounded-lg shadow-md"><AlertTriangleIcon className="mx-auto h-12 w-12 mb-4" />{error}</div></Layout>;
  }

  if (orders.length === 0) {
    return (
      <Layout>
        <Head><title>My Orders - E-commerce</title></Head>
        <div className="container-max py-12 px-4 text-center">
          <ShoppingBagIcon className="mx-auto h-24 w-24 text-gray-300 mb-6" />
          <h1 className="text-3xl font-poppins font-semibold text-gray-800 mb-4">No Orders Yet</h1>
          <p className="text-gray-600 mb-8">You haven't placed any orders with us. When you do, they'll appear here.</p>
          <Link href="/products" legacyBehavior>
            <a className="btn btn-primary inline-flex items-center group">
              Start Shopping
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
        <title>My Orders - E-commerce</title>
      </Head>
      <div className="container-max py-8 px-4">
        <h1 className="text-4xl font-poppins font-bold text-gray-900 mb-10">My Orders</h1>
        
        <div className="space-y-8">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 md:p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-semibold text-primary-700 font-poppins flex items-center">
                    <HashIcon className="h-6 w-6 mr-2 text-primary-500" /> Order ID: {order.id}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <CalendarIcon className="h-4 w-4 mr-2" /> Placed on: {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div className={`mt-3 md:mt-0 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)} flex items-center`}>
                  <PackageIcon className="h-4 w-4 mr-2" /> {order.status}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Items Ordered:</h3>
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={item.imageUrl || 'https://picsum.photos/100/100?random=0bb1920a11'} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                      />
                      <div className="flex-grow">
                        <p className="font-medium text-gray-700 hover:text-primary-600"><Link href={`/products/${item.productId}`}>{item.name}</Link></p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Shipping Address</h3>
                    <address className="text-sm text-gray-600 not-italic">
                        {order.shippingAddress.fullName}<br />
                        {order.shippingAddress.address}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                        {order.shippingAddress.country}
                    </address>
                </div>
                <div className="flex flex-col items-start md:items-end justify-between">
                    <div className="text-right">
                        <p className="text-lg font-semibold text-gray-800 mb-1">Order Total</p>
                        <p className="text-2xl font-bold text-primary-700 flex items-center justify-end">
                            <DollarSignIcon className="h-6 w-6 mr-1" /> {order.totalAmount.toFixed(2)}
                        </p>
                    </div>
                    {/* <Link href={`/orders/${order.id}`} legacyBehavior>
                      <a className="btn btn-secondary btn-sm mt-4 inline-flex items-center">View Details <InfoIcon className="ml-2 h-4 w-4" /></a>
                    </Link> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage;
