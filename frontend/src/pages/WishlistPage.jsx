import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/product.api';
import { getImageUrl } from '../services/api';
import EmptyState from '../components/common/EmptyState';
import { motion } from 'framer-motion';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [enrichedWishlist, setEnrichedWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadWishlistProducts = async () => {
      setLoading(true);
      if (!wishlistItems || wishlistItems.length === 0) {
        setEnrichedWishlist([]);
        setLoading(false);
        return;
      }

      try {
        const promises = wishlistItems.map(async (item) => {
          try {
            const product = await productAPI.getProductById(item.product_id);
            return { ...item, product };
          } catch (e) {
            return { ...item, product: null };
          }
        });
        const results = await Promise.all(promises);
        if (isMounted) {
          setEnrichedWishlist(results.filter((res) => res.product !== null));
        }
      } catch (err) {
        if (isMounted) setEnrichedWishlist([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadWishlistProducts();
    return () => {
      isMounted = false;
    };
  }, [wishlistItems]);

  const handleAddToCartFromWishlist = async (productId) => {
    await addToCart(productId, 1);
  };

  if (!loading && enrichedWishlist.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your Wishlist is Empty"
        description="Save your favorite couture items here to purchase later."
        actionText="Explore Collections"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-extrabold font-serif-luxury text-gray-900">
          Saved Wishlist ({enrichedWishlist.length} {enrichedWishlist.length === 1 ? 'item' : 'items'})
        </h1>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-8 text-center text-gray-500 font-medium text-xs">Loading saved products...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrichedWishlist.map((item) => {
            const product = item.product;
            const inStock = product.stock > 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 card-shadow flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-600 hover:text-rose-600 transition shadow-sm"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 font-serif-luxury line-clamp-1">
                      <Link to={`/product/${product.id}`} className="hover:text-[#E91E63] transition">
                        {product.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                  </div>

                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 font-serif-luxury">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>

                    {inStock ? (
                      <button
                        onClick={() => handleAddToCartFromWishlist(product.id)}
                        className="px-4 py-2 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-semibold rounded-full transition shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
                      </button>
                    ) : (
                      <span className="text-xs text-rose-500 font-bold">Out of Stock</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default WishlistPage;
