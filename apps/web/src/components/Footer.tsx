import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
  ];

  return (
    <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-background-light py-12 border-t-2 border-primary-dark/50 shadow-inner-top">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h5 className="text-xl font-semibold font-secondary text-white mb-4">ShopSphere</h5>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your premier destination for quality products and seamless shopping. Discover a world of convenience and style.
            </p>
          </div>

          <div>
            <h5 className="text-lg font-semibold text-white mb-4">Quick Links</h5>
            <ul className="space-y-2">
              <li><Link href="/about" legacyBehavior><a className="text-gray-400 hover:text-primary transition-colors duration-300">About Us</a></Link></li>
              <li><Link href="/contact" legacyBehavior><a className="text-gray-400 hover:text-primary transition-colors duration-300">Contact</a></Link></li>
              <li><Link href="/faq" legacyBehavior><a className="text-gray-400 hover:text-primary transition-colors duration-300">FAQ</a></Link></li>
              <li><Link href="/terms" legacyBehavior><a className="text-gray-400 hover:text-primary transition-colors duration-300">Terms of Service</a></Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-lg font-semibold text-white mb-4">Connect With Us</h5>
            <p className="text-gray-400 mb-4 text-sm">support@shopsphere.com</p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.name} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="text-gray-400 hover:text-primary transition-transform duration-300 transform hover:scale-110"
                >
                  <social.icon size={24} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center border-t border-gray-700 pt-8">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} ShopSphere. All Rights Reserved. Designed with 
            <span role="img" aria-label="love" className="text-red-500 mx-1">
              ❤️
            </span> 
            by The Architects.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;