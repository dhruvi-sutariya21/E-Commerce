import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { categoryAPI } from '../services/category.api';
import { productAPI } from '../services/product.api';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import ErrorAlert from '../components/common/ErrorAlert';

// Default categories fallback
const FALLBACK_CATEGORIES = [
  { id: '3e75a811-8eba-4a41-baa5-aeb308d98b7c', name: 'Tops', description: 'Trendy tops available in different styles, colors, and fabrics.' },
  { id: 'adda531f-a87e-45b4-9939-610b48c5e605', name: 'Jeans', description: 'Comfortable and fashionable jeans for everyday wear.' },
  { id: '3fa65a21-0f19-44de-a4d6-f545efa722aa', name: 'Kurtis', description: 'Traditional and modern kurtis suitable for daily and festive wear.' },
];

const CategoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all categories and all products using public endpoints on mount
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catsData, prodsData] = await Promise.all([
        categoryAPI.getAllCategories(),
        productAPI.getAllProducts(),
      ]);

      if (Array.isArray(catsData) && catsData.length > 0) {
        const formattedCats = catsData.map((c) => ({
          id: c.id,
          name: c.c_name || c.name || 'Category',
          description: c.description || 'Apparel Collection',
        }));
        setCategories(formattedCats);
      } else {
        setCategories(FALLBACK_CATEGORIES);
      }

      setAllProducts(Array.isArray(prodsData) ? prodsData : []);
    } catch (err) {
      console.error('[CategoryPage] Public load error:', err);
      // Ensure no blocking error screen for public guests
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Determine active selected category
  const selectedCatId = searchParams.get('id') || (categories[0]?.id || FALLBACK_CATEGORIES[0].id);
  const activeCategory = categories.find((cat) => cat.id === selectedCatId) || categories[0] || FALLBACK_CATEGORIES[0];

  // Local frontend filtering based on selected category id
  const filteredProducts = allProducts.filter((p) => p.category_id === activeCategory.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100 text-[#E91E63] text-xs font-bold rounded-full uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" /> Collections
        </span>
        <h1 className="text-4xl font-extrabold font-serif-luxury text-gray-900">
          Women’s Couture Categories
        </h1>
        <p className="text-xs text-gray-500">Explore collections and filter products in real-time.</p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => {
          const isSelected = cat.id === activeCategory.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSearchParams({ id: cat.id })}
              className={`px-6 py-3 rounded-full text-xs font-bold transition shadow-sm border cursor-pointer ${
                isSelected
                  ? 'bg-[#E91E63] text-white border-[#E91E63] shadow-pink-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#E91E63] hover:text-[#E91E63]'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Active Category Description Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 card-shadow flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold text-[#E91E63] uppercase tracking-widest">Active Filter</span>
          <h2 className="text-2xl font-bold font-serif-luxury text-gray-900">{activeCategory.name} Collection</h2>
          <p className="text-xs text-gray-500 max-w-xl">{activeCategory.description}</p>
        </div>
        <div className="text-xs font-semibold text-gray-400">
          Showing <span className="text-gray-900 font-bold">{filteredProducts.length}</span> Products
        </div>
      </div>

      {/* Product Grid */}
      {error ? (
        <ErrorAlert message={error} onRetry={loadData} />
      ) : loading ? (
        <ProductGridSkeleton count={4} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={`No products in ${activeCategory.name}`}
          description="We couldn't find any products in this specific category right now."
          actionText="Browse All Products"
          actionLink="/products"
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

export default CategoryPage;
