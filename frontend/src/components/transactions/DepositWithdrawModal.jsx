import { useState } from 'react';
import toast from 'react-hot-toast';
import { transactionService } from '../../services';
import Modal from '../common/Modal';

const DepositWithdrawModal = ({ isOpen, onClose, accounts, mode, onSuccess }) => {
  const [form, setForm] = useState({ accountId: accounts[0]?._id || '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (mode === 'deposit') await transactionService.deposit(payload);
      else await transactionService.withdraw(payload);
      toast.success(`${mode === 'deposit' ? 'Deposit' : 'Withdrawal'} successful`);
      onSuccess();
      onClose();
      setForm({ accountId: accounts[0]?._id || '', amount: '', description: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || `${mode === 'deposit' ? 'Deposit' : 'Withdrawal'} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'deposit' ? 'Deposit funds' : 'Withdraw funds'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">Account</label>
          <select required value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} className="input-field">
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>{acc.accountType} •••• {acc.accountNumber.slice(-4)} — ₹{acc.balance.toLocaleString()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="input-label">Amount (₹)</label>
          <input required type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" placeholder="0.00" />
        </div>
        <div>
          <label className="input-label">Note (optional)</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Add a note" maxLength={200} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Processing...' : mode === 'deposit' ? 'Deposit' : 'Withdraw'}
        </button>
      </form>
    </Modal>
  );
};

export default DepositWithdrawModal;
