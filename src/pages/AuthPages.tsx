import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Shield,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import MeetingLeafLogo from '@/components/MeetingLeafLogo';
import { useAuthStore } from '@/store/authStore';
import { loginApi, registerApi } from '@/api';

// ============================================================================
// LOGIN PAGE (/auth/login) — 100% Parity with Frontend LoginScreen.tsx
// ============================================================================
export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginAsGuest } = useAuthStore();

  const [identifier, setIdentifier] = useState('user@agromarket.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter your email/phone and password.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const normalizedIdentifier = identifier.includes('@')
        ? identifier.trim().toLowerCase()
        : identifier.trim();
      const response = await loginApi(normalizedIdentifier, password);
      login(response.user, response.token);

      if (response.user.role === 'ADMIN' || response.user.isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      if (!err?.response) {
        setErrorMessage(
          'Cannot connect to the backend server. Please ensure the Backend is running on port 5000.'
        );
      } else {
        setErrorMessage(
          err?.response?.data?.message ||
          'Invalid credentials. Please verify your email/phone and password.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setIdentifier(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  const handleGuest = () => {
    loginAsGuest();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white text-[#241A12] flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[430px] flex flex-col items-center">
        {/* Brand Header */}
        <div
          onClick={() => navigate('/')}
          className="flex flex-col items-center mb-6 cursor-pointer"
        >
          <MeetingLeafLogo size={56} showWordmark variant="light" />
        </div>

        {/* Form Card */}
        <div className="w-full bg-white rounded-3xl border border-[#CCEBD5] p-6 sm:p-7 shadow-[0_8px_28px_rgba(23,58,32,0.06)]">
          <h1 className="font-display-italic text-[23px] text-[#173A20] font-semibold mb-1">
            Welcome Back
          </h1>
          <p className="text-[13px] text-[#5C5245] leading-relaxed mb-5">
            Sign in to manage your farms, orders, and direct harvests
          </p>

          {errorMessage && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 mb-4 text-[12.5px] font-medium text-[#B54A34]">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / Phone Field */}
            <div>
              <label className="block text-[13px] font-semibold text-[#241A12] mb-1.5">
                Email or Phone Number
              </label>
              <div className="flex items-center bg-[#EEF8F1] border border-[#CCEBD5] focus-within:border-[#4E8B3F] rounded-xl px-3.5 transition">
                <Mail size={18} className="text-[#4E8B3F] mr-2.5 shrink-0" />
                <input
                  type="text"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="user@agromarket.com or +237..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full py-3 bg-transparent text-sm text-[#241A12] placeholder-[#8E8271] focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[13px] font-semibold text-[#241A12] mb-1.5">
                Password
              </label>
              <div className="flex items-center bg-[#EEF8F1] border border-[#CCEBD5] focus-within:border-[#4E8B3F] rounded-xl px-3.5 transition">
                <Lock size={18} className="text-[#4E8B3F] mr-2.5 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 bg-transparent text-sm text-[#241A12] placeholder-[#8E8271] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-[#5C5245] hover:text-[#241A12] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] disabled:opacity-60 text-white text-sm font-bold shadow-xs transition cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Test Credentials Quick-Chips (Exact Match with Mobile LoginScreen.tsx) */}
          <div className="mt-5 pt-4 border-t border-[#CCEBD5]">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles size={14} className="text-[#E2A63C]" />
              <span className="font-mono-num text-[11px] font-semibold text-[#5C5245] uppercase tracking-wider">
                Quick Test Credentials (Database Synced)
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {/* Farmer 1: Victoy Eyong */}
              <button
                type="button"
                onClick={() => handleFillDemo('user@agromarket.com', 'password123')}
                className="flex items-center gap-2 w-full text-left bg-[#EEF8F1] hover:bg-[#E1F3E6] border border-[#4E8B3F]/30 py-2 px-3 rounded-full transition cursor-pointer"
              >
                <UserIcon size={13} className="text-[#4E8B3F] shrink-0" />
                <span className="font-mono-num text-[11.5px] text-[#4E8B3F] truncate">
                  Victoy Eyong: user@agromarket.com
                </span>
              </button>

              {/* Farmer 2: Mbah Paul Fru */}
              <button
                type="button"
                onClick={() => handleFillDemo('mbah@agromarket.com', 'password123')}
                className="flex items-center gap-2 w-full text-left bg-[#EEF8F1] hover:bg-[#E1F3E6] border border-[#4E8B3F]/30 py-2 px-3 rounded-full transition cursor-pointer"
              >
                <UserIcon size={13} className="text-[#4E8B3F] shrink-0" />
                <span className="font-mono-num text-[11.5px] text-[#4E8B3F] truncate">
                  Mbah Paul Fru: mbah@agromarket.com
                </span>
              </button>

              {/* Buyer / User with No Farm: Sarah Manga */}
              <button
                type="button"
                onClick={() => handleFillDemo('sarah@agromarket.com', 'password123')}
                className="flex items-center gap-2 w-full text-left bg-[#EEF8F1] hover:bg-[#E1F3E6] border border-[#4E8B3F]/30 py-2 px-3 rounded-full transition cursor-pointer"
              >
                <UserIcon size={13} className="text-[#4E8B3F] shrink-0" />
                <span className="font-mono-num text-[11.5px] text-[#4E8B3F] truncate">
                  Sarah Manga (No Farm): sarah@agromarket.com
                </span>
              </button>

              {/* Administrator: Chief Eyong */}
              <button
                type="button"
                onClick={() => handleFillDemo('admin@agromarket.com', 'admin123')}
                className="flex items-center gap-2 w-full text-left bg-[#F3E8FF] hover:bg-[#E9D5FF] border border-[#7C3AED]/30 py-2 px-3 rounded-full transition cursor-pointer"
              >
                <Shield size={13} className="text-[#7C3AED] shrink-0" />
                <span className="font-mono-num text-[11.5px] text-[#7C3AED] truncate">
                  Chief Eyong (Admin): admin@agromarket.com
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-1.5 mt-5 mb-2 text-[13px]">
          <span className="text-[#5C5245]">New to Agrom?</span>
          <button
            type="button"
            onClick={() => navigate('/auth/register')}
            className="font-semibold text-[#4E8B3F] hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </div>

        <button
          type="button"
          onClick={handleGuest}
          className="py-2 text-[12.5px] font-medium text-[#5C5245] hover:text-[#173A20] transition cursor-pointer"
        >
          Browse Marketplace as Guest →
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// REGISTER PAGE (/auth/register) — 100% Parity with Frontend RegisterScreen.tsx
// ============================================================================
export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await registerApi({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });

      login(response.user, response.token);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        'Failed to create account. User with this email or phone may already exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#241A12] flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-[430px] flex flex-col items-center">
        {/* Top Header Row (Back Button + Centered Logo) */}
        <div className="w-full flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="w-10 h-10 rounded-full bg-[#EEF8F1] border border-[#CCEBD5] hover:border-[#4E8B3F] flex items-center justify-center text-[#241A12] transition cursor-pointer"
            aria-label="Back to Sign In"
          >
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>
          <div onClick={() => navigate('/')} className="cursor-pointer">
            <MeetingLeafLogo size={56} showWordmark variant="light" />
          </div>
          <div className="w-10" />
        </div>

        {/* Form Card */}
        <div className="w-full bg-white rounded-3xl border border-[#CCEBD5] p-6 sm:p-7 shadow-[0_8px_28px_rgba(23,58,32,0.06)]">
          <h1 className="font-display-italic text-[23px] text-[#173A20] font-semibold mb-1">
            Create Account
          </h1>
          <p className="text-[13px] text-[#5C5245] leading-relaxed mb-5">
            Join the direct agri-commerce network. Every member can buy harvests and register farms.
          </p>

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-3 mb-4 text-[12.5px] font-medium text-[#B54A34]">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-[13px] font-semibold text-[#241A12] mb-1.5">
                Full Name *
              </label>
              <div className="flex items-center bg-[#EEF8F1] border border-[#CCEBD5] focus-within:border-[#4E8B3F] rounded-xl px-3.5 transition">
                <UserIcon size={18} className="text-[#4E8B3F] mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="e.g., Victoy Eyong"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-3 bg-transparent text-sm text-[#241A12] placeholder-[#8E8271] focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-semibold text-[#241A12] mb-1.5">
                Email Address *
              </label>
              <div className="flex items-center bg-[#EEF8F1] border border-[#CCEBD5] focus-within:border-[#4E8B3F] rounded-xl px-3.5 transition">
                <Mail size={18} className="text-[#4E8B3F] mr-2.5 shrink-0" />
                <input
                  type="email"
                  autoCapitalize="none"
                  placeholder="e.g., victoy@agromarket.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 bg-transparent text-sm text-[#241A12] placeholder-[#8E8271] focus:outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[13px] font-semibold text-[#241A12] mb-1.5">
                Phone Number (MTN / Orange) *
              </label>
              <div className="flex items-center bg-[#EEF8F1] border border-[#CCEBD5] focus-within:border-[#4E8B3F] rounded-xl px-3.5 transition">
                <Phone size={18} className="text-[#4E8B3F] mr-2.5 shrink-0" />
                <input
                  type="tel"
                  placeholder="e.g., +237671111111"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-3 bg-transparent text-sm text-[#241A12] placeholder-[#8E8271] focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-semibold text-[#241A12] mb-1.5">
                Password *
              </label>
              <div className="flex items-center bg-[#EEF8F1] border border-[#CCEBD5] focus-within:border-[#4E8B3F] rounded-xl px-3.5 transition">
                <Lock size={18} className="text-[#4E8B3F] mr-2.5 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 bg-transparent text-sm text-[#241A12] placeholder-[#8E8271] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-[#5C5245] hover:text-[#241A12] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[13px] font-semibold text-[#241A12] mb-1.5">
                Confirm Password *
              </label>
              <div className="flex items-center bg-[#EEF8F1] border border-[#CCEBD5] focus-within:border-[#4E8B3F] rounded-xl px-3.5 transition">
                <Lock size={18} className="text-[#4E8B3F] mr-2.5 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full py-3 bg-transparent text-sm text-[#241A12] placeholder-[#8E8271] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] disabled:opacity-60 text-white text-sm font-bold shadow-xs transition cursor-pointer"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Footer Row */}
        <div className="flex items-center gap-1.5 mt-5 text-[13px]">
          <span className="text-[#5C5245]">Already have an account?</span>
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="font-semibold text-[#4E8B3F] hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

