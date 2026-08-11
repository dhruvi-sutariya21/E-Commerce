import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShoppingBag, ShieldCheck, Heart, Star } from 'lucide-react';
import { productAPI } from '../services/product.api';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/common/SkeletonLoader';
import ErrorAlert from '../components/common/ErrorAlert';
import { motion } from 'framer-motion';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHomeProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productAPI.getAllProducts();
      setProducts(data || []);
    } catch (err) {
      setError(err.formattedMessage || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeProducts();
  }, []);

  const trendingProducts = products.slice(0, 3);
  const newArrivals = products.slice(0, 4);

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-pink-50 via-white to-rose-50 rounded-b-3xl border-b border-pink-100/60 pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100 text-[#E91E63] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> New Season 2026 Collection
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif-luxury text-gray-900 leading-tight">
              Grace in Every <span className="text-[#E91E63] italic">Stitch</span> & Couture
            </h1>

            <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
              Elevate your personal aesthetic with AURA’s exclusive handcrafted women’s couture. Featuring timeless printed tops, tailored denim, and opulent traditional attire.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E91E63] hover:bg-[#D81B60] text-white font-semibold text-sm rounded-full transition-all shadow-lg shadow-pink-200 hover:shadow-pink-300"
              >
                Shop Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/categories"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-sm rounded-full border border-gray-200 transition"
              >
                Browse Categories
              </Link>
            </div>

            {/* Social Proof */}
            <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 border-t border-pink-200/50">
              <div>
                <span className="block text-2xl font-bold text-gray-900 font-serif-luxury">100%</span>
                <span className="text-xs text-gray-500">Real Backend Data</span>
              </div>
              <div className="h-8 w-px bg-pink-200"></div>
              <div>
                <span className="block text-2xl font-bold text-gray-900 font-serif-luxury">Premium</span>
                <span className="text-xs text-gray-500">Women’s Couture</span>
              </div>
              <div className="h-8 w-px bg-pink-200"></div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-sm font-bold text-gray-900">4.9 / 5</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Image Collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80"
                alt="Women's High Fashion Couture"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                <span className="text-[10px] font-bold uppercase tracking-widest text-pink-200">Bestseller Spotlight</span>
                <h3 className="text-lg font-bold font-serif-luxury">Handcrafted Luxury Kurtis & Tops</h3>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Featured Categories Banner Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-xs font-bold text-[#E91E63] uppercase tracking-widest">Curated Styles</span>
          <h2 className="text-3xl font-extrabold font-serif-luxury text-gray-900">Featured Categories</h2>
          <p className="text-xs text-gray-500">Explore signature womenswear categories from our catalog.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <Link
            to="/categories"
            className="group relative h-80 rounded-3xl overflow-hidden shadow-md card-shadow-hover block"
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80"
              alt="Designer Tops"
              className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white space-y-1">
              <span className="text-xs font-semibold text-pink-300 uppercase">Category</span>
              <h3 className="text-2xl font-bold font-serif-luxury">Tops & Blouses</h3>
              <span className="inline-flex items-center text-xs font-medium text-white group-hover:text-[#FFB6C1] transition gap-1 pt-1">
                Explore Products <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          <Link
            to="/categories"
            className="group relative h-80 rounded-3xl overflow-hidden shadow-md card-shadow-hover block"
          >
            <img
              src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80"
              alt="Denim & Jeans"
              className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white space-y-1">
              <span className="text-xs font-semibold text-pink-300 uppercase">Category</span>
              <h3 className="text-2xl font-bold font-serif-luxury">Jeans & Cargo</h3>
              <span className="inline-flex items-center text-xs font-medium text-white group-hover:text-[#FFB6C1] transition gap-1 pt-1">
                Explore Products <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          <Link
            to="/categories"
            className="group relative h-80 rounded-3xl overflow-hidden shadow-md card-shadow-hover block"
          >
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"
              alt="Traditional Kurtis"
              className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white space-y-1">
              <span className="text-xs font-semibold text-pink-300 uppercase">Category</span>
              <h3 className="text-2xl font-bold font-serif-luxury">Kurtis & Ethnic</h3>
              <span className="inline-flex items-center text-xs font-medium text-white group-hover:text-[#FFB6C1] transition gap-1 pt-1">
                Explore Products <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

        </div>
      </section>

      {/* Trending & Bestsellers Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <span className="text-xs font-bold text-[#E91E63] uppercase tracking-widest">Real Backend Catalog</span>
            <h2 className="text-3xl font-extrabold font-serif-luxury text-gray-900">Trending Arrivals</h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-[#E91E63] hover:underline inline-flex items-center gap-1"
          >
            View All Products ({products.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {error ? (
          <ErrorAlert message={error} onRetry={fetchHomeProducts} />
        ) : loading ? (
          <ProductGridSkeleton count={4} />
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No products found in backend database.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#E91E63] via-[#D81B60] to-purple-900 text-white p-8 sm:p-12 shadow-xl">
          <div className="max-w-xl space-y-4 relative z-10">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-pink-100">
              Limited Festive Edit
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif-luxury leading-tight">
              Enjoy 20% Off Your First Couture Purchase
            </h2>
            <p className="text-xs sm:text-sm text-pink-100 leading-relaxed font-light">
              Experience luxurious comfort with our handcrafted pure silk and cotton apparel. Hand-picked for the modern woman.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#E91E63] font-bold text-xs rounded-full hover:bg-pink-50 transition shadow-lg"
              >
                Claim Offer Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
