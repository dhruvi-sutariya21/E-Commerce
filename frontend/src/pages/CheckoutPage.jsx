import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, CreditCard, CheckCircle2, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/order.api';
import { paymentAPI } from '../services/payment.api';
import { productAPI } from '../services/product.api';
import { cartAPI } from '../services/cart.api';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const CheckoutPage = () => {
  const { cartItems, fetchCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('124 Luxury Avenue, Suite 402, Mumbai, Maharashtra 400001');
  const [paymentMethod, setPaymentMethod] = useState('Card'); // "COD", "UPI", "Card", "Net Banking"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [placedOrders, setPlacedOrders] = useState(null);

  const [cartProducts, setCartProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchCartDetails = async () => {
      if (!cartItems || cartItems.length === 0) return;
      try {
        const promises = cartItems.map(async (item) => {
          try {
            const p = await productAPI.getProductById(item.product_id);
            return { ...item, product: p };
          } catch (e) {
            return { ...item, product: { price: item.total_price / (item.quantity || 1), name: 'Apparel Item' } };
          }
        });
        const results = await Promise.all(promises);
        if (isMounted) setCartProducts(results);
      } catch (err) {
        if (isMounted) setCartProducts([]);
      }
    };
    fetchCartDetails();
    return () => {
      isMounted = false;
    };
  }, [cartItems]);

  const subtotal = cartProducts.reduce((acc, item) => acc + (item.product?.price || 0) * (item.quantity || 1), 0);
  const shippingCost = subtotal > 1999 || subtotal === 0 ? 0 : 150;
  const grandTotal = subtotal + shippingCost;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (shippingAddress.trim().length < 10) {
      setError('Please enter a valid shipping address (at least 10 characters).');
      setLoading(false);
      return;
    }

    try {
      const createdOrders = [];
      const paymentResults = [];

      // Create orders for each item in cart
      for (const item of cartItems) {
        const orderRes = await orderAPI.placeOrder({
          user_id: user?.id || '',
          product_id: item.product_id,
          quantity: item.quantity || 1,
          shipping_address: shippingAddress.trim(),
          payment_method: paymentMethod,
        });

        createdOrders.push(orderRes);

        // Immediately create payment record for the order
        try {
          const payRes = await paymentAPI.createPayment({
            order_id: orderRes.id,
            payment_method: paymentMethod,
            amount: orderRes.total_price,
          });
          paymentResults.push(payRes);
        } catch (payErr) {
          console.warn('Payment record notice:', payErr);
        }

        // Clean up cart item from frontend/backend
        try {
          await cartAPI.deleteCartItem(item.id);
        } catch (cartErr) {
          // May already be deleted by backend place_order
        }
      }

      showSuccess('Order placed and payment initiated successfully!');
      await fetchCart(); // Refresh cart to clear
      setPlacedOrders({
        orders: createdOrders,
        payments: paymentResults,
        address: shippingAddress,
        method: paymentMethod,
        total: grandTotal,
      });
    } catch (err) {
      setError(err.formattedMessage || 'Failed to complete checkout. Please check product stock or pending order status.');
      showError(err.formattedMessage || 'Failed to complete checkout.');
    } finally {
      setLoading(false);
    }
  };

  // Render Order Success Screen
  if (placedOrders) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Order Confirmed</span>
          <h1 className="text-3xl font-extrabold font-serif-luxury text-gray-900">
            Thank You For Your Order!
          </h1>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Your couture order has been placed on the backend system. Track your order status in your account.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 card-shadow text-left space-y-4 text-xs">
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-500 font-medium">Orders Placed</span>
            <span className="font-bold text-gray-900">{placedOrders.orders.length} Item(s)</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-500 font-medium">Payment Method</span>
            <span className="font-bold text-gray-900">{placedOrders.method}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-500 font-medium">Shipping Address</span>
            <span className="font-bold text-gray-900 max-w-xs text-right">{placedOrders.address}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-sm font-bold text-gray-900">Total Charged</span>
            <span className="text-lg font-bold text-[#E91E63] font-serif-luxury">
              ₹{placedOrders.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/orders"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-bold rounded-full transition shadow-md shadow-pink-200"
          >
            Track My Orders
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-full transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-extrabold font-serif-luxury text-gray-900">Checkout</h1>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Address & Payment Method Form */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 card-shadow space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <MapPin className="w-5 h-5 text-[#E91E63]" />
              <h2 className="text-lg font-bold font-serif-luxury text-gray-900">Shipping Delivery Address</h2>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Full Street Address & Landmark</label>
              <textarea
                rows={3}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                minLength={10}
                maxLength={200}
                placeholder="Enter house no, street name, city, state, and pincode..."
                className="w-full p-4 bg-gray-50 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition"
              />
              <p className="text-[10px] text-gray-400">Address must be between 10 and 200 characters.</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 card-shadow space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <CreditCard className="w-5 h-5 text-[#E91E63]" />
              <h2 className="text-lg font-bold font-serif-luxury text-gray-900">Payment Gateway Selection</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Card', 'UPI', 'COD', 'Net Banking'].map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'border-[#E91E63] bg-pink-50/60 text-[#E91E63] font-bold shadow-sm'
                        : 'border-gray-200 hover:border-pink-200 text-gray-700 font-medium'
                    }`}
                  >
                    <span className="text-xs">{method === 'COD' ? 'Cash on Delivery (COD)' : `${method} Payment`}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#E91E63] bg-[#E91E63]' : 'border-gray-300'}`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right: Order Summary & Place Order Button */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 card-shadow space-y-6">
            <h3 className="text-lg font-bold font-serif-luxury text-gray-900 border-b border-gray-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items ({cartItems.length})</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-extrabold font-serif-luxury text-[#E91E63]">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className="w-full py-4 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-bold rounded-full transition shadow-lg shadow-pink-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Processing Order...' : 'Complete Purchase'} <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Authorized FastAPI Backend Checkout
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};

export default CheckoutPage;
