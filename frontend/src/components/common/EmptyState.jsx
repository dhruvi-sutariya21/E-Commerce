import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, PackageSearch, RefreshCw } from 'lucide-react';

const EmptyState = ({
  icon: Icon = ShoppingBag,
  title = 'Your Bag is Empty',
  description = 'Looks like you haven’t added anything to your bag yet. Explore our luxury collection to find your match.',
  actionText = 'Explore Products',
  actionLink = '/products',
  onRetry,
}) => {
  return (
    <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100 space-y-5">
      <div className="w-20 h-20 bg-pink-50 text-[#E91E63] rounded-full flex items-center justify-center mx-auto shadow-inner">
        <Icon className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold font-serif-luxury text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {actionLink && (
          <Link
            to={actionLink}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-semibold rounded-full transition shadow-md shadow-pink-200"
          >
            {actionText}
          </Link>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full transition"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
