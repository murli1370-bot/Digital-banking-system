import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { accountService } from '../../services';
import AccountCard from '../../components/dashboard/AccountCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const accountTypes = [
  { value: 'savings', label: 'Savings Account', desc: '3.5% p.a. interest, no minimum balance restrictions' },
  { value: 'checking', label: 'Checking Account', desc: 'No interest, ideal for everyday transactions' },
  { value: 'fixed_deposit', label: 'Fixed Deposit', desc: '6.5% p.a., locked for a fixed tenure' },
  { value: 'recurring_deposit', label: 'Recurring Deposit', desc: '5.5% p.a., save a fixed amount monthly' },
];

const AccountsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(searchParams.get('action') === 'new');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ accountType: 'savings', initialDeposit: '' });

  const fetchAccounts = async () => {
    try {
      const res = await accountService.getAccounts();
      setAccounts(res.data.data);
    } catch {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await accountService.createAccount({
        accountType: form.accountType,
        initialDeposit: form.initialDeposit ? parseFloat(form.initialDeposit) : 0,
      });
      toast.success('Account created successfully');
      setModalOpen(false);
      setForm({ accountType: 'savings', initialDeposit: '' });
      searchParams.delete('action');
      setSearchParams(searchParams);
      fetchAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    searchParams.delete('action');
    setSearchParams(searchParams);
  };

  if (loading) return <LoadingSpinner full />;

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Accounts</h1>
          <p className="mt-1 text-sm text-navy-400">Manage your savings, checking, and deposit accounts.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> Open account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Wallet} title="No accounts yet"
            message="Open your first account in seconds — no paperwork required."
            action={<button onClick={() => setModalOpen(true)} className="btn-primary">Open account</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc) => <AccountCard key={acc._id} account={acc} />)}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title="Open a new account">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="input-label">Account type</label>
            <div className="space-y-2">
              {accountTypes.map((type) => (
                <label key={type.value} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${form.accountType === type.value ? 'border-navy-700 bg-navy-50' : 'border-navy-100'}`}>
                  <input
                    type="radio" name="accountType" value={type.value}
                    checked={form.accountType === type.value}
                    onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-ink-900">{type.label}</p>
                    <p className="text-xs text-navy-400">{type.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="input-label">Initial deposit (optional)</label>
            <input
              type="number" min="0" step="0.01" value={form.initialDeposit}
              onChange={(e) => setForm({ ...form, initialDeposit: e.target.value })}
              className="input-field" placeholder="0.00"
            />
          </div>
          <button type="submit" disabled={creating} className="btn-primary w-full">
            {creating ? 'Creating...' : 'Open account'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AccountsPage;
