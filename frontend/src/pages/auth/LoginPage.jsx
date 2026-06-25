import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left - Brand panel */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-ink-950 p-12 lg:flex">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #CDA047 1px, transparent 0)',
          backgroundSize: '28px 28px'
        }} />
        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="7" fill="#CDA047"/>
            <path d="M16 6L27 12.5H5L16 6Z" fill="#0A1628"/>
            <rect x="7" y="14" width="3" height="11" fill="#0A1628"/>
            <rect x="14.5" y="14" width="3" height="11" fill="#0A1628"/>
            <rect x="22" y="14" width="3" height="11" fill="#0A1628"/>
            <rect x="5" y="26" width="22" height="2.5" fill="#0A1628"/>
          </svg>
          <span className="font-display text-xl font-semibold text-paper">DigitalBank</span>
        </Link>
        <div className="relative z-10">
          <p className="font-display text-[2.75rem] leading-[1.15] text-paper">
            Banking that moves<br />at the speed of <span className="text-gold-400">your life.</span>
          </p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-navy-300">
            Manage accounts, move money, and grow your savings — all from one secure, modern dashboard.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-8 border-t border-ink-800 pt-6 text-navy-400">
          <div>
            <p className="font-display text-2xl text-paper">256-bit</p>
            <p className="text-xs">Bank-grade encryption</p>
          </div>
          <div>
            <p className="font-display text-2xl text-paper">24/7</p>
            <p className="text-xs">Customer support</p>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="7" fill="#0F1F38"/>
                <path d="M16 6L27 12.5H5L16 6Z" fill="#CDA047"/>
                <rect x="7" y="14" width="3" height="11" fill="#CDA047"/>
                <rect x="14.5" y="14" width="3" height="11" fill="#CDA047"/>
                <rect x="22" y="14" width="3" height="11" fill="#CDA047"/>
                <rect x="5" y="26" width="22" height="2.5" fill="#CDA047"/>
              </svg>
              <span className="font-display text-lg font-semibold text-ink-900">DigitalBank</span>
            </Link>
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-navy-400">Sign in to access your accounts and manage your money.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="input-label">Email address</label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="input-label">Password</label>
                <Link to="/forgot-password" className="mb-1.5 text-xs font-medium text-navy-500 hover:text-navy-700">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10" placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-navy-700 hover:text-navy-900">Open an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
