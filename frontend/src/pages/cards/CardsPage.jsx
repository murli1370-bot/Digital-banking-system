import { useState, useEffect } from 'react';
import { CreditCard, Plus, Lock, Unlock, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cardService, accountService } from '../../services';
import CardVisual from '../../components/cards/CardVisual';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/format';

const CardsPage = () => {
  const [cards, setCards] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [pinModalCard, setPinModalCard] = useState(null);
  const [limitsCard, setLimitsCard] = useState(null);
  const [form, setForm] = useState({ accountId: '', cardType: 'debit', cardNetwork: 'visa', isVirtualCard: false });
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [cardsRes, accountsRes] = await Promise.all([cardService.getCards(), accountService.getAccounts()]);
      setCards(cardsRes.data.data);
      setAccounts(accountsRes.data.data);
      if (accountsRes.data.data.length) setForm((f) => ({ ...f, accountId: accountsRes.data.data[0]._id }));
    } catch {
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await cardService.createCard(form);
      toast.success('Card issued successfully');
      setCreateOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue card');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (card) => {
    try {
      await cardService.activate(card._id);
      toast.success('Card activated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Activation failed');
    }
  };

  const handleBlock = async (card) => {
    if (!window.confirm('Block this card? You can issue a new one anytime.')) return;
    try {
      await cardService.block(card._id, 'User requested block');
      toast.success('Card blocked');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to block card');
    }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) return toast.error('PIN must be 4 digits');
    try {
      await cardService.setPin(pinModalCard._id, pin);
      toast.success('PIN set successfully');
      setPinModalCard(null);
      setPin('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set PIN');
    }
  };

  const toggleLimit = async (card, field) => {
    try {
      const res = await cardService.updateLimits(card._id, { [field]: !card[field] });
      setCards((prev) => prev.map((c) => (c._id === card._id ? res.data.data : c)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  if (loading) return <LoadingSpinner full />;

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Cards</h1>
          <p className="mt-1 text-sm text-navy-400">Manage your debit and credit cards.</p>
        </div>
        <button
          onClick={() => accounts.length ? setCreateOpen(true) : toast.error('Open an account first')}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> Issue new card
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="card"><EmptyState icon={CreditCard} title="No cards yet" message="Issue a debit or credit card linked to your account." /></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <div key={card._id} className="space-y-3">
              <CardVisual card={card} />
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <StatusBadge status={card.status} />
                  {card.cardType === 'credit' && <p className="text-xs text-navy-400">Limit: {formatCurrency(card.creditLimit)}</p>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {card.status === 'inactive' && (
                    <button onClick={() => handleActivate(card)} className="btn-secondary !py-1.5 !text-xs"><Unlock className="h-3.5 w-3.5" /> Activate</button>
                  )}
                  {card.status === 'active' && (
                    <>
                      <button onClick={() => setPinModalCard(card)} className="btn-secondary !py-1.5 !text-xs">Set PIN</button>
                      <button onClick={() => setLimitsCard(card)} className="btn-secondary !py-1.5 !text-xs"><Settings2 className="h-3.5 w-3.5" /> Controls</button>
                      <button onClick={() => handleBlock(card)} className="btn-secondary !py-1.5 !text-xs text-rust-500"><Lock className="h-3.5 w-3.5" /> Block</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create card modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Issue a new card">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="input-label">Linked account</label>
            <select required value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })} className="input-field">
              {accounts.map((acc) => <option key={acc._id} value={acc._id}>•••• {acc.accountNumber.slice(-4)}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Card type</label>
            <select value={form.cardType} onChange={(e) => setForm({ ...form, cardType: e.target.value })} className="input-field">
              <option value="debit">Debit Card</option>
              <option value="credit">Credit Card</option>
              <option value="prepaid">Prepaid Card</option>
            </select>
          </div>
          <div>
            <label className="input-label">Card network</label>
            <select value={form.cardNetwork} onChange={(e) => setForm({ ...form, cardNetwork: e.target.value })} className="input-field">
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="rupay">RuPay</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-800">
            <input type="checkbox" checked={form.isVirtualCard} onChange={(e) => setForm({ ...form, isVirtualCard: e.target.checked })} />
            Issue as virtual card (instant, no physical delivery)
          </label>
          <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Issuing...' : 'Issue card'}</button>
        </form>
      </Modal>

      {/* Set PIN modal */}
      <Modal isOpen={!!pinModalCard} onClose={() => setPinModalCard(null)} title="Set card PIN">
        <form onSubmit={handleSetPin} className="space-y-4">
          <div>
            <label className="input-label">4-digit PIN</label>
            <input
              required maxLength={4} pattern="\d{4}" value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="input-field text-center font-mono text-lg tracking-[0.5em]" placeholder="••••"
            />
          </div>
          <button type="submit" className="btn-primary w-full">Set PIN</button>
        </form>
      </Modal>

      {/* Card controls modal */}
      <Modal isOpen={!!limitsCard} onClose={() => setLimitsCard(null)} title="Card controls">
        {limitsCard && (
          <div className="space-y-3">
            {[
              ['isOnlineTxnEnabled', 'Online transactions'],
              ['isInternationalEnabled', 'International usage'],
              ['isContactless', 'Contactless payments'],
            ].map(([field, label]) => (
              <label key={field} className="flex items-center justify-between rounded-lg border border-navy-100 px-4 py-3">
                <span className="text-sm text-ink-800">{label}</span>
                <input
                  type="checkbox" checked={limitsCard[field]}
                  onChange={async () => { await toggleLimit(limitsCard, field); setLimitsCard((c) => ({ ...c, [field]: !c[field] })); }}
                  className="h-4 w-4 accent-navy-700"
                />
              </label>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CardsPage;
