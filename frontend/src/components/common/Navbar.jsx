import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, Shield, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-gray-100 transition-all">
      {/* Top Banner */}
      <div className="bg-[#E91E63] text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        ✨ ELEGANCE REDEFINED • COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER ₹1,999 • USE CODE: <span className="font-bold underline">AURA10</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-[#E91E63] transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-serif-luxury text-3xl font-extrabold tracking-widest text-gray-900 group-hover:text-[#E91E63] transition">
              AURA
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#E91E63]"></span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            {!location.pathname.startsWith('/admin') && (
              <>
                <Link
                  to="/"
                  className={`transition hover:text-[#E91E63] ${isActive('/') ? 'text-[#E91E63] font-semibold border-b-2 border-[#E91E63] pb-1' : 'text-gray-700'}`}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className={`transition hover:text-[#E91E63] ${isActive('/products') ? 'text-[#E91E63] font-semibold border-b-2 border-[#E91E63] pb-1' : 'text-gray-700'}`}
                >
                  Shop All
                </Link>
                <Link
                  to="/categories"
                  className={`transition hover:text-[#E91E63] ${isActive('/categories') ? 'text-[#E91E63] font-semibold border-b-2 border-[#E91E63] pb-1' : 'text-gray-700'}`}
                >
                  Categories
                </Link>
              </>
            )}
            {location.pathname.startsWith('/admin') && (
              <span className="text-[#E91E63] font-bold text-xs uppercase tracking-wider bg-pink-50 px-3.5 py-1.5 rounded-full flex items-center gap-1 border border-pink-100">
                <Shield className="w-3.5 h-3.5" /> Admin Portal
              </span>
            )}
          </nav>

          {/* Search Bar & Action Buttons */}
          <div className="flex items-center gap-4">
            
            {!location.pathname.startsWith('/admin') && (
              <>
                {/* Inline Search Bar */}
                <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative">
                  <input
                    type="text"
                    placeholder="Search fashion, kurtis, tops..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-56 pl-9 pr-4 py-1.5 text-xs bg-gray-100/80 rounded-full border border-transparent focus:border-[#E91E63] focus:bg-white focus:outline-none transition-all"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3" />
                </form>

                {/* Wishlist Icon */}
                <Link
                  to="/wishlist"
                  className="relative p-2 text-gray-700 hover:text-[#E91E63] transition rounded-full hover:bg-pink-50"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-1 right-1 bg-[#E91E63] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart Icon */}
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-700 hover:text-[#E91E63] transition rounded-full hover:bg-pink-50"
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 bg-[#E91E63] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* User Dropdown / Auth Link */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition border border-gray-200"
                >
                  <div className="w-7 h-7 rounded-full bg-[#E91E63] text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition"
                    >
                      <ShoppingBag className="w-4 h-4" /> My Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[#E91E63] font-semibold hover:bg-pink-50 transition"
                      >
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition border-t border-gray-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-semibold px-4 py-2 rounded-full transition shadow-md shadow-pink-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-100 rounded-full border border-transparent focus:border-[#E91E63] focus:bg-white focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </form>

          {!location.pathname.startsWith('/admin') && (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-800 hover:text-[#E91E63]"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-800 hover:text-[#E91E63]"
              >
                Shop All
              </Link>
              <Link
                to="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-800 hover:text-[#E91E63]"
              >
                Categories
              </Link>
            </>
          )}
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-800 hover:text-[#E91E63]"
              >
                My Profile
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-800 hover:text-[#E91E63]"
              >
                My Orders
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-bold text-[#E91E63]"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-semibold text-rose-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center bg-[#E91E63] text-white py-2 rounded-full font-semibold text-xs mt-2"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
