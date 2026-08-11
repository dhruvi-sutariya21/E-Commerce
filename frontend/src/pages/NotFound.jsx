import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="w-24 h-24 bg-pink-50 text-[#E91E63] rounded-full flex items-center justify-center shadow-inner">
        <span className="font-serif-luxury text-4xl font-extrabold">404</span>
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-extrabold font-serif-luxury text-gray-900">Page Not Found</h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          The couture page or resource you are seeking does not exist or has been moved.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-bold rounded-full transition shadow-md shadow-pink-200"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
