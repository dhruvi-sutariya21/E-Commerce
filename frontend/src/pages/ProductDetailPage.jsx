import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, CheckCircle, XCircle, ShieldCheck, Truck, RefreshCw, Plus, Minus, ArrowLeft } from 'lucide-react';
import { productAPI } from '../services/product.api';
import { getImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductDetailSkeleton } from '../components/common/SkeletonLoader';
import ErrorAlert from '../components/common/ErrorAlert';
import { motion } from 'framer-motion';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productAPI.getProductById(id);
      setProduct(data);
    } catch (err) {
      setError(err.formattedMessage || 'Product not found or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  if (loading) return <ProductDetailSkeleton />;
  if (error || !product) return <ErrorAlert message={error || 'Product not found.'} onRetry={fetchProductDetails} />;

  const isSaved = isInWishlist(product.id);
  const inStock = product.stock > 0;

  const handleIncrement = () => {
    if (quantity < Math.min(product.stock, 10)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Back Link */}
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-[#E91E63] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Left: Product Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl p-4 border border-gray-100 card-shadow overflow-hidden relative"
        >
          <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50">
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Wishlist Button */}
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`absolute top-8 right-8 p-3 rounded-full shadow-lg transition ${
              isSaved
                ? 'bg-[#E91E63] text-white scale-110'
                : 'bg-white/90 backdrop-blur-md text-gray-700 hover:text-[#E91E63]'
            }`}
            aria-label="Add to Wishlist"
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </motion.div>

        {/* Right: Product Meta & Purchase Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Stock Status Badge - ONLY display red Out of Stock badge when stock === 0 */}
          {!inStock && (
            <div>
              <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
                <XCircle className="w-4 h-4 text-rose-600" /> Out of Stock
              </span>
            </div>
          )}

          {/* Title & Price */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif-luxury text-gray-900 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-extrabold font-serif-luxury text-[#E91E63]">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-400 font-medium">Inclusive of all taxes</span>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-b border-gray-100 py-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector */}
          {inStock && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="p-2 rounded-full hover:bg-white text-gray-700 disabled:opacity-40 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                    className="p-2 rounded-full hover:bg-white text-gray-700 disabled:opacity-40 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-400">Max 10 per order</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            {inStock ? (
              <button
                onClick={() => addToCart(product.id, quantity)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E91E63] hover:bg-[#D81B60] text-white text-sm font-bold rounded-full transition shadow-lg shadow-pink-200"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Shopping Bag
              </button>
            ) : (
              <button
                disabled
                className="flex-1 py-4 bg-gray-200 text-gray-400 text-sm font-bold rounded-full cursor-not-allowed"
              >
                Out of Stock
              </button>
            )}

            <button
              onClick={() => toggleWishlist(product.id)}
              className={`px-6 py-4 rounded-full text-xs font-bold transition flex items-center justify-center gap-2 border ${
                isSaved
                  ? 'bg-rose-50 text-[#E91E63] border-rose-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#E91E63] hover:text-[#E91E63]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#E91E63]' : ''}`} />
              {isSaved ? 'In Wishlist' : 'Save'}
            </button>
          </div>

          {/* Guarantees Strip */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-center">
            <div className="space-y-1">
              <Truck className="w-5 h-5 mx-auto text-[#E91E63]" />
              <span className="block text-[11px] font-bold text-gray-900">Express Delivery</span>
              <span className="block text-[10px] text-gray-500">2-4 Business Days</span>
            </div>
            <div className="space-y-1">
              <RefreshCw className="w-5 h-5 mx-auto text-[#E91E63]" />
              <span className="block text-[11px] font-bold text-gray-900">30-Day Returns</span>
              <span className="block text-[10px] text-gray-500">Easy Exchange</span>
            </div>
            <div className="space-y-1">
              <ShieldCheck className="w-5 h-5 mx-auto text-[#E91E63]" />
              <span className="block text-[11px] font-bold text-gray-900">100% Original</span>
              <span className="block text-[10px] text-gray-500">Certified Authentic</span>
            </div>
          </div>

        </motion.div>

      </div>
    </div>
  );
};

export default ProductDetailPage;
