import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/product.api';
import { getImageUrl } from '../services/api';
import EmptyState from '../components/common/EmptyState';
import { motion } from 'framer-motion';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, loading: cartLoading } = useCart();
  const [enrichedCart, setEnrichedCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Populate product details for every cart item from backend
  useEffect(() => {
    let isMounted = true;
    const loadProductsForCart = async () => {
      setLoading(true);
      if (!cartItems || cartItems.length === 0) {
        setEnrichedCart([]);
        setLoading(false);
        return;
      }

      try {
        const promises = cartItems.map(async (item) => {
          try {
            const product = await productAPI.getProductById(item.product_id);
            return { ...item, product };
          } catch (e) {
            return {
              ...item,
              product: {
                name: 'Product Details Unavailable',
                price: item.total_price / (item.quantity || 1),
                image: '',
                stock: 10,
              },
            };
          }
        });

        const results = await Promise.all(promises);
        if (isMounted) {
          setEnrichedCart(results);
        }
      } catch (err) {
        if (isMounted) setEnrichedCart([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProductsForCart();
    return () => {
      isMounted = false;
    };
  }, [cartItems]);

  const subtotal = enrichedCart.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const shippingCost = subtotal > 1999 || subtotal === 0 ? 0 : 150;
  const grandTotal = subtotal + shippingCost;

  if (!loading && enrichedCart.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your Bag is Empty"
        description="Explore our high fashion collection and add items to your shopping bag."
        actionText="Start Shopping"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-extrabold font-serif-luxury text-gray-900">
          Shopping Bag ({enrichedCart.length} {enrichedCart.length === 1 ? 'item' : 'items'})
        </h1>
      </div>

      {/* Cart Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-medium text-xs">Loading items from cart...</div>
          ) : (
            enrichedCart.map((item) => {
              const product = item.product || {};
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl p-5 border border-gray-100 card-shadow flex flex-col sm:flex-row items-center gap-5"
                >
                  {/* Product Image */}
                  <div className="w-24 h-28 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <h3 className="text-base font-bold text-gray-900 font-serif-luxury">
                      <Link to={`/product/${product.id}`} className="hover:text-[#E91E63] transition">
                        {product.name}
                      </Link>
                    </h3>
                    <div className="text-xs text-gray-500">
                      Unit Price: <span className="font-bold text-gray-900">₹{Number(product.price || 0).toLocaleString('en-IN')}</span>
                    </div>

                    {/* Quantity Controls & Delete */}
                    <div className="flex items-center justify-center sm:justify-start gap-4 pt-2">
                      <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded-full hover:bg-white text-gray-700 disabled:opacity-30 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (product.stock || 10)}
                          className="p-1 rounded-full hover:bg-white text-gray-700 disabled:opacity-30 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-gray-400 hover:text-rose-600 transition"
                        aria-label="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right sm:text-right shrink-0">
                    <span className="text-xs text-gray-400 block font-medium">Subtotal</span>
                    <span className="text-lg font-bold text-[#E91E63] font-serif-luxury">
                      ₹{Number((product.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Right: Summary Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 card-shadow space-y-6">
            <h3 className="text-lg font-bold font-serif-luxury text-gray-900 border-b border-gray-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Total</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Shipping</span>
                <span className="font-bold text-gray-900">
                  {shippingCost === 0 ? <span className="text-emerald-600">FREE</span> : `₹${shippingCost}`}
                </span>
              </div>
              {subtotal > 0 && subtotal <= 1999 && (
                <p className="text-[10px] text-pink-600 bg-pink-50 p-2 rounded-xl">
                  Add ₹{(2000 - subtotal).toLocaleString('en-IN')} more to unlock FREE Express Shipping!
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-900">Grand Total</span>
              <span className="text-2xl font-extrabold font-serif-luxury text-[#E91E63]">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-bold rounded-full transition shadow-lg shadow-pink-200 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Encrypted & Secure Checkout
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CartPage;
