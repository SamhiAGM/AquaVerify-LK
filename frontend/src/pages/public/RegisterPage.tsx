import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { SRI_LANKAN_DISTRICTS } from '../../utils/constants';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Client-side validations
  const validateForm = (): string | null => {
    if (!fullName.trim()) return 'Full name is required.';
    if (!email.trim() || !email.includes('@')) return 'A valid email address is required.';
    if (!phone.trim()) return 'Contact phone number is required.';

    // Sri Lankan phone regex (e.g. +94771234567 or 0771234567)
    const phoneRegex = /^(?:\+94|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(phone.trim().replace(/\s+/g, ''))) {
      return 'Please enter a valid Sri Lankan phone number (e.g., +94771234567 or 0771234567).';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!(hasUpper && hasLower && hasDigit && hasSpecial)) {
      return 'Password must contain an uppercase letter, lowercase letter, number, and special character (e.g. Citizen@123).';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    if (!agreeTerms) {
      return 'You must accept the terms of use and privacy policy to register.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim().replace(/[\s\-()]/g, ''),
        district,
        password,
        confirmPassword,
        termsAccepted: agreeTerms,
      });

      // Citizen registration redirects directly to Citizen dashboard
      navigate('/dashboard/citizen', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string>;
          };
        };
      };
      const fieldErrors = axiosErr.response?.data?.errors;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        setError(Object.values(fieldErrors).join('. '));
      } else {
        setError(
          axiosErr.response?.data?.message ||
            'Registration failed. Please check your information and try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-white font-sans text-slate-800">
      {/* LEFT PANEL: Environmental Technology Branding */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-teal-950 via-slate-900 to-teal-900 text-white p-10 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/">
            <Logo size="lg" variant="full" theme="dark" />
          </Link>
          <div className="mt-12 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Citizen Registration
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight leading-snug">
              Join Sri Lanka’s Connected Water Quality Network
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Registering gives you direct access to report contaminated or substandard drinking
              water supplies, track real-time remediation status, and verify laboratory testing
              findings.
            </p>
          </div>
        </div>

        <div className="relative z-10 bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 space-y-3">
          <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
            Citizen Benefits:
          </h4>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Unique tracking reference for all submitted complaints
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Notification of officer site visits and laboratory water sampling
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Direct access to published SLS 614 certified test reports
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-4">
          <span>Official Academic Project (EC4307)</span>
          <Link to="/login" className="text-teal-400 hover:underline">
            Already have an account? Sign In &rarr;
          </Link>
        </div>
      </div>

      {/* RIGHT PANEL: Citizen Registration Form */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-10">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div>
            <div className="lg:hidden mb-6">
              <Link to="/">
                <Logo size="md" variant="full" />
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Citizen Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Provide your details to register as a citizen for public water monitoring.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Registration Incomplete</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Kasun Bandara"
              required
              leftIcon={<UserIcon className="w-4 h-4" />}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kasun@example.lk"
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Contact Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94771234567"
                required
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <Select
              label="District of Residence"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
            >
              {SRI_LANKAN_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  {dist} District
                </option>
              ))}
            </Select>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                leftIcon={<Lock className="w-4 h-4" />}
                helperText="Include A-Z, a-z, 0-9, and a symbol"
              />

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-teal-700 hover:underline flex items-center gap-1 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? 'Hide password text' : 'Show password text'}
              </button>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>
                  I agree to the AquaVerify LK Terms of Service, Privacy Policy, and certify that I
                  am reporting drinking water observations accurately.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="teal"
              className="w-full py-2.5 font-semibold text-sm shadow-md mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Register Citizen Account
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-teal-700 hover:underline">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
