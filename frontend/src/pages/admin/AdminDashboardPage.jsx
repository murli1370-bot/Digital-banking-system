import { useState, useEffect } from 'react';
import { Users, Wallet, Landmark, ShieldAlert, TrendingUp, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services';
import { formatCurrency, formatNumber } from '../../utils/format';
import StatCard from '../../components/dashboard/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then((res) => setStats(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner full />;

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-navy-400">Bank-wide overview and operational metrics.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Users" value={formatNumber(stats?.totalUsers)} icon={Users} accent="navy" />
        <StatCard label="Active Accounts" value={`${formatNumber(stats?.activeAccounts)} / ${formatNumber(stats?.totalAccounts)}`} icon={Wallet} accent="sage" />
        <StatCard label="Total Deposits" value={formatCurrency(stats?.totalDeposits)} icon={TrendingUp} accent="gold" />
        <StatCard label="Pending Loan Reviews" value={formatNumber(stats?.pendingLoans)} icon={Landmark} accent="rust" />
        <StatCard label="Pending KYC" value={formatNumber(stats?.pendingKyc)} icon={FileCheck} accent="gold" />
        <StatCard label="Today's Transaction Volume" value={formatCurrency(stats?.todayTxnVolume)} icon={ShieldAlert} accent="navy" trend={undefined} />
      </div>

      <div className="card p-5">
        <p className="text-sm text-navy-500"><strong className="text-ink-900">{formatNumber(stats?.todayTxnCount)}</strong> transactions processed today across the platform.</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
