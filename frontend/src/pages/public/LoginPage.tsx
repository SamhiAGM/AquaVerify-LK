import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { authService } from '../../services/authService';
import { getRoleHomePath } from '../../components/common/ProtectedRoute';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both your registered email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login({ email: email.trim(), password, rememberMe });
      // Redirect to the originally requested URL or their role home
      const destination = (location.state as { from?: { pathname: string } })?.from?.pathname || getRoleHomePath(user.role);
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr.response?.data?.message ||
          'Invalid email address or password. Please verify your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your account email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const msg = await authService.forgotPassword(forgotEmail.trim());
      setForgotMessage(msg);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setForgotError(axiosErr.response?.data?.message || 'Failed to process password reset request.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-white font-sans text-slate-800">
      {/* LEFT PANEL: Branding, Ambient Background & Quick Demo Role Fillers */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-teal-950 via-slate-900 to-teal-900 text-white p-10 flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/">
            <Logo size="lg" variant="full" theme="dark" />
          </Link>
          <div className="mt-12 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Environmental Tech Portal
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight leading-snug">
              Secure Drinking Water Management for Sri Lanka
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Connect to real-time complaint telemetry, accredited laboratory results, and district
              water-quality monitoring records.
            </p>
          </div>
        </div>

        {/* Academic Evaluation Quick-Credentials Picker */}
        <div className="relative z-10 bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Academic Demo Accounts
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-700/80 px-2 py-0.5 rounded">
              1-Click Autofill
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@aquaverify.lk', 'Admin@123')}
              className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-teal-900/40 border border-slate-700 hover:border-teal-500/50 text-left transition-all group"
            >
              <p className="font-bold text-white group-hover:text-teal-300">Administrator</p>
              <p className="text-[10px] text-slate-400">admin@aquaverify.lk</p>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('officer@aquaverify.lk', 'Officer@123')}
              className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-teal-900/40 border border-slate-700 hover:border-teal-500/50 text-left transition-all group"
            >
              <p className="font-bold text-white group-hover:text-teal-300">Quality Officer</p>
              <p className="text-[10px] text-slate-400">officer@aquaverify.lk</p>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('lab@aquaverify.lk', 'Lab@123')}
              className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-teal-900/40 border border-slate-700 hover:border-teal-500/50 text-left transition-all group"
            >
              <p className="font-bold text-white group-hover:text-teal-300">Lab Technician</p>
              <p className="text-[10px] text-slate-400">lab@aquaverify.lk</p>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('citizen@aquaverify.lk', 'Citizen@123')}
              className="p-2.5 rounded-lg bg-slate-900/90 hover:bg-teal-900/40 border border-slate-700 hover:border-teal-500/50 text-left transition-all group"
            >
              <p className="font-bold text-white group-hover:text-teal-300">Citizen User</p>
              <p className="text-[10px] text-slate-400">citizen@aquaverify.lk</p>
            </button>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-4">
          <span>PostgreSQL 18 &bull; Spring Security 6</span>
          <Link to="/" className="text-teal-400 hover:underline">
            Back to Public Portal &rarr;
          </Link>
        </div>
      </div>

      {/* RIGHT PANEL: Login Form */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="space-y-2">
            <div className="lg:hidden mb-6">
              <Link to="/">
                <Logo size="md" variant="full" />
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to AquaVerify LK
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Enter your credentials to access your complaints and water quality tools.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.lk"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Remember session</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs font-semibold text-teal-700 hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="teal"
              className="w-full py-2.5 font-semibold text-sm shadow-md"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Mobile Quick Demo Account Selector */}
          <div className="lg:hidden pt-4 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Academic Demo Autofill:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fillDemoAccount('admin@aquaverify.lk', 'Admin@123')}
              >
                Admin
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fillDemoAccount('officer@aquaverify.lk', 'Officer@123')}
              >
                Officer
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fillDemoAccount('lab@aquaverify.lk', 'Lab@123')}
              >
                Lab Tech
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fillDemoAccount('citizen@aquaverify.lk', 'Citizen@123')}
              >
                Citizen
              </Button>
            </div>
          </div>

          {/* Registration Link */}
          <div className="text-center text-xs text-slate-500 pt-2">
            Don&apos;t have an account yet?{' '}
            <Link to="/register" className="font-semibold text-teal-700 hover:underline">
              Register as a Citizen
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Account Password"
        description="Enter your registered email address to receive password reset instructions."
      >
        {forgotMessage ? (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-900">{forgotMessage}</p>
            <p className="text-xs text-slate-500">
              For security, if the email matches an active account, reset token instructions have
              been initiated.
            </p>
            <Button variant="secondary" onClick={() => setForgotModalOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            {forgotError && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs">
                {forgotError}
              </div>
            )}
            <Input
              label="Account Email Address"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="your.email@example.lk"
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="teal" isLoading={forgotLoading}>
                Request Reset Token
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
