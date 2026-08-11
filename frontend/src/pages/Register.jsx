import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, KeyRound, ShieldCheck, RefreshCw } from 'lucide-react';
import { authAPI } from '../services/auth.api';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const Register = () => {
  const [step, setStep] = useState(1); // 1 = Details, 2 = OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile_no: '',
    password: '',
  });

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Submit Registration Form -> Send OTP -> Move to Step 2
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validations to match FastAPI constraints
    if (!/^[A-Za-z ]+$/.test(formData.name.trim())) {
      setError('Name must contain only alphabetic letters.');
      setLoading(false);
      return;
    }

    if (formData.name.trim().length < 3) {
      setError('Name must be at least 3 characters.');
      setLoading(false);
      return;
    }

    const mobileStr = formData.mobile_no.toString().trim();
    if (mobileStr.length !== 10 || !['6', '7', '8', '9'].includes(mobileStr[0])) {
      setError('Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    const emailClean = formData.email.trim().toLowerCase();

    try {
      await authAPI.register({
        name: formData.name.trim(),
        email: emailClean,
        mobile_no: parseInt(formData.mobile_no, 10),
        password: formData.password,
      });

      // Generate & Send OTP
      try {
        const otpRes = await authAPI.generateOtp(emailClean);
        if (otpRes?.otp_code) {
          setOtpCode(otpRes.otp_code);
          showSuccess(`Account created! OTP auto-filled (${otpRes.otp_code})`);
        } else {
          showSuccess('Account created! A 6-digit OTP has been sent to your email.');
        }
      } catch (otpErr) {
        showSuccess('Account created! Please verify your account with OTP.');
      }

      setStep(2);
    } catch (err) {
      const msg = err.formattedMessage || 'Failed to create account. Email may already be registered.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP -> Activate Account -> Redirect to Login
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setError('Please enter a valid OTP code.');
      return;
    }

    setLoading(true);
    setError(null);

    const emailClean = formData.email.trim().toLowerCase();

    try {
      await authAPI.verifyOtp(emailClean, otpCode.trim());
      showSuccess('OTP Verified Successfully! Account Activated. Please Sign In.');
      navigate('/login', { replace: true });
    } catch (err) {
      const msg = err.formattedMessage || err.response?.data?.detail || 'Invalid or expired OTP. Please try again.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const otpRes = await authAPI.generateOtp(formData.email.trim().toLowerCase());
      if (otpRes?.otp_code) {
        setOtpCode(otpRes.otp_code);
        showSuccess(`New OTP auto-filled (${otpRes.otp_code})`);
      } else {
        showSuccess('A new OTP has been sent to your email!');
      }
    } catch (err) {
      showError(err.formattedMessage || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-100 card-shadow space-y-6"
      >
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-1.5 text-2xl font-extrabold font-serif-luxury text-gray-900">
            AURA <span className="h-1.5 w-1.5 rounded-full bg-[#E91E63]"></span>
          </Link>
          <h2 className="text-2xl font-bold font-serif-luxury text-gray-900">
            {step === 1 ? 'Create Account' : 'Verify Account OTP'}
          </h2>
          <p className="text-xs text-gray-500">
            {step === 1
              ? 'Join AURA Club for exclusive luxury fashion access.'
              : `Enter the 6-digit verification code sent to ${formData.email}`}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 text-center font-medium">
            {error}
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: Registration Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="priya@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Mobile Number (10 Digits)</label>
              <div className="relative">
                <input
                  type="tel"
                  name="mobile_no"
                  placeholder="9876543210"
                  value={formData.mobile_no}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="Min 8 chars (1 upper, 1 lower, 1 digit, 1 special)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Must contain UPPER, lower, number, & special symbol (e.g. Pass123!)</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-bold rounded-full transition shadow-md shadow-pink-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* STEP 2: OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="p-4 bg-pink-50/70 border border-pink-100 rounded-2xl text-center space-y-1">
              <ShieldCheck className="w-8 h-8 text-[#E91E63] mx-auto" />
              <p className="text-xs font-bold text-gray-900">OTP Sent Successfully!</p>
              <p className="text-[11px] text-gray-500">
                Enter the verification code sent to <span className="font-bold text-gray-900">{formData.email}</span> to activate your account.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">6-Digit OTP Code</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 rounded-2xl text-sm font-mono tracking-widest border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition text-center"
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-bold rounded-full transition shadow-md shadow-pink-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP & Activate Account'} <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-800 font-medium"
              >
                ← Back to Edit Email
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-[#E91E63] font-bold hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Resend OTP
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#E91E63] hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </motion.div>
    </div>
  );
};

export default Register;
