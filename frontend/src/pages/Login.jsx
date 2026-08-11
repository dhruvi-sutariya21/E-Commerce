import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { authAPI } from '../services/auth.api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await authAPI.login({
        email: email.trim().toLowerCase(),
        password: password,
      });

      login(data.access_token, data.user);
      showSuccess(`Welcome back, ${data.user?.name || 'User'}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.formattedMessage || err.response?.data?.detail || err.message || 'Login failed. Please check your email and password.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-100 card-shadow space-y-6"
      >
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-1.5 text-2xl font-extrabold font-serif-luxury text-gray-900">
            AURA <span className="h-1.5 w-1.5 rounded-full bg-[#E91E63]"></span>
          </Link>
          <h2 className="text-2xl font-bold font-serif-luxury text-gray-900">Welcome Back</h2>
          <p className="text-xs text-gray-500">Sign in with your email and password to manage your orders.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 block">Password</label>
              <Link to="/forgot-password" className="text-[11px] font-semibold text-[#E91E63] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-bold rounded-full transition shadow-md shadow-pink-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Don’t have an account?{' '}
            <Link to="/register" className="font-bold text-[#E91E63] hover:underline">
              Create Account
            </Link>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
