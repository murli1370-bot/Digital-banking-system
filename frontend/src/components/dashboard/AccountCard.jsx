import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { formatCurrency, maskAccountNumber } from '../../utils/format';
import StatusBadge from '../common/StatusBadge';

const typeLabels = {
  savings: 'Savings Account',
  checking: 'Checking Account',
  fixed_deposit: 'Fixed Deposit',
  recurring_deposit: 'Recurring Deposit',
};

const AccountCard = ({ account, linkable = true }) => {
  const content = (
    <div className="card group relative overflow-hidden p-5 transition-shadow hover:shadow-card-hover">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-navy-50 transition-transform group-hover:scale-110" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-navy-400">{typeLabels[account.accountType] || account.accountType}</p>
          <StatusBadge status={account.status} />
        </div>
        <p className="mt-3 font-mono text-sm text-navy-400">{maskAccountNumber(account.accountNumber)}</p>
        <p className="stat-figure mt-1 text-2xl font-semibold text-ink-900">{formatCurrency(account.balance)}</p>
        <div className="mt-4 flex items-center justify-between border-t border-navy-50 pt-3">
          <span className="text-xs text-navy-400">{account.isPrimary ? 'Primary account' : account.branch?.name || 'Main Branch'}</span>
          {linkable && <ChevronRight className="h-4 w-4 text-navy-300 transition-transform group-hover:translate-x-0.5" />}
        </div>
      </div>
    </div>
  );

  return linkable ? <Link to={`/accounts/${account._id}`}>{content}</Link> : content;
};

export default AccountCard;
