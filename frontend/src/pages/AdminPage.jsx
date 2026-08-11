import React, { useState, useEffect } from 'react';
import {
  Package,
  Layers,
  ShoppingBag,
  CreditCard,
  Users,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  UploadCloud,
  ArrowUpRight,
  TrendingUp,
  IndianRupee,
  ShieldCheck,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  XCircle,
  FolderPlus,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { categoryAPI } from '../services/category.api';
import { productAPI } from '../services/product.api';
import { orderAPI } from '../services/order.api';
import { paymentAPI } from '../services/payment.api';
import { authAPI } from '../services/auth.api';
import { getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

// Known initial categories from backend
const INITIAL_CATEGORIES = [
  { id: '3e75a811-8eba-4a41-baa5-aeb308d98b7c', c_name: 'Tops', description: 'Trendy tops available in different styles, colors, and fabrics.' },
  { id: 'adda531f-a87e-45b4-9939-610b48c5e605', c_name: 'Jeans', description: 'Comfortable and fashionable jeans for everyday wear.' },
  { id: '3fa65a21-0f19-44de-a4d6-f545efa722aa', c_name: 'Kurtis', description: 'Traditional and modern kurtis suitable for daily and festive wear.' },
];

const AdminPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // Navigation Pill Tabs: 'products', 'categories', 'orders', 'payments', 'users'
  const [activeTab, setActiveTab] = useState('products');

  // Data states
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lookup maps for O(1) order row enrichment without per-row API calls
  const productMap = React.useMemo(() => {
    return Object.fromEntries((products || []).map((p) => [p.id, p]));
  }, [products]);

  const userMap = React.useMemo(() => {
    return Object.fromEntries((users || []).map((u) => [u.id, u]));
  }, [users]);

  // Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Product Form
  const [prodCatId, setProdCatId] = useState(INITIAL_CATEGORIES[0].id);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImageFile, setProdImageFile] = useState(null);
  const [prodImagePreview, setProdImagePreview] = useState(null);

  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [productApiNotice, setProductApiNotice] = useState('');

  // Fetch all backend data at once
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [prodsRes, catsRes, ordersRes, paymentsRes, usersRes] = await Promise.allSettled([
        productAPI.getAllProducts(),
        categoryAPI.getAllCategories(),
        orderAPI.getAllOrders(),
        paymentAPI.getAllPayments(),
        authAPI.getAllUsers(),
      ]);

      if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value)) {
        setProducts(prodsRes.value);
      }

      if (catsRes.status === 'fulfilled' && Array.isArray(catsRes.value) && catsRes.value.length > 0) {
        const catMap = new Map();
        INITIAL_CATEGORIES.forEach((c) => catMap.set(c.id, c));
        catsRes.value.forEach((c) => {
          if (c && (c.id || c.c_name)) {
            const key = c.id || c.c_name;
            catMap.set(key, {
              id: c.id || key,
              c_name: c.c_name || c.name,
              description: c.description || 'Apparel Category',
            });
          }
        });
        setCategories(Array.from(catMap.values()));
      }

      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value || []);
      if (paymentsRes.status === 'fulfilled') setPayments(paymentsRes.value || []);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value?.users || (Array.isArray(usersRes.value) ? usersRes.value : []));
    } catch (err) {
      console.warn('Dashboard data refresh notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle local image file selection with preview
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProdImageFile(file);
      setProdImagePreview(URL.createObjectURL(file));
    }
  };

  // Create Category Handler (Admin)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const inputName = newCatName.trim();
    if (!inputName) {
      showError('Category name is required.');
      return;
    }

    try {
      const addedCategory = await categoryAPI.addCategory({
        c_name: inputName,
        description: newCatDesc.trim(),
      });
      showSuccess('New Category added successfully via Admin API!');
      
      const newCatObj = {
        id: addedCategory.id || Date.now().toString(),
        c_name: addedCategory.c_name || inputName,
        description: addedCategory.description || newCatDesc.trim(),
      };
      
      setCategories((prev) => {
        const exists = prev.some((c) => c.c_name.toLowerCase() === inputName.toLowerCase());
        return exists ? prev : [...prev, newCatObj];
      });
      setProdCatId(newCatObj.id);
      setNewCatName('');
      setNewCatDesc('');
    } catch (err) {
      showError(err.formattedMessage || 'Failed to add category.');
    }
  };

  // Delete Category Handler
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryAPI.deleteCategory(id);
      showSuccess('Category deleted successfully.');
      loadAllData();
    } catch (err) {
      showError(err.formattedMessage || 'Cannot delete category containing active products.');
    }
  };

  // Create Product Handler (FormData)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!prodImageFile) {
      showError('Please select a product image file.');
      return;
    }

    const formData = new FormData();
    formData.append('category_id', prodCatId);
    formData.append('name', prodName.trim());
    formData.append('price', parseInt(prodPrice, 10));
    formData.append('stock', parseInt(prodStock, 10));
    formData.append('description', prodDesc.trim());
    formData.append('image', prodImageFile);

    try {
      await productAPI.addProduct(formData);
      showSuccess('Product added successfully to catalog!');
      setProdName('');
      setProdPrice('');
      setProdStock('');
      setProdDesc('');
      setProdImageFile(null);
      setProdImagePreview(null);
      loadAllData();
    } catch (err) {
      showError(err.formattedMessage || 'Failed to add product.');
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productAPI.deleteProduct(id);
      showSuccess('Product deleted successfully.');
      loadAllData();
    } catch (err) {
      showError(err.formattedMessage || 'Failed to delete product.');
    }
  };

  // Update Stock Handler
  const handleUpdateStock = async (id, currentStock) => {
    const val = prompt('Enter updated stock quantity:', currentStock);
    if (val !== null && !isNaN(val)) {
      try {
        await productAPI.updateStock(id, parseInt(val, 10));
        showSuccess('Product stock updated!');
        loadAllData();
      } catch (err) {
        showError(err.formattedMessage || 'Failed to update stock.');
      }
    }
  };

  // Format Order Date cleanly as DD/MM/YYYY with fallback
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

  // Update Order Status Handler
  const handleUpdateOrderStatus = async (id, newStatus) => {
    if (!newStatus) return;
    try {
      await orderAPI.updateOrderStatus(id, newStatus);
      showSuccess(`Order status updated to "${newStatus}"!`);
      loadAllData();
    } catch (err) {
      if (err.response?.status === 401) {
        showError('Session expired or Invalid token. Please logout and login again as Admin.');
      } else {
        showError(err.formattedMessage || 'Failed to update order status.');
      }
    }
  };

  // Verify Payment Handler
  const handleVerifyPayment = async (id) => {
    try {
      await paymentAPI.verifyPayment(id);
      showSuccess('Payment verified successfully!');
      loadAllData();
    } catch (err) {
      showError(err.formattedMessage || 'Failed to verify payment.');
    }
  };

  // Delete User Handler (Admin)
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name || 'User'}"? This will permanently remove their account.`)) return;
    try {
      await authAPI.deleteUser(id);
      showSuccess(`User "${name || 'User'}" deleted successfully!`);
      loadAllData();
    } catch (err) {
      showError(err.formattedMessage || err.response?.data?.detail || 'Failed to delete user.');
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.c_name : 'Tops';
  };

  // Calculations for Summary Statistics
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0) || orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const codPayments = payments.filter((p) => p.payment_method?.toLowerCase() === 'cod');
  const onlinePayments = payments.filter((p) => p.payment_method?.toLowerCase() !== 'cod');
  const pendingPayments = payments.filter((p) => p.payment_status?.toLowerCase() !== 'success');

  // Count products per category
  const getCategoryProductCount = (catId) => {
    return products.filter((p) => p.category_id === catId).length;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Title & Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E91E63] animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E91E63]">Store Management</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shopify-Style Admin Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">Real-time inventory, orders & revenue analytics</p>
          </div>

          <button
            onClick={loadAllData}
            disabled={loading}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Catalog
          </button>
        </div>

        {/* 1. TOP STATISTICS CARDS (5 Cards Row with hover animations) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          
          {/* Stat 1: Total Products */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E91E63] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">{products.length}</span>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Active inventory items</p>
            </div>
            <div className="h-1 w-full bg-pink-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#E91E63] rounded-full" style={{ width: `${Math.min(products.length * 20, 100)}%` }}></div>
            </div>
          </motion.div>

          {/* Stat 2: Categories */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">{categories.length}</span>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Store collections</p>
            </div>
            <div className="h-1 w-full bg-purple-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: `${Math.min(categories.length * 25, 100)}%` }}></div>
            </div>
          </motion.div>

          {/* Stat 3: Orders */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orders</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">{orders.length}</span>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Total customer orders</p>
            </div>
            <div className="h-1 w-full bg-amber-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full" style={{ width: `${Math.min(orders.length * 20, 100)}%` }}></div>
            </div>
          </motion.div>

          {/* Stat 4: Revenue */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">₹{totalRevenue.toLocaleString()}</span>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Gross earnings</p>
            </div>
            <div className="h-1 w-full bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </motion.div>

          {/* Stat 5: Customers */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customers</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">{users.length}</span>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Registered users</p>
            </div>
            <div className="h-1 w-full bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(users.length * 20, 100)}%` }}></div>
            </div>
          </motion.div>

        </div>

        {/* 2. NAVIGATION PILL TABS */}
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2 overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#E91E63] text-white shadow-md shadow-pink-200'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" /> Products ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-[#E91E63] text-white shadow-md shadow-pink-200'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" /> Categories ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#E91E63] text-white shadow-md shadow-pink-200'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-[#E91E63] text-white shadow-md shadow-pink-200'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Payments ({payments.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#E91E63] text-white shadow-md shadow-pink-200'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Users ({users.length})
          </button>

        </div>

        {/* 3. TAB CONTENT VIEWS */}
        <AnimatePresence mode="wait">

          {/* ===================== TAB 1: PRODUCT MANAGEMENT ===================== */}
          {activeTab === 'products' && (
            <motion.div
              key="products-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* SPLIT SECTION: LEFT SIDE (Form) & RIGHT SIDE (Image Preview) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT SIDE: Product Form Card (7 Cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#E91E63]" /> Product Details & Catalog Add
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">FastAPI Backend Upload</span>
                  </div>

                  <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Category</label>
                        <select
                          value={prodCatId}
                          onChange={(e) => setProdCatId(e.target.value)}
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition font-medium"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.c_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Product Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Designer Silk Kurti"
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                          required
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Price (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 1999"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          required
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition font-medium"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Stock Quantity</label>
                        <input
                          type="number"
                          placeholder="e.g. 50"
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                          required
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Product Description</label>
                      <textarea
                        rows={3}
                        placeholder="At least 10 characters description of material, fit and style..."
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        required
                        className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition font-medium"
                      />
                    </div>

                    {/* Drag & Drop Upload Box */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Upload Product Image (.jpg, .jpeg, .png)</label>
                      <div className="relative border-2 border-dashed border-pink-200 bg-pink-50/20 hover:bg-pink-50/60 rounded-2xl p-6 text-center transition cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          required
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="space-y-1.5 pointer-events-none">
                          <UploadCloud className="w-8 h-8 text-[#E91E63] mx-auto" />
                          <p className="text-xs font-bold text-slate-800">
                            <span className="text-[#E91E63]">Choose file</span> or drag & drop image
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {prodImageFile ? prodImageFile.name : 'PNG, JPG or JPEG up to 5MB'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-bold rounded-xl transition shadow-md shadow-pink-200 active:scale-98 cursor-pointer"
                      >
                        Add Product
                      </button>
                    </div>

                  </form>
                </div>

                {/* RIGHT SIDE: Image Preview Card (5 Cols) */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4 lg:sticky lg:top-24">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#E91E63]" /> Live Image Preview
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Card View</span>
                  </div>

                  {prodImagePreview ? (
                    <div className="space-y-3">
                      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                        <img
                          src={prodImagePreview}
                          alt="Uploaded Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          Ready to Upload
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl space-y-1">
                        <h4 className="font-bold text-slate-900 text-xs truncate">{prodName || 'Product Title'}</h4>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">{getCategoryName(prodCatId)}</span>
                          <span className="font-extrabold text-[#E91E63]">₹{prodPrice || '0'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-600">No Image Selected</p>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        Select an image file in the left form to see real-time card preview before saving to backend catalog.
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* PRODUCT TABLE SECTION */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Product Inventory Table</h3>
                    <p className="text-xs text-slate-400">Showing {products.length} products stored in SQLite Database</p>
                  </div>
                  <span className="text-xs font-bold text-[#E91E63] bg-pink-50 px-3 py-1 rounded-full self-start sm:self-auto">
                    Live Records
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">Image</th>
                        <th className="py-3 px-2">Product Name</th>
                        <th className="py-3 px-2">Category</th>
                        <th className="py-3 px-2">Price</th>
                        <th className="py-3 px-2">Stock</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((prod) => {
                        // Colored Status Badges: Green = In Stock, Orange = Low Stock, Red = Out of Stock
                        let statusBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> In Stock
                          </span>
                        );
                        if (prod.stock <= 0) {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3" /> Out of Stock
                            </span>
                          );
                        } else if (prod.stock <= 10) {
                          statusBadge = (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          );
                        }

                        return (
                          <tr key={prod.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-2">
                              <img
                                src={getImageUrl(prod.image)}
                                alt=""
                                className="w-12 h-12 object-cover rounded-xl border border-slate-100 bg-slate-50"
                              />
                            </td>
                            <td className="py-3 px-2 font-bold text-slate-900 max-w-xs truncate">{prod.name}</td>
                            <td className="py-3 px-2 text-slate-500 font-medium">{getCategoryName(prod.category_id)}</td>
                            <td className="py-3 px-2 font-extrabold text-[#E91E63]">₹{prod.price}</td>
                            <td className="py-3 px-2 font-bold text-slate-800">{prod.stock}</td>
                            <td className="py-3 px-2">{statusBadge}</td>
                            <td className="py-3 px-2 text-right space-x-1">
                              <button
                                onClick={() => handleUpdateStock(prod.id, prod.stock)}
                                className="p-2 text-slate-600 hover:text-[#E91E63] hover:bg-pink-50 rounded-xl transition inline-flex items-center gap-1 font-bold text-[11px]"
                                title="Update Stock"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

            </motion.div>
          )}

          {/* ===================== TAB 2: CATEGORY MANAGEMENT ===================== */}
          {activeTab === 'categories' && (
            <motion.div
              key="categories-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Add Category Form Card (4 Cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-[#E91E63]" /> Add Category
                </h3>
                
                <form onSubmit={handleAddCategory} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarees or Ethnic Wear"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      required
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category Description</label>
                    <textarea
                      rows={3}
                      placeholder="Brief description of styles in this category..."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      required
                      className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#E91E63] hover:bg-[#D81B60] text-white font-bold rounded-xl transition shadow-md shadow-pink-200 cursor-pointer"
                  >
                    Add Category
                  </button>
                </form>
              </div>

              {/* Categories Display Cards & Table (8 Cols) */}
              <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Categories Directory ({categories.length})</h3>
                    <p className="text-xs text-slate-400">Total products associated with each category</p>
                  </div>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                    Database Categories
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">Category Name</th>
                        <th className="py-3 px-2">Description</th>
                        <th className="py-3 px-2">Total Products</th>
                        <th className="py-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-2 font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                              {cat.c_name.charAt(0)}
                            </div>
                            {cat.c_name}
                          </td>
                          <td className="py-3 px-2 text-slate-500 max-w-xs">{cat.description}</td>
                          <td className="py-3 px-2">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-full text-[11px]">
                              {getCategoryProductCount(cat.id)} products
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right space-x-1">
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </motion.div>
          )}

          {/* ===================== TAB 3: ORDERS ===================== */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Customer Orders Table</h3>
                  <p className="text-xs text-slate-400">Total {orders.length} order records in database</p>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  Live Orders
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-2">Order ID</th>
                      <th className="py-3 px-2">Customer</th>
                      <th className="py-3 px-2">Product</th>
                      <th className="py-3 px-2">Qty</th>
                      <th className="py-3 px-2">Amount</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord) => {
                      // Customer Details from bulk userMap lookup
                      const customer = userMap[ord.user_id];
                      const customerName = (customer && (customer.name || customer.full_name || customer.first_name))
                        ? (customer.name || customer.full_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim())
                        : 'Unknown Customer';
                      const customerEmail = customer?.email || null;

                      // Product Details from bulk productMap lookup
                      const product = productMap[ord.product_id];
                      const productName = (product && (product.name || product.title))
                        ? (product.name || product.title)
                        : 'Unknown Product';
                      const productImage = product?.image ? getImageUrl(product.image) : null;
                      const qty = ord.quantity ?? 1;

                      // Format Order ID
                      const displayOrderId = ord.id ? (ord.id.startsWith('#') ? ord.id : `#${ord.id.slice(0, 6)}`) : '#N/A';

                      const isCancelled = ord.order_status === 'Cancelled';

                      // Order Status Badges
                      let badge = <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{ord.order_status}</span>;
                      if (ord.order_status === 'Confirmed') {
                        badge = <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Confirmed</span>;
                      } else if (ord.order_status === 'Packed') {
                        badge = <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Packed</span>;
                      } else if (ord.order_status === 'Shipped') {
                        badge = <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Shipped</span>;
                      } else if (ord.order_status === 'Out For Delivery') {
                        badge = <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">Out For Delivery</span>;
                      } else if (ord.order_status === 'Delivered') {
                        badge = <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Delivered</span>;
                      } else if (isCancelled) {
                        badge = <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
                      }

                      return (
                        <tr key={ord.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-2 font-mono font-bold text-slate-900">{displayOrderId}</td>
                          <td className="py-3 px-2">
                            <div className="font-bold text-slate-900">{customerName}</div>
                            {customerEmail && (
                              <div className="text-[11px] text-slate-400 font-normal">{customerEmail}</div>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={productName}
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-100 bg-slate-50 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg border border-slate-100 bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs flex-shrink-0">
                                  📦
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-slate-900 max-w-xs truncate">{productName}</div>
                                <div className="text-[11px] text-slate-500 font-medium">Qty: {qty}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 font-bold text-slate-800">{qty}</td>
                          <td className="py-3 px-2 font-extrabold text-[#E91E63]">₹{ord.total_price || ord.amount || 0}</td>
                          <td className="py-3 px-2">{badge}</td>
                          <td className="py-3 px-2 font-medium text-slate-600 text-[11px]">
                            {formatOrderDate(ord.created_at || ord.order_date || ord.createdAt || ord.date)}
                          </td>
                          <td className="py-3 px-2 text-right">
                            {isCancelled ? (
                              <div className="flex justify-end">
                                <select
                                  value="Cancelled"
                                  disabled
                                  className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-400 font-bold rounded-lg text-[11px] cursor-not-allowed opacity-60"
                                >
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                {ord.order_status !== 'Confirmed' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord.id, 'Confirmed')}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[11px] transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                    title="Confirm Order"
                                  >
                                    <CheckCircle2 className="w-3 h-3" /> Confirm
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.id, 'Cancelled')}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px] transition shadow-2xs flex items-center gap-1 cursor-pointer"
                                  title="Cancel Order"
                                >
                                  <XCircle className="w-3 h-3" /> Cancel
                                </button>
                                <select
                                  value={ord.order_status}
                                  onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                  className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg text-[11px] focus:border-[#E91E63] focus:outline-none transition cursor-pointer"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Packed">Packed</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Out For Delivery">Out For Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ===================== TAB 4: PAYMENTS ===================== */}
          {activeTab === 'payments' && (
            <motion.div
              key="payments-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Payment Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                  <div className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</div>
                  <p className="text-[11px] text-emerald-600 font-medium">Calculated from total sales</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">COD Orders</span>
                  <div className="text-2xl font-black text-amber-600">{codPayments.length}</div>
                  <p className="text-[11px] text-slate-400 font-medium">Cash on delivery</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Online Payments</span>
                  <div className="text-2xl font-black text-blue-600">{onlinePayments.length}</div>
                  <p className="text-[11px] text-slate-400 font-medium">UPI / Card / Netbanking</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Payments</span>
                  <div className="text-2xl font-black text-rose-600">{pendingPayments.length}</div>
                  <p className="text-[11px] text-slate-400 font-medium">Verification required</p>
                </div>
              </div>

              {/* Payment History Table */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900">Payment History & Verification</h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    Transactions
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">Payment ID</th>
                        <th className="py-3 px-2">Order ID</th>
                        <th className="py-3 px-2">Method</th>
                        <th className="py-3 px-2">Amount</th>
                        <th className="py-3 px-2">Status</th>
                        <th className="py-3 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-2 font-mono font-bold text-slate-900">{pay.id.slice(0, 8)}...</td>
                          <td className="py-3 px-2 font-mono text-slate-500">{pay.order_id.slice(0, 8)}...</td>
                          <td className="py-3 px-2 font-bold">{pay.payment_method}</td>
                          <td className="py-3 px-2 font-extrabold text-[#E91E63]">₹{pay.amount}</td>
                          <td className="py-3 px-2 font-bold text-emerald-700">{pay.payment_status}</td>
                          <td className="py-3 px-2 text-right">
                            {pay.payment_status !== 'Success' && (
                              <button
                                onClick={() => handleVerifyPayment(pay.id)}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-[11px] transition"
                              >
                                Verify Payment
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </motion.div>
          )}

          {/* ===================== TAB 5: USERS ===================== */}
          {activeTab === 'users' && (
            <motion.div
              key="users-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Modern Customer Directory ({users.length})</h3>
                  <p className="text-xs text-slate-400">Registered users in database</p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Users List
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-2">Avatar</th>
                      <th className="py-3 px-2">Name</th>
                      <th className="py-3 px-2">Email</th>
                      <th className="py-3 px-2">Mobile</th>
                      <th className="py-3 px-2">User ID</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-2">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs uppercase">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-900">{u.name}</td>
                        <td className="py-3 px-2 text-slate-600 font-medium">{u.email}</td>
                        <td className="py-3 px-2 text-slate-600 font-mono">{u.mobile_no}</td>
                        <td className="py-3 px-2 font-mono text-slate-400 text-[11px]">{u.id.slice(0, 8)}...</td>
                        <td className="py-3 px-2">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px]">
                            Active Customer
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
};

export default AdminPage;
