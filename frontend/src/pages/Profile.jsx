import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, ShieldCheck, Edit2, Save, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/auth.api';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateUserState, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile_no: user?.mobile_no || '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile_no: user.mobile_no || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setLoading(true);

    try {
      const res = await authAPI.updateProfile(user.id, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile_no: parseInt(formData.mobile_no, 10),
      });

      if (res.user) {
        updateUserState(res.user);
        showSuccess('Profile updated successfully in backend!');
        setIsEditing(false);
      }
    } catch (err) {
      showError(err.formattedMessage || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-100 via-white to-rose-50 rounded-3xl p-8 border border-pink-100 card-shadow flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#E91E63] text-white flex items-center justify-center text-3xl font-extrabold shadow-lg">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-white rounded-full text-[10px] font-bold text-[#E91E63] border border-pink-200">
            {isAdmin ? 'Admin Account' : 'AURA VIP Customer'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-gray-900">{user?.name}</h1>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Main Profile Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 border border-gray-100 card-shadow space-y-6"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif-luxury text-gray-900">Personal Information</h2>
            <p className="text-xs text-gray-500">Manage your profile details registered on backend.</p>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-50 hover:bg-pink-100 text-[#E91E63] text-xs font-bold rounded-full transition"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 disabled:bg-gray-100/70 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition disabled:text-gray-600 font-medium"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 disabled:bg-gray-100/70 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition disabled:text-gray-600 font-medium"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 disabled:bg-gray-100/70 rounded-2xl text-xs border border-gray-200 focus:border-[#E91E63] focus:bg-white focus:outline-none transition disabled:text-gray-600 font-medium"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* User ID */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Backend User ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={user?.id || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl text-[11px] border border-gray-200 font-mono text-gray-500"
                />
                <ShieldCheck className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

          </div>

          {isEditing && (
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#E91E63] hover:bg-[#D81B60] text-white text-xs font-bold rounded-full transition shadow-md shadow-pink-200"
              >
                <Save className="w-4 h-4" /> {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          )}
        </form>
      </motion.div>

    </div>
  );
};

export default Profile;
