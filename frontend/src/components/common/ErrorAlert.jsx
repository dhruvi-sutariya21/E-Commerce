import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorAlert = ({ message, onRetry }) => {
  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-base font-bold text-rose-900">Connection or Server Error</h4>
        <p className="text-xs text-rose-700 mt-1">{message || 'Unable to load data from backend server.'}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-full transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
