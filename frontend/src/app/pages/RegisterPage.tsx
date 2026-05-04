import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Shield, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto p-4"
    >
      <div
        className="rounded-2xl p-8 backdrop-blur-2xl border"
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex flex-col items-center mb-8">
          <div
            className="p-4 rounded-full mb-4"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              boxShadow: '0 0 24px rgba(34, 197, 94, 0.3)',
            }}
          >
            <Shield className="w-12 h-12 text-[#22c55e]" />
          </div>
          <h2 className="text-2xl text-white mb-2">Create Account</h2>
          <p className="text-gray-400 text-sm">Join Sentinel-OWASP Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border-b-2 border-gray-700 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:border-[#3b82f6]"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border-b-2 border-gray-700 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:border-[#3b82f6]"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border-b-2 border-gray-700 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:border-[#3b82f6]"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 text-sm">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border-b-2 border-gray-700 text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:border-[#3b82f6]"
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                required
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg text-white font-semibold"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)',
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: '0 12px 32px rgba(34, 197, 94, 0.6)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            {submitting ? 'Creating...' : 'Create Account'}
          </motion.button>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
              style={{ textShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
