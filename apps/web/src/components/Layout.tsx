import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children,
  title = 'E-commerce Platform',
  description = 'Your one-stop shop for everything!' 
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Ensure favicon.ico exists in /public folder */}
        <link rel="icon" href="/favicon.ico" /> 
      </Head>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background-light to-background-main text-text-primary font-primary">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
