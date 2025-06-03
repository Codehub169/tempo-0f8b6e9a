import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/orders', label: 'My Orders' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" legacyBehavior>
          <a className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300">
            <Image 
              src="https://source.unsplash.com/800x600/?logo&sig=0" 
              alt="Platform Logo" 
              width={40} 
              height={40} 
              className="rounded-full object-cover"
            />
            <span className="text-2xl font-semibold font-secondary text-primary-dark tracking-tight">
              ShopSphere
            </span>
          </a>
        </Link>

        <nav className="hidden md:flex space-x-6 items-center">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} legacyBehavior>
              <a className="text-text-secondary hover:text-primary transition-colors duration-300 font-medium pb-1 border-b-2 border-transparent hover:border-primary">
                {link.label}
              </a>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/cart" legacyBehavior>
            <a className="relative text-text-secondary hover:text-primary transition-colors duration-300" aria-label="Shopping Cart">
              <ShoppingCart size={24} />
              {/* Example of cart item count badge, to be implemented with CartContext */}
              {/* <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span> */}
            </a>
          </Link>
          <Link href="/profile" legacyBehavior> 
            <a className="text-text-secondary hover:text-primary transition-colors duration-300" aria-label="User Profile">
              <User size={24} />
            </a>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-text-secondary hover:text-primary transition-colors duration-300"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-xl py-4 border-t border-border-light transition-all duration-300 ease-in-out transform origin-top animate-fadeInDown">
          <nav className="flex flex-col space-y-4 px-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} legacyBehavior>
                <a 
                  className="text-text-primary hover:bg-primary-light hover:text-primary-dark px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)} 
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;