import { useState } from 'react';
import toast from 'react-hot-toast';
import { transactionService } from '../../services';
import Modal from '../common/Modal';

const categories = ['food', 'shopping', 'utilities', 'entertainment', 'healthcare', 'education', 'travel', 'salary', 'investment', 'other'];

const TransferModal = ({ isOpen, onClose, accounts, onSuccess }) => {
  const [form, setForm] = useState({ fromAccountId: accounts[0]?._id || '', toAccountNumber: '', amount: '', description: '', category: 'other' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transactionService.transfer({ ...form, amount: parseFloat(form.amount) });
      toast.success('Transfer completed successfully');
      onSuccess();
      onClose();
      setForm({ fromAccountId: accounts[0]?._id || '', toAccountNumber: '', amount: '', description: '', category: 'other' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer money">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">From account</label>
          <select required value={form.fromAccountId} onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })} className="input-field">
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>{acc.accountType} •••• {acc.accountNumber.slice(-4)} — ₹{acc.balance.toLocaleString()}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="input-label">Recipient account number</label>
          <input required value={form.toAccountNumber} onChange={(e) => setForm({ ...form, toAccountNumber: e.target.value.replace(/\D/g, '') })} className="input-field" placeholder="Enter 12-digit account number" />
        </div>
        <div>
          <label className="input-label">Amount (₹)</label>
          <input required type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" placeholder="0.00" />
        </div>
        <div>
          <label className="input-label">Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field capitalize">
            {categories.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
        <div>
          <label className="input-label">Note (optional)</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="What's this for?" maxLength={200} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Processing...' : 'Send money'}</button>
      </form>
    </Modal>
  );
};

export default TransferModal;
