import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset successful. Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center font-display text-2xl font-semibold text-ink-900">Set a new password</h1>
        <p className="mb-7 text-center text-sm text-navy-400">Choose a strong password you haven't used before.</p>
        <div className="card p-7 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">New password</label>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label className="input-label">Confirm new password</label>
              <input type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Resetting...' : 'Reset password'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-navy-400">
          <Link to="/login" className="font-semibold text-navy-700 hover:text-navy-900">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
