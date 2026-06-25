import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services';
import { formatCurrency, formatDate, getInitials } from '../../utils/format';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const loanTypeLabels = {
  personal: 'Personal', home: 'Home', vehicle: 'Vehicle',
  education: 'Education', business: 'Business', gold: 'Gold',
};

const AdminLoansPage = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewLoan, setReviewLoan] = useState(null);
  const [reviewForm, setReviewForm] = useState({ approvedAmount: '', rejectionReason: '', adminNotes: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchLoans = useCallback(async (status = statusFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      const res = await adminService.getLoans(params);
      setLoans(res.data.data);
    } catch {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  const openReview = (loan) => {
    setReviewLoan(loan);
    setReviewForm({ approvedAmount: loan.principalAmount, rejectionReason: '', adminNotes: '' });
  };

  const handleReview = async (status) => {
    setSubmitting(true);
    try {
      await adminService.reviewLoan(reviewLoan._id, {
        status,
        approvedAmount: status === 'approved' ? parseFloat(reviewForm.approvedAmount) : undefined,
        rejectionReason: reviewForm.rejectionReason,
        adminNotes: reviewForm.adminNotes,
      });
      toast.success(`Loan ${status}`);
      setReviewLoan(null);
      fetchLoans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisburse = async (loan) => {
    if (!window.confirm(`Disburse ${formatCurrency(loan.approvedAmount)} to the borrower's account?`)) return;
    try {
      await adminService.disburseLoan(loan._id);
      toast.success('Loan disbursed successfully');
      fetchLoans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Disbursement failed');
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Loan Approvals</h1>
        <p className="mt-1 text-sm text-navy-400">Review applications, approve, and disburse funds.</p>
      </div>

      <div className="card flex flex-wrap gap-2 p-4">
        {['', 'applied', 'under_review', 'approved', 'rejected', 'active', 'closed'].map((s) => (
          <button
            key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-navy-800 text-paper' : 'bg-navy-50 text-navy-600 hover:bg-navy-100'}`}
          >
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        {loading ? <LoadingSpinner full /> : loans.length === 0 ? (
          <EmptyState title="No loans found" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-left text-xs font-semibold uppercase tracking-wide text-navy-400">
                <th className="px-5 py-3">Applicant</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Applied</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {loans.map((loan) => (
                <tr key={loan._id}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-semibold text-paper">{getInitials(loan.user?.firstName, loan.user?.lastName)}</div>
                      <div>
                        <p className="font-medium text-ink-900">{loan.user?.firstName} {loan.user?.lastName}</p>
                        <p className="text-xs text-navy-400">{loan.loanId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-navy-600">{loanTypeLabels[loan.loanType]}</td>
                  <td className="px-5 py-3.5 font-medium text-ink-800">{formatCurrency(loan.principalAmount)}</td>
                  <td className="px-5 py-3.5 text-navy-500">{formatDate(loan.createdAt)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={loan.status} /></td>
                  <td className="px-5 py-3.5 text-right">
                    {['applied', 'under_review'].includes(loan.status) && (
                      <button onClick={() => openReview(loan)} className="btn-secondary !py-1.5 !text-xs">Review</button>
                    )}
                    {loan.status === 'approved' && (
                      <button onClick={() => handleDisburse(loan)} className="btn-primary !py-1.5 !text-xs">Disburse</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={!!reviewLoan} onClose={() => setReviewLoan(null)} title="Review loan application">
        {reviewLoan && (
          <div className="space-y-4">
            <div className="rounded-lg bg-navy-50 p-3 text-sm text-navy-600">
              <p><strong className="text-ink-900">{reviewLoan.user?.firstName} {reviewLoan.user?.lastName}</strong> requested {formatCurrency(reviewLoan.principalAmount)}</p>
              <p className="mt-1 text-xs">Purpose: {reviewLoan.purpose} · Income: {formatCurrency(reviewLoan.monthlyIncome)}/mo · Credit score: {reviewLoan.creditScore}</p>
            </div>
            <div>
              <label className="input-label">Approved amount (₹)</label>
              <input type="number" value={reviewForm.approvedAmount} onChange={(e) => setReviewForm({ ...reviewForm, approvedAmount: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="input-label">Admin notes</label>
              <textarea value={reviewForm.adminNotes} onChange={(e) => setReviewForm({ ...reviewForm, adminNotes: e.target.value })} className="input-field" rows={2} />
            </div>
            <div>
              <label className="input-label">Rejection reason (if rejecting)</label>
              <input value={reviewForm.rejectionReason} onChange={(e) => setReviewForm({ ...reviewForm, rejectionReason: e.target.value })} className="input-field" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleReview('rejected')} disabled={submitting} className="btn-danger flex-1">Reject</button>
              <button onClick={() => handleReview('approved')} disabled={submitting} className="btn-primary flex-1">Approve</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminLoansPage;
