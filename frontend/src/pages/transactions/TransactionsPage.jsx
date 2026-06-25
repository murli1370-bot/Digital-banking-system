import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Plus, Minus, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { transactionService, accountService } from '../../services';
import { formatCurrency, formatDateTime } from '../../utils/format';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import TransferModal from '../../components/transactions/TransferModal';
import DepositWithdrawModal from '../../components/transactions/DepositWithdrawModal';

const isCredit = (type) => ['credit', 'deposit', 'refund', 'interest', 'loan_disbursement'].includes(type);

const TransactionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [filters, setFilters] = useState({ search: '', type: '', status: '', category: '' });
  const [transferOpen, setTransferOpen] = useState(searchParams.get('action') === 'transfer');
  const [depositMode, setDepositMode] = useState(null); // 'deposit' | 'withdraw' | null

  const fetchAccounts = async () => {
    const res = await accountService.getAccounts();
    setAccounts(res.data.data);
  };

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await transactionService.getTransactions(params);
      setTransactions(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchAccounts(); }, []);
  useEffect(() => { fetchTransactions(1); }, [fetchTransactions]);

  const closeTransfer = () => {
    setTransferOpen(false);
    searchParams.delete('action');
    setSearchParams(searchParams);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Transactions</h1>
          <p className="mt-1 text-sm text-navy-400">View, filter, and manage all your money movements.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setDepositMode('deposit')} className="btn-secondary"><Plus className="h-4 w-4" /> Deposit</button>
          <button onClick={() => setDepositMode('withdraw')} className="btn-secondary"><Minus className="h-4 w-4" /> Withdraw</button>
          <button onClick={() => setTransferOpen(true)} className="btn-primary"><Send className="h-4 w-4" /> Transfer</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
          <input
            value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search description..." className="input-field pl-9"
          />
        </div>
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="input-field w-auto">
          <option value="">All types</option>
          {['credit', 'debit', 'transfer', 'payment', 'deposit', 'withdrawal'].map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input-field w-auto">
          <option value="">All statuses</option>
          {['completed', 'pending', 'failed', 'reversed'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner full />
        ) : transactions.length === 0 ? (
          <EmptyState icon={Filter} title="No transactions found" message="Try adjusting your filters or make your first transaction." />
        ) : (
          <>
            <div className="hidden grid-cols-12 gap-4 border-b border-navy-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-navy-400 sm:grid">
              <span className="col-span-5">Description</span>
              <span className="col-span-2">Category</span>
              <span className="col-span-2">Date</span>
              <span className="col-span-1">Status</span>
              <span className="col-span-2 text-right">Amount</span>
            </div>
            <div className="divide-y divide-navy-50">
              {transactions.map((t) => (
                <div key={t._id} className="grid grid-cols-1 gap-1.5 px-5 py-4 sm:grid-cols-12 sm:items-center sm:gap-4">
                  <div className="sm:col-span-5">
                    <p className="text-sm font-medium text-ink-900">{t.description}</p>
                    <p className="font-mono text-xs text-navy-400">{t.transactionId}</p>
                  </div>
                  <p className="text-sm capitalize text-navy-500 sm:col-span-2">{t.category}</p>
                  <p className="text-sm text-navy-500 sm:col-span-2">{formatDateTime(t.createdAt)}</p>
                  <div className="sm:col-span-1"><StatusBadge status={t.status} /></div>
                  <p className={`stat-figure text-right text-sm font-semibold sm:col-span-2 ${isCredit(t.type) ? 'text-sage-600' : 'text-ink-900'}`}>
                    {isCredit(t.type) ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                </div>
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-navy-100 px-5 py-3">
                <p className="text-xs text-navy-400">Page {pagination.page} of {pagination.pages}</p>
                <div className="flex gap-2">
                  <button disabled={pagination.page <= 1} onClick={() => fetchTransactions(pagination.page - 1)} className="btn-ghost !px-3 !py-1.5 text-xs disabled:opacity-40">Previous</button>
                  <button disabled={pagination.page >= pagination.pages} onClick={() => fetchTransactions(pagination.page + 1)} className="btn-ghost !px-3 !py-1.5 text-xs disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {accounts.length > 0 && (
        <>
          <TransferModal isOpen={transferOpen} onClose={closeTransfer} accounts={accounts} onSuccess={() => fetchTransactions(1)} />
          <DepositWithdrawModal isOpen={!!depositMode} onClose={() => setDepositMode(null)} accounts={accounts} mode={depositMode} onSuccess={() => fetchTransactions(1)} />
        </>
      )}
    </div>
  );
};

export default TransactionsPage;
