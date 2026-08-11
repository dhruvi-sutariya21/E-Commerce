import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ShoppingBag, X } from 'lucide-react';
import { productAPI } from '../services/product.api';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import ErrorAlert from '../components/common/ErrorAlert';

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'low-to-high', 'high-to-low'
  const [inStockOnly, setInStockOnly] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];
      if (searchTerm.trim()) {
        try {
          data = await productAPI.searchProducts(searchTerm.trim());
        } catch (e) {
          data = [];
        }
      } else {
        data = await productAPI.getAllProducts();
      }
      setProducts(data || []);
    } catch (err) {
      setError(err.formattedMessage || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  // Client side sorting & stock filtering on fetched products
  let filteredProducts = [...products];

  if (inStockOnly) {
    filteredProducts = filteredProducts.filter((p) => p.stock > 0);
  }

  if (sortBy === 'low-to-high') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'high-to-low') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(searchTerm ? { search: searchTerm } : {});
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-100 via-white to-rose-50 rounded-3xl p-8 border border-pink-100 card-shadow flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold text-[#E91E63] uppercase tracking-widest">Real Backend Catalog</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif-luxury text-gray-900">
            Shop All Collections
          </h1>
          <p className="text-xs text-gray-500 max-w-xl">
            Browse through our full catalog fetched directly from the FastAPI database.
          </p>
        </div>

        {/* Live Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search tops, jeans, kurtis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 text-xs bg-white rounded-full border border-gray-200 focus:border-[#E91E63] focus:outline-none shadow-sm"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Control Bar: Filters & Sorting */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        
        <div className="flex items-center gap-3 text-xs">
          <SlidersHorizontal className="w-4 h-4 text-[#E91E63]" />
          <span className="font-bold text-gray-900">Filter By:</span>
          <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700 font-medium">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-[#E91E63] rounded"
            />
            In Stock Only
          </label>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-xs font-medium focus:border-[#E91E63] focus:outline-none"
          >
            <option value="featured">Featured / Default</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
          </select>
        </div>

      </div>

      {/* Products Grid */}
      {error ? (
        <ErrorAlert message={error} onRetry={fetchProducts} />
      ) : loading ? (
        <ProductGridSkeleton count={6} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Products Found"
          description={
            searchTerm
              ? `We couldn't find any products matching "${searchTerm}". Try another keyword.`
              : 'No products available in backend server.'
          }
          actionText="Clear Search"
          actionLink="/products"
          onRetry={clearSearch}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
};

export default ProductListPage;
