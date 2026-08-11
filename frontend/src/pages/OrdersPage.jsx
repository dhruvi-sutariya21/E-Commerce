import React, { useEffect, useState } from 'react';
import { Package, Clock, Truck, CheckCircle2, XCircle, MapPin, RefreshCw, Eye } from 'lucide-react';
import { orderAPI } from '../services/order.api';
import { productAPI } from '../services/product.api';
import { getImageUrl } from '../services/api';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/common/EmptyState';
import ErrorAlert from '../components/common/ErrorAlert';
import { motion } from 'framer-motion';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingModal, setTrackingModal] = useState(null);

  const { showSuccess, showError } = useToast();

  const fetchUserOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderAPI.getMyOrders();
      if (Array.isArray(data) && data.length > 0) {
        const enriched = await Promise.all(
          data.map(async (order) => {
            try {
              const product = await productAPI.getProductById(order.product_id);
              return { ...order, product };
            } catch (e) {
              return { ...order, product: { name: 'Purchased Item', image: '' } };
            }
          })
        );
        setOrders(enriched);
      } else {
        setOrders([]);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setOrders([]);
      } else {
        setError(err.formattedMessage || 'Failed to fetch orders.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatOrderDate = (dateVal) => {
    try {
      if (!dateVal || dateVal === 'null' || dateVal === 'undefined') {
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }

      const str = String(dateVal).trim();
      if (!str) {
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }

      const datePart = str.split('T')[0].split(' ')[0];
      if (datePart.includes('-')) {
        const parts = datePart.split('-');
        if (parts.length === 3) {
          const [yyyy, mm, dd] = parts;
          if (yyyy.length === 4) {
            return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`;
          }
        }
      }

      if (datePart.includes('/')) {
        const parts = datePart.split('/');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
          }
          return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
        }
      }

      const normalizedStr = str.includes(' ') ? str.replace(' ', 'T') : str;
      const parsedDate = new Date(normalizedStr);
      if (!isNaN(parsedDate.getTime())) {
        const day = String(parsedDate.getDate()).padStart(2, '0');
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const year = parsedDate.getFullYear();
        return `${day}/${month}/${year}`;
      }

      const d = new Date();
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      const d = new Date();
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderAPI.cancelOrder(orderId);
      showSuccess('Order cancelled successfully.');
      fetchUserOrders();
    } catch (err) {
      showError(err.formattedMessage || 'Failed to cancel order.');
    }
  };

  const handleTrackOrder = async (orderId) => {
    try {
      const res = await orderAPI.trackOrder(orderId);
      setTrackingModal(res);
    } catch (err) {
      showError(err.formattedMessage || 'Failed to track order status.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">Pending Confirmation</span>;
      case 'Confirmed':
        return <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">Order Confirmed</span>;
      case 'Shipped':
      case 'Out For Delivery':
        return <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">In Transit / Shipped</span>;
      case 'Delivered':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">Delivered</span>;
      case 'Cancelled':
        return <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-bold rounded-full border border-gray-200">{status}</span>;
    }
  };

  if (error) return <ErrorAlert message={error} onRetry={fetchUserOrders} />;

  if (!loading && orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No Orders Found"
        description="You haven’t placed any orders yet. Start exploring our luxury collections!"
        actionText="Shop Now"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif-luxury text-gray-900">My Orders History</h1>
          <p className="text-xs text-gray-500">Track and manage your order deliveries.</p>
        </div>
        <button
          onClick={fetchUserOrders}
          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition text-xs font-semibold flex items-center gap-1.5 px-3"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="p-8 text-center text-gray-500 font-medium text-xs">Loading orders from server...</div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const product = order.product || {};
            const isCancellable = order.order_status !== 'Cancelled' && order.order_status !== 'Delivered';

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 border border-gray-100 card-shadow space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[11px] font-mono text-gray-400">Order ID: {order.id}</span>
                      {formatOrderDate(order.created_at || order.order_date || order.createdAt || order.date) !== 'N/A' && (
                        <span className="text-[11px] text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                          {formatOrderDate(order.created_at || order.order_date || order.createdAt || order.date)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Payment Method: <span className="font-bold text-gray-900">{order.payment_method}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.order_status)}
                    <span className="text-lg font-bold font-serif-luxury text-[#E91E63]">
                      ₹{Number(order.total_price).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Product Detail Row */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-24 rounded-2xl bg-gray-50 overflow-hidden shrink-0">
                    <img
                      src={getImageUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <h3 className="text-base font-bold font-serif-luxury text-gray-900">{product.name}</h3>
                    <p className="text-xs text-gray-500">Quantity Ordered: <span className="font-bold text-gray-900">{order.quantity}</span></p>
                    <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {order.shipping_address}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleTrackOrder(order.id)}
                      className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-[#E91E63] text-xs font-bold rounded-full transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Track Status
                    </button>

                    {isCancellable && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-full transition"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* Track Status Modal */}
      {trackingModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-serif-luxury text-gray-900">Live Order Tracking</h3>
            <div className="p-4 bg-pink-50 rounded-2xl space-y-2 text-xs">
              <div><span className="text-gray-500">Order ID:</span> <span className="font-mono font-bold text-gray-900">{trackingModal.order_id}</span></div>
              <div><span className="text-gray-500">Current Status:</span> {getStatusBadge(trackingModal.status)}</div>
            </div>
            <button
              onClick={() => setTrackingModal(null)}
              className="w-full py-2.5 bg-[#E91E63] text-white text-xs font-bold rounded-full"
            >
              Close Tracker
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrdersPage;
