import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, LogIn, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onBackToSite: () => void;
}

export function AdminLogin({ onLogin, onBackToSite }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'changeme';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('marling_admin_auth', 'true');
      onLogin();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#08090B] to-[#213162] flex items-center justify-center px-4">
      <motion.div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFC700] rounded-full mb-4">
            <Lock size={32} className="text-[#0A0A0A]" />
          </div>
          <h1 className="text-3xl font-bold text-[#08090B] font-['Roboto_Mono']">
            Admin Login
          </h1>
          <p className="text-gray-600 mt-2">
            Enter password to access the admin panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#08090B] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-[#B14032] focus:outline-none"
              placeholder="Enter admin password"
              autoFocus
            />
            {error && (
              <motion.p
                className="text-[#B14032] text-sm mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}
          </div>

          <motion.button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#FFC700] text-[#0A0A0A] font-bold rounded-lg hover:bg-[#FFD700] transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogIn size={20} />
            Login
          </motion.button>
        </form>

        <motion.button
          onClick={onBackToSite}
          className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 text-gray-600 hover:text-[#0A0A0A] transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft size={20} />
          Back to Main Site
        </motion.button>
      </motion.div>
    </div>
  );
}
