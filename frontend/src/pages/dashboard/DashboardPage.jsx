import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, ArrowRight, Plus, Send } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { accountService, transactionService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/format';
import StatCard from '../../components/dashboard/StatCard';
import AccountCard from '../../components/dashboard/AccountCard';
import TransactionRow from '../../components/dashboard/TransactionRow';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const COLORS = ['#1F3760', '#CDA047', '#4F9C6A', '#C2512F', '#5A7FB5', '#96702E'];

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({ categoryBreakdown: [], monthlyTrend: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, accountsRes, txnRes, analyticsRes] = await Promise.all([
          accountService.getSummary(),
          accountService.getAccounts(),
          transactionService.getTransactions({ limit: 5 }),
          transactionService.getSpendingAnalytics({ months: 6 }),
        ]);
        setSummary(summaryRes.data.data);
        setAccounts(accountsRes.data.data);
        setTransactions(txnRes.data.data);
        setAnalytics(analyticsRes.data.data);
      } catch {
        // silent fail, page shows empty states
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner full />;

  const pieData = analytics.categoryBreakdown.slice(0, 6).map((c) => ({ name: c._id, value: c.total }));

  return (
    <div className="animate-fade-up space-y-6">
      {user?.kycStatus !== 'verified' && (
        <div className="flex items-center justify-between rounded-xl2 border border-gold-200 bg-gold-50 px-5 py-3.5">
          <p className="text-sm text-ink-800">
            <strong className="font-semibold">Complete your KYC</strong> to unlock higher transaction limits and loans.
          </p>
          <Link to="/settings?tab=kyc" className="shrink-0 text-sm font-semibold text-navy-800 hover:underline">Complete now →</Link>
        </div>
      )}

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Overview</h1>
        <p className="mt-1 text-sm text-navy-400">Here's what's happening across your accounts.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Balance" value={formatCurrency(summary?.totalBalance)} icon={Wallet} accent="navy" />
        <StatCard label="Income (this month)" value={formatCurrency(summary?.monthlyIncome)} icon={TrendingUp} accent="sage" />
        <StatCard label="Spending (this month)" value={formatCurrency(summary?.monthlyExpense)} icon={TrendingDown} accent="rust" />
      </div>

      {/* Quick actions */}
      <div className="card flex flex-wrap items-center gap-3 p-5">
        <Link to="/transactions?action=transfer" className="btn-primary">
          <Send className="h-4 w-4" /> Transfer money
        </Link>
        <Link to="/accounts?action=new" className="btn-secondary">
          <Plus className="h-4 w-4" /> Open account
        </Link>
        <Link to="/loans?action=apply" className="btn-secondary">Apply for a loan</Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Accounts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-900">Your accounts</h2>
            <Link to="/accounts" className="flex items-center gap-1 text-sm font-medium text-navy-500 hover:text-navy-700">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {accounts.length === 0 ? (
            <div className="card"><EmptyState icon={Wallet} title="No accounts yet" message="Open your first account to get started." /></div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {accounts.slice(0, 4).map((acc) => <AccountCard key={acc._id} account={acc} />)}
            </div>
          )}

          {/* Monthly trend chart */}
          {analytics.monthlyTrend.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-4 font-display text-base font-semibold text-ink-900">Spending trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={buildTrendData(analytics.monthlyTrend)}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1F3760" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#1F3760" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5A7FB5' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#5A7FB5' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 8, border: '1px solid #D8E1F0', fontSize: 13 }} />
                  <Area type="monotone" dataKey="spending" stroke="#1F3760" strokeWidth={2} fill="url(#colorSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Sidebar: recent transactions + category chart */}
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-ink-900">Recent activity</h3>
              <Link to="/transactions" className="text-xs font-medium text-navy-500 hover:text-navy-700">See all</Link>
            </div>
            {transactions.length === 0 ? (
              <p className="py-6 text-center text-sm text-navy-400">No transactions yet</p>
            ) : (
              <div className="divide-y divide-navy-50">
                {transactions.map((t) => <TransactionRow key={t._id} transaction={t} />)}
              </div>
            )}
          </div>

          {pieData.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-2 font-display text-base font-semibold text-ink-900">Spending by category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {pieData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 8, border: '1px solid #D8E1F0', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {pieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 capitalize text-navy-500">
                      <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {entry.name}
                    </span>
                    <span className="font-medium text-ink-800">{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function buildTrendData(monthlyTrend) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const map = {};
  monthlyTrend.forEach((item) => {
    const key = `${monthNames[item._id.month - 1]}`;
    if (!map[key]) map[key] = { month: key, spending: 0 };
    if (['debit', 'payment', 'withdrawal', 'transfer'].includes(item._id.type)) {
      map[key].spending += item.total;
    }
  });
  return Object.values(map);
}

export default DashboardPage;
