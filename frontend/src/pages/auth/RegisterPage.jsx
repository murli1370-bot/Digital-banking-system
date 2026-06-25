import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: 'At least 8 characters', valid: form.password.length >= 8 },
    { label: 'Upper & lowercase letters', valid: /[a-z]/.test(form.password) && /[A-Z]/.test(form.password) },
    { label: 'At least one number', valid: /\d/.test(form.password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!passwordChecks.every((c) => c.valid)) {
      toast.error('Password does not meet requirements');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register(payload);
      toast.success(`Welcome to DigitalBank, ${user.firstName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="7" fill="#0F1F38"/>
            <path d="M16 6L27 12.5H5L16 6Z" fill="#CDA047"/>
            <rect x="7" y="14" width="3" height="11" fill="#CDA047"/>
            <rect x="14.5" y="14" width="3" height="11" fill="#CDA047"/>
            <rect x="22" y="14" width="3" height="11" fill="#CDA047"/>
            <rect x="5" y="26" width="22" height="2.5" fill="#CDA047"/>
          </svg>
          <span className="font-display text-xl font-semibold text-ink-900">DigitalBank</span>
        </Link>

        <div className="card p-7 sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-ink-900">Open your account</h1>
          <p className="mt-1.5 text-sm text-navy-400">It takes less than two minutes. A free savings account is created automatically.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="input-label">First name</label>
                <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" placeholder="Jordan" />
              </div>
              <div>
                <label className="input-label">Last name</label>
                <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" placeholder="Lee" />
              </div>
            </div>
            <div>
              <label className="input-label">Email address</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="input-label">Phone number</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} className="input-field" placeholder="9876543210" maxLength={15} />
            </div>
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pr-10" placeholder="Create a strong password"
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  {passwordChecks.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5 text-xs">
                      <Check className={`h-3.5 w-3.5 ${c.valid ? 'text-sage-500' : 'text-navy-200'}`} />
                      <span className={c.valid ? 'text-sage-600' : 'text-navy-400'}>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="input-label">Confirm password</label>
              <input
                type={showPassword ? 'text' : 'password'} required value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="input-field" placeholder="Re-enter your password"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-400">
            Already banking with us?{' '}
            <Link to="/login" className="font-semibold text-navy-700 hover:text-navy-900">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
