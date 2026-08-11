import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Heart, ShieldCheck, Truck, RefreshCw, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { showSuccess } = useToast();
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email.trim()) {
      showSuccess('Thank you for subscribing to AURA VIP Privileges!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100 text-gray-700 text-xs font-sans mt-20">
      {/* Brand Perks Strip */}
      <div className="bg-[#FFF0F3] border-b border-pink-100 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-full text-[#E91E63] shadow-sm">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">Express Worldwide Delivery</h4>
            <p className="text-gray-500 max-w-xs">Fast & secured shipping directly to your doorstep.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-full text-[#E91E63] shadow-sm">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">Hassle-Free Returns</h4>
            <p className="text-gray-500 max-w-xs">30-day effortless return and exchanges guarantee.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-full text-[#E91E63] shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">100% Authentic Quality</h4>
            <p className="text-gray-500 max-w-xs">Curated handcrafted fabrics and premium stitching.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-white rounded-full text-[#E91E63] shadow-sm">
              <Heart className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">Customer Care</h4>
            <p className="text-gray-500 max-w-xs">Dedicated 24/7 personal fashion styling assistance.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
        
        {/* Brand Bio */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="font-serif-luxury text-3xl font-extrabold tracking-widest text-gray-900">
              AURA
            </span>
            <span className="h-2 w-2 rounded-full bg-[#E91E63]"></span>
          </Link>
          <p className="text-gray-500 leading-relaxed text-xs pr-6">
            AURA brings timeless elegance and modern sophistication to women's couture. From contemporary printed tops to signature wide-leg denim and designer traditional kurtis, elevate your everyday style effortlessly.
          </p>
          <div className="pt-2 text-xs text-gray-400 font-medium">
            © {new Date().getFullYear()} AURA Luxury Fashion Inc. All rights reserved.
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h5 className="font-bold text-gray-900 text-sm tracking-wide uppercase">Quick Links</h5>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-[#E91E63] transition">Home</Link></li>
            <li><Link to="/products" className="hover:text-[#E91E63] transition">Shop All Products</Link></li>
            <li><Link to="/categories" className="hover:text-[#E91E63] transition">Collections</Link></li>
            <li><Link to="/wishlist" className="hover:text-[#E91E63] transition">Wishlist</Link></li>
            <li><Link to="/cart" className="hover:text-[#E91E63] transition">Shopping Bag</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="space-y-3">
          <h5 className="font-bold text-gray-900 text-sm tracking-wide uppercase">Customer Care</h5>
          <ul className="space-y-2">
            <li><Link to="/orders" className="hover:text-[#E91E63] transition">Track Orders</Link></li>
            <li><Link to="/profile" className="hover:text-[#E91E63] transition">My Account</Link></li>
            <li><span className="text-gray-400 hover:text-gray-600 cursor-pointer">Shipping & Handling</span></li>
            <li><span className="text-gray-400 hover:text-gray-600 cursor-pointer">Terms & Conditions</span></li>
            <li><span className="text-gray-400 hover:text-gray-600 cursor-pointer">Privacy Policy</span></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h5 className="font-bold text-gray-900 text-sm tracking-wide uppercase">Join AURA Club</h5>
          <p className="text-gray-500 text-xs">
            Subscribe to receive private sale invites, new arrival previews, and fashion trends.
          </p>
          <form onSubmit={handleNewsletter} className="flex items-center gap-2 pt-1">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs focus:border-[#E91E63] focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="p-2 bg-[#E91E63] hover:bg-[#D81B60] text-white rounded-full transition shrink-0"
              aria-label="Subscribe to newsletter"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
