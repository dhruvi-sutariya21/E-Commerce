import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, CheckCircle, XCircle } from 'lucide-react';
import { getImageUrl } from '../../services/api';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!product) return null;

  const isSaved = isInWishlist(product.id);
  const inStock = product.stock > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 card-shadow card-shadow-hover flex flex-col justify-between relative"
    >
      {/* Top Image Section */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Stock Badge - ONLY display red Out of Stock badge when stock === 0 */}
        {!inStock && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 bg-rose-500 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-sm">
              <XCircle className="w-3 h-3" /> Out of Stock
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-full transition shadow-md ${
            isSaved
              ? 'bg-[#E91E63] text-white scale-110'
              : 'bg-white/90 backdrop-blur-md text-gray-700 hover:text-[#E91E63] hover:bg-white'
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
        </button>

        {/* Overlay Quick Actions */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
          <Link
            to={`/product/${product.id}`}
            className="p-3 bg-white text-gray-900 rounded-full hover:bg-[#E91E63] hover:text-white transition shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </Link>
          {inStock && (
            <button
              onClick={() => addToCart(product.id, 1)}
              className="p-3 bg-[#E91E63] text-white rounded-full hover:bg-[#D81B60] transition shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
              title="Add to Cart"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 group-hover:text-[#E91E63] transition line-clamp-1">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <span className="text-xs text-gray-400 font-medium block">Price</span>
            <span className="text-lg font-bold text-gray-900 font-serif-luxury">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/product/${product.id}`}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-full transition"
            >
              Details
            </Link>
            {inStock ? (
              <button
                onClick={() => addToCart(product.id, 1)}
                className="px-3 py-1.5 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-semibold rounded-full transition shadow-sm cursor-pointer"
              >
                Add Bag
              </button>
            ) : (
              <button
                disabled
                className="px-3 py-1.5 bg-gray-200 text-gray-400 text-xs font-semibold rounded-full cursor-not-allowed"
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
