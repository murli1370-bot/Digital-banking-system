import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
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

        <div className="card p-7 text-center sm:p-8">
          {sent ? (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage-50">
                <MailCheck className="h-6 w-6 text-sage-500" />
              </div>
              <h1 className="font-display text-xl font-semibold text-ink-900">Check your inbox</h1>
              <p className="mt-2 text-sm text-navy-400">If an account exists for <strong className="text-ink-800">{email}</strong>, you'll receive a password reset link shortly.</p>
              <Link to="/login" className="btn-secondary mt-6 w-full">Back to sign in</Link>
            </>
          ) : (
            <>
              <h1 className="font-display text-xl font-semibold text-ink-900 text-left">Reset your password</h1>
              <p className="mt-1.5 text-left text-sm text-navy-400">Enter the email linked to your account and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
                <div>
                  <label className="input-label">Email address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending...' : 'Send reset link'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-navy-400">
          <Link to="/login" className="font-semibold text-navy-700 hover:text-navy-900">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
