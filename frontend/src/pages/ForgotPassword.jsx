import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../services/auth.api';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const otpRes = await authAPI.forgotPassword(email.trim().toLowerCase());
      if (otpRes?.otp_code) {
        setOtp(otpRes.otp_code);
        showSuccess(`OTP code generated & auto-filled (${otpRes.otp_code})`);
      } else {
        showSuccess('OTP code has been generated and sent to your email.');
      }
      setStep(2);
    } catch (err) {
      setError(err.formattedMessage || 'Failed to generate OTP.');
      showError(err.formattedMessage || 'Failed to generate OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authAPI.verifyOtp(email.trim().toLowerCase(), otp.trim());
      showSuccess('OTP verified successfully!');
      setStep(3);
    } catch (err) {
      setError(err.formattedMessage || 'Invalid OTP code.');
      showError(err.formattedMessage || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword({
        email: email.trim().toLowerCase(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      showSuccess('Password reset successfully! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.formattedMessage || 'Failed to reset password.');
      showError(err.formattedMessage || 'Failed to reset password.');
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
          <h2 className="text-2xl font-bold font-serif-luxury text-gray-900">Password Recovery</h2>
          <p className="text-xs text-gray-500">
            {step === 1 && 'Enter registered email to receive an OTP verification code.'}
            {step === 2 && 'Enter 6-digit OTP code sent to your email.'}
            {step === 3 && 'Create a new secure password for your account.'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 text-center font-medium">
            {error}
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          <span className={`h-2 rounded-full transition-all ${step === 1 ? 'w-8 bg-[#E91E63]' : 'w-2 bg-gray-200'}`}></span>
          <span className={`h-2 rounded-full transition-all ${step === 2 ? 'w-8 bg-[#E91E63]' : 'w-2 bg-gray-200'}`}></span>
          <span className={`h-2 rounded-full transition-all ${step === 3 ? 'w-8 bg-[#E91E63]' : 'w-2 bg-gray-200'}`}></span>
        </div>

        {/* Step 1 Form */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Registered Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-bold rounded-full transition shadow-md shadow-pink-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send Verification OTP'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">6-Digit OTP Code</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none tracking-widest text-center font-bold"
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-bold rounded-full transition shadow-md shadow-pink-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP Code'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 3 Form */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="At least 8 chars"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-bold rounded-full transition shadow-md shadow-pink-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'} <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-gray-100">
          <Link to="/login" className="text-xs font-bold text-gray-500 hover:text-[#E91E63]">
            Return to Sign In
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default ForgotPassword;
