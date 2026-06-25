import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Snowflake, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { accountService } from '../../services';
import { formatCurrency, formatDate, maskAccountNumber } from '../../utils/format';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import TransactionRow from '../../components/dashboard/TransactionRow';

const typeLabels = {
  savings: 'Savings Account', checking: 'Checking Account',
  fixed_deposit: 'Fixed Deposit', recurring_deposit: 'Recurring Deposit',
};

const AccountDetailPage = () => {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  const fetchData = async () => {
    try {
      const [accRes, stmtRes] = await Promise.all([
        accountService.getAccount(id),
        accountService.getStatement(id, filters),
      ]);
      setAccount(accRes.data.data);
      setTransactions(stmtRes.data.data);
    } catch {
      toast.error('Failed to load account details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]); // eslint-disable-line

  const applyFilters = async (e) => {
    e.preventDefault();
    const res = await accountService.getStatement(id, filters);
    setTransactions(res.data.data);
  };

  const handleFreeze = async () => {
    if (!window.confirm('Are you sure you want to freeze this account? This will block all transactions.')) return;
    try {
      await accountService.freezeAccount(id);
      toast.success('Account frozen');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to freeze account');
    }
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) return <LoadingSpinner full />;
  if (!account) return <EmptyState title="Account not found" />;

  return (
    <div className="animate-fade-up space-y-6">
      <Link to="/accounts" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-navy-700">
        <ArrowLeft className="h-4 w-4" /> Back to accounts
      </Link>

      <div className="card overflow-hidden">
        <div className="bg-ink-950 p-6 text-paper sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-navy-300">{typeLabels[account.accountType]}</p>
              <p className="stat-figure mt-2 text-3xl font-semibold sm:text-4xl">{formatCurrency(account.balance)}</p>
              <button onClick={copyAccountNumber} className="mt-3 flex items-center gap-1.5 font-mono text-sm text-navy-300 hover:text-paper">
                {account.accountNumber}
                {copied ? <Check className="h-3.5 w-3.5 text-sage-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <StatusBadge status={account.status} />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-ink-800 pt-5 sm:grid-cols-4">
            <div>
              <p className="text-xs text-navy-400">Interest Rate</p>
              <p className="mt-0.5 text-sm font-medium">{account.interestRate}% p.a.</p>
            </div>
            <div>
              <p className="text-xs text-navy-400">IFSC Code</p>
              <p className="mt-0.5 text-sm font-medium">{account.branch?.ifscCode}</p>
            </div>
            <div>
              <p className="text-xs text-navy-400">Daily Limit</p>
              <p className="mt-0.5 text-sm font-medium">{formatCurrency(account.dailyTransactionLimit)}</p>
            </div>
            <div>
              <p className="text-xs text-navy-400">Branch</p>
              <p className="mt-0.5 text-sm font-medium">{account.branch?.name}</p>
            </div>
          </div>
        </div>
        {account.status === 'active' && (
          <div className="flex justify-end p-4">
            <button onClick={handleFreeze} className="btn-secondary text-rust-500">
              <Snowflake className="h-4 w-4" /> Freeze account
            </button>
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-ink-900">Statement</h2>
          <form onSubmit={applyFilters} className="flex flex-wrap items-center gap-2">
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="input-field !py-1.5 !text-xs" />
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="input-field !py-1.5 !text-xs" />
            <button type="submit" className="btn-secondary !py-1.5 !text-xs">Filter</button>
          </form>
        </div>
        {transactions.length === 0 ? (
          <EmptyState title="No transactions" message="Transactions for this account will appear here." />
        ) : (
          <div className="divide-y divide-navy-50">
            {transactions.map((t) => <TransactionRow key={t._id} transaction={t} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDetailPage;
