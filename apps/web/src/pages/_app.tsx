import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import Layout from '../components/Layout'; // Assuming Layout component will be created
import { CartProvider } from '../contexts/CartContext'; // Assuming CartContext will be created

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider> {/* Provides cart state to the entire application */}
      <Head>
        <title>E-commerce Platform</title>
        <meta name="description" content="Modern E-commerce Platform for buying and selling products." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" /> {/* Placeholder, ensure favicon.ico exists in /public */}
      </Head>
      <Layout> {/* Wraps all pages with a consistent layout (header, footer, etc.) */}
        <Component {...pageProps} />
      </Layout>
    </CartProvider>
  );
}

export default MyApp;
