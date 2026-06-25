import { formatCurrency, formatDate } from '../../utils/format';
import StatusBadge from '../common/StatusBadge';

const loanTypeLabels = {
  personal: 'Personal Loan', home: 'Home Loan', vehicle: 'Vehicle Loan',
  education: 'Education Loan', business: 'Business Loan', gold: 'Gold Loan',
};

const LoanCard = ({ loan, onRepay }) => {
  const progress = loan.disbursedAmount > 0 ? Math.round(((loan.disbursedAmount - loan.outstandingBalance) / loan.disbursedAmount) * 100) : 0;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-base font-semibold text-ink-900">{loanTypeLabels[loan.loanType]}</p>
          <p className="mt-0.5 font-mono text-xs text-navy-400">{loan.loanId}</p>
        </div>
        <StatusBadge status={loan.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-navy-400">Principal</p>
          <p className="mt-0.5 font-medium text-ink-800">{formatCurrency(loan.principalAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-navy-400">Interest Rate</p>
          <p className="mt-0.5 font-medium text-ink-800">{loan.interestRate}%</p>
        </div>
        <div>
          <p className="text-xs text-navy-400">EMI</p>
          <p className="mt-0.5 font-medium text-ink-800">{formatCurrency(loan.emiAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-navy-400">Tenure</p>
          <p className="mt-0.5 font-medium text-ink-800">{loan.tenureMonths} months</p>
        </div>
      </div>

      {['active', 'disbursed'].includes(loan.status) && (
        <>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-navy-400">
              <span>Outstanding: {formatCurrency(loan.outstandingBalance)}</span>
              <span>{progress}% repaid</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-navy-100">
              <div className="h-full rounded-full bg-sage-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button onClick={() => onRepay(loan)} className="btn-primary mt-4 w-full">Pay EMI — {formatCurrency(loan.emiAmount)}</button>
        </>
      )}

      {loan.status === 'rejected' && loan.rejectionReason && (
        <p className="mt-3 rounded-lg bg-rust-50 px-3 py-2 text-xs text-rust-600">{loan.rejectionReason}</p>
      )}
      {['applied', 'under_review'].includes(loan.status) && (
        <p className="mt-3 text-xs text-navy-400">Applied on {formatDate(loan.createdAt)} · Awaiting review</p>
      )}
    </div>
  );
};

export default LoanCard;
