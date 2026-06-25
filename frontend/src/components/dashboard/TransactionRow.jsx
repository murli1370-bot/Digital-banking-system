import { ArrowDownLeft, ArrowUpRight, Landmark, CreditCard, RefreshCcw } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

const typeIcons = {
  credit: ArrowDownLeft, deposit: ArrowDownLeft, refund: ArrowDownLeft, interest: ArrowDownLeft,
  debit: ArrowUpRight, withdrawal: ArrowUpRight, payment: ArrowUpRight, fee: ArrowUpRight,
  transfer: RefreshCcw, loan_disbursement: Landmark, loan_repayment: Landmark,
};

const isCredit = (type) => ['credit', 'deposit', 'refund', 'interest', 'loan_disbursement'].includes(type);

const TransactionRow = ({ transaction }) => {
  const Icon = typeIcons[transaction.type] || RefreshCcw;
  const credit = isCredit(transaction.type);

  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${credit ? 'bg-sage-50 text-sage-500' : 'bg-rust-50 text-rust-500'}`}>
          <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-900">{transaction.description}</p>
          <p className="text-xs text-navy-400">{formatDate(transaction.createdAt)} · {transaction.transactionId}</p>
        </div>
      </div>
      <p className={`shrink-0 stat-figure text-sm font-semibold ${credit ? 'text-sage-600' : 'text-ink-900'}`}>
        {credit ? '+' : '-'}{formatCurrency(transaction.amount)}
      </p>
    </div>
  );
};

export default TransactionRow;
