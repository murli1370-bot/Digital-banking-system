import { useState, useEffect, useCallback } from 'react';
import { Calculator } from 'lucide-react';
import { loanService } from '../../services';
import { formatCurrency, debounce } from '../../utils/format';

const loanTypes = [
  { value: 'personal', label: 'Personal Loan' },
  { value: 'home', label: 'Home Loan' },
  { value: 'vehicle', label: 'Vehicle Loan' },
  { value: 'education', label: 'Education Loan' },
  { value: 'business', label: 'Business Loan' },
  { value: 'gold', label: 'Gold Loan' },
];

const EMICalculator = () => {
  const [form, setForm] = useState({ loanType: 'personal', principalAmount: 500000, tenureMonths: 36 });
  const [result, setResult] = useState(null);

  const calculate = useCallback(debounce(async (params) => {
    try {
      const res = await loanService.calculateEMI(params);
      setResult(res.data.data);
    } catch { /* silent */ }
  }, 400), []);

  useEffect(() => { calculate(form); }, [form, calculate]);

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Calculator className="h-4.5 w-4.5 text-navy-700" />
        <h3 className="font-display text-base font-semibold text-ink-900">EMI Calculator</h3>
      </div>
      <div className="space-y-4">
        <div>
          <label className="input-label">Loan type</label>
          <select value={form.loanType} onChange={(e) => setForm({ ...form, loanType: e.target.value })} className="input-field">
            {loanTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <div className="flex justify-between"><label className="input-label">Loan amount</label><span className="text-sm font-medium text-navy-700">{formatCurrency(form.principalAmount)}</span></div>
          <input type="range" min="10000" max="5000000" step="10000" value={form.principalAmount} onChange={(e) => setForm({ ...form, principalAmount: Number(e.target.value) })} className="w-full accent-navy-700" />
        </div>
        <div>
          <div className="flex justify-between"><label className="input-label">Tenure</label><span className="text-sm font-medium text-navy-700">{form.tenureMonths} months</span></div>
          <input type="range" min="6" max="240" step="6" value={form.tenureMonths} onChange={(e) => setForm({ ...form, tenureMonths: Number(e.target.value) })} className="w-full accent-navy-700" />
        </div>
      </div>
      {result && (
        <div className="mt-5 grid grid-cols-3 gap-3 rounded-lg bg-navy-50 p-4 text-center">
          <div>
            <p className="text-[11px] text-navy-400">Monthly EMI</p>
            <p className="stat-figure mt-1 text-sm font-semibold text-ink-900">{formatCurrency(result.emi)}</p>
          </div>
          <div>
            <p className="text-[11px] text-navy-400">Total Interest</p>
            <p className="stat-figure mt-1 text-sm font-semibold text-ink-900">{formatCurrency(result.totalInterest)}</p>
          </div>
          <div>
            <p className="text-[11px] text-navy-400">Interest Rate</p>
            <p className="stat-figure mt-1 text-sm font-semibold text-ink-900">{result.interestRate}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EMICalculator;
