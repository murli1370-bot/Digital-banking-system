import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Landmark, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { loanService, accountService } from '../../services';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import EMICalculator from '../../components/loans/EMICalculator';
import LoanApplicationModal from '../../components/loans/LoanApplicationModal';
import LoanCard from '../../components/loans/LoanCard';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/format';

const LoansPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loans, setLoans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(searchParams.get('action') === 'apply');
  const [repayLoan, setRepayLoan] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repaying, setRepaying] = useState(false);

  const fetchData = async () => {
    try {
      const [loansRes, accountsRes] = await Promise.all([loanService.getLoans(), accountService.getAccounts()]);
      setLoans(loansRes.data.data);
      setAccounts(accountsRes.data.data);
    } catch {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const closeApply = () => {
    setApplyOpen(false);
    searchParams.delete('action');
    setSearchParams(searchParams);
  };

  const openRepay = (loan) => {
    setRepayLoan(loan);
    setRepayAmount(loan.emiAmount.toString());
  };

  const handleRepay = async (e) => {
    e.preventDefault();
    setRepaying(true);
    try {
      await loanService.repay(repayLoan._id, { amount: parseFloat(repayAmount) });
      toast.success('EMI paid successfully');
      setRepayLoan(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setRepaying(false);
    }
  };

  if (loading) return <LoadingSpinner full />;

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Loans</h1>
          <p className="mt-1 text-sm text-navy-400">Apply for loans and track your repayments.</p>
        </div>
        <button
          onClick={() => accounts.length ? setApplyOpen(true) : toast.error('Open an account first')}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> Apply for loan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {loans.length === 0 ? (
            <div className="card">
              <EmptyState icon={Landmark} title="No loans yet" message="Apply for a personal, home, vehicle, or education loan." />
            </div>
          ) : (
            loans.map((loan) => <LoanCard key={loan._id} loan={loan} onRepay={openRepay} />)
          )}
        </div>
        <div><EMICalculator /></div>
      </div>

      {accounts.length > 0 && (
        <LoanApplicationModal isOpen={applyOpen} onClose={closeApply} accounts={accounts} onSuccess={fetchData} />
      )}

      <Modal isOpen={!!repayLoan} onClose={() => setRepayLoan(null)} title="Pay EMI">
        {repayLoan && (
          <form onSubmit={handleRepay} className="space-y-4">
            <div className="rounded-lg bg-navy-50 p-3 text-sm text-navy-600">
              Outstanding balance: <strong className="text-ink-900">{formatCurrency(repayLoan.outstandingBalance)}</strong>
            </div>
            <div>
              <label className="input-label">Payment amount (₹)</label>
              <input required type="number" min="1" value={repayAmount} onChange={(e) => setRepayAmount(e.target.value)} className="input-field" />
              <p className="mt-1 text-xs text-navy-400">Suggested EMI: {formatCurrency(repayLoan.emiAmount)}</p>
            </div>
            <button type="submit" disabled={repaying} className="btn-primary w-full">{repaying ? 'Processing...' : 'Pay now'}</button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default LoansPage;
