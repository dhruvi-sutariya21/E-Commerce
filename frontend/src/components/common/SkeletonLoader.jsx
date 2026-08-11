import React from 'react';

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-4">
    <div className="w-full h-64 bg-gray-200 rounded-2xl"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
    </div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-6 bg-pink-100 rounded w-1/3"></div>
      <div className="h-9 w-9 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
    <div className="h-[480px] bg-gray-200 rounded-3xl"></div>
    <div className="space-y-6">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="h-10 bg-gray-200 rounded w-3/4"></div>
      <div className="h-8 bg-pink-100 rounded w-1/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-100 rounded"></div>
        <div className="h-4 bg-gray-100 rounded"></div>
        <div className="h-4 bg-gray-100 rounded w-2/3"></div>
      </div>
      <div className="h-12 bg-gray-200 rounded-full w-full"></div>
    </div>
  </div>
);
