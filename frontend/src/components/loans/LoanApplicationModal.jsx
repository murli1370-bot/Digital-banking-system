import { useState } from 'react';
import toast from 'react-hot-toast';
import { loanService } from '../../services';
import Modal from '../common/Modal';

const loanTypes = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'home', label: 'Home Loan' },
  { value: 'vehicle', label: 'Vehicle Loan' },
  { value: 'education', label: 'Education Loan' },
  { value: 'business', label: 'Business Loan' },
  { value: 'gold', label: 'Gold Loan' },
];

const LoanApplicationModal = ({ isOpen, onClose, accounts, onSuccess }) => {
  const [form, setForm] = useState({
    accountId: accounts[0]?._id || '', loanType: 'personal', principalAmount: '',
    tenureMonths: 36, purpose: '', employmentType: 'salaried', monthlyIncome: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loanService.apply({
        ...form,
        principalAmount: parseFloat(form.principalAmount),
        tenureMonths: parseInt(form.tenureMonths),
        monthlyIncome: parseFloat(form.monthlyIncome),
      });
      toast.success('Loan application submitted for review');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for a loan" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">Loan type</label>
            <select value={form.loanType} onChange={(e) => setForm({ ...form, loanType: e.target.value })} className="input-field">
              {loanTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Disbursement account</label>
            <select required value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} className="input-field">
              {accounts.map((acc) => <option key={acc._id} value={acc._id}>•••• {acc.accountNumber.slice(-4)}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">Amount needed (₹)</label>
            <input required type="number" min="1000" value={form.principalAmount} onChange={(e) => setForm({ ...form, principalAmount: e.target.value })} className="input-field" placeholder="500000" />
          </div>
          <div>
            <label className="input-label">Tenure (months)</label>
            <input required type="number" min="6" max="360" value={form.tenureMonths} onChange={(e) => setForm({ ...form, tenureMonths: e.target.value })} className="input-field" />
          </div>
        </div>
        <div>
          <label className="input-label">Purpose</label>
          <input required value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="input-field" placeholder="e.g. Home renovation" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="input-label">Employment type</label>
            <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })} className="input-field">
              <option value="salaried">Salaried</option>
              <option value="self_employed">Self-employed</option>
              <option value="business">Business owner</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div>
            <label className="input-label">Monthly income (₹)</label>
            <input required type="number" min="0" value={form.monthlyIncome} onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })} className="input-field" placeholder="50000" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Submitting...' : 'Submit application'}</button>
      </form>
    </Modal>
  );
};

export default LoanApplicationModal;
