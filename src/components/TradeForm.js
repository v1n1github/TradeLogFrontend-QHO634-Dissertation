import { useState, useEffect } from 'react';

const INITIAL = {
  date: new Date().toISOString().split('T')[0],
  instrument: '',
  direction: 'Long',
  entryPrice: '',
  stopLoss: '',
  takeProfit: '',
  riskPercent: '',
  riskRewardRatio: '',
  outcome: 'Win',
  actualPnL: '',
  ruleAdherence: false,
  notes: '',
};

function Field({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default function TradeForm({ initialValues = {}, onSubmit, loading = false, submitLabel = 'Save Trade' }) {
  const [form, setForm] = useState({ ...INITIAL, ...initialValues });
  const [errors, setErrors] = useState({});

  // Auto-calculate RR when entry, SL, TP change
  useEffect(() => {
    const entry = parseFloat(form.entryPrice);
    const sl = parseFloat(form.stopLoss);
    const tp = parseFloat(form.takeProfit);
    if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp) && sl !== entry) {
      const slDist = Math.abs(entry - sl);
      const tpDist = Math.abs(tp - entry);
      if (slDist > 0) {
        const rr = (tpDist / slDist).toFixed(2);
        setForm((f) => ({ ...f, riskRewardRatio: rr }));
      }
    }
  }, [form.entryPrice, form.stopLoss, form.takeProfit]);

  function set(field) {
    return (e) => {
      const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: val }));
      if (errors[field]) setErrors((er) => { const n = { ...er }; delete n[field]; return n; });
    };
  }

  function validate() {
    const e = {};
    if (!form.date) e.date = 'Date is required';
    if (!form.instrument.trim()) e.instrument = 'Instrument is required';
    if (!form.direction) e.direction = 'Direction is required';
    if (!form.entryPrice || isNaN(+form.entryPrice) || +form.entryPrice <= 0) e.entryPrice = 'Valid entry price required';
    if (!form.stopLoss || isNaN(+form.stopLoss) || +form.stopLoss <= 0) e.stopLoss = 'Valid stop loss required';
    if (form.takeProfit && (isNaN(+form.takeProfit) || +form.takeProfit <= 0)) e.takeProfit = 'Must be a positive number';
    if (!form.riskPercent || isNaN(+form.riskPercent) || +form.riskPercent <= 0) e.riskPercent = 'Risk % must be > 0';
    if (+form.riskPercent > 100) e.riskPercent = 'Risk % cannot exceed 100';
    if (!form.outcome) e.outcome = 'Outcome is required';
    if (form.actualPnL && isNaN(+form.actualPnL)) e.actualPnL = 'Must be a number';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      date: form.date,
      instrument: form.instrument.trim().toUpperCase(),
      direction: form.direction,
      entryPrice: parseFloat(form.entryPrice),
      stopLoss: parseFloat(form.stopLoss),
      takeProfit: form.takeProfit ? parseFloat(form.takeProfit) : null,
      riskPercent: parseFloat(form.riskPercent),
      riskRewardRatio: form.riskRewardRatio ? parseFloat(form.riskRewardRatio) : null,
      outcome: form.outcome,
      actualPnL: form.actualPnL !== '' ? parseFloat(form.actualPnL) : null,
      ruleAdherence: Boolean(form.ruleAdherence),
      notes: form.notes || null,
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <Field label="Trade Date" error={errors.date}>
          <input type="date" className={`input ${errors.date ? 'input-error' : ''}`}
            value={form.date} onChange={set('date')} />
        </Field>

        {/* Instrument */}
        <Field label="Instrument" error={errors.instrument}>
          <input type="text" placeholder="e.g. EUR/USD, XAUUSD, AAPL"
            className={`input ${errors.instrument ? 'input-error' : ''}`}
            value={form.instrument} onChange={set('instrument')} maxLength={20} />
        </Field>

        {/* Direction */}
        <Field label="Direction" error={errors.direction}>
          <select className={`input ${errors.direction ? 'input-error' : ''}`}
            value={form.direction} onChange={set('direction')}>
            <option value="Long">Long ↑</option>
            <option value="Short">Short ↓</option>
          </select>
        </Field>

        {/* Outcome */}
        <Field label="Outcome" error={errors.outcome}>
          <select className={`input ${errors.outcome ? 'input-error' : ''}`}
            value={form.outcome} onChange={set('outcome')}>
            <option value="Win">Win ✓</option>
            <option value="Loss">Loss ✗</option>
            <option value="Breakeven">Breakeven ≈</option>
          </select>
        </Field>

        {/* Entry Price */}
        <Field label="Entry Price" error={errors.entryPrice}>
          <input type="number" step="any" placeholder="0.00"
            className={`input num ${errors.entryPrice ? 'input-error' : ''}`}
            value={form.entryPrice} onChange={set('entryPrice')} />
        </Field>

        {/* Stop Loss */}
        <Field label="Stop Loss (SL)" error={errors.stopLoss}>
          <input type="number" step="any" placeholder="0.00"
            className={`input num ${errors.stopLoss ? 'input-error' : ''}`}
            value={form.stopLoss} onChange={set('stopLoss')} />
        </Field>

        {/* Take Profit */}
        <Field label="Take Profit (TP) — Optional" error={errors.takeProfit}>
          <input type="number" step="any" placeholder="0.00 (optional)"
            className={`input num ${errors.takeProfit ? 'input-error' : ''}`}
            value={form.takeProfit} onChange={set('takeProfit')} />
        </Field>

        {/* Risk % */}
        <Field label="Risk % of Account" error={errors.riskPercent}>
          <div className="relative">
            <input type="number" step="0.1" placeholder="1.0"
              className={`input num pr-8 ${errors.riskPercent ? 'input-error' : ''}`}
              value={form.riskPercent} onChange={set('riskPercent')} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">%</span>
          </div>
        </Field>

        {/* RR Ratio (auto-calculated) */}
        <Field label="Risk-Reward Ratio (auto)">
          <div className="relative">
            <input type="number" step="0.01" placeholder="Auto-calculated"
              className="input num"
              value={form.riskRewardRatio} onChange={set('riskRewardRatio')} />
            {form.riskRewardRatio && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs">R</span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">Calculated from SL/TP. You can override.</p>
        </Field>

        {/* Actual P&L */}
        <Field label="Actual P&L — Optional" error={errors.actualPnL}>
          <input type="number" step="any" placeholder="e.g. 250.00 or -100.00"
            className={`input num ${errors.actualPnL ? 'input-error' : ''}`}
            value={form.actualPnL} onChange={set('actualPnL')} />
        </Field>
      </div>

      {/* Rule Adherence */}
      <div className="mt-4 p-4 bg-bg-secondary rounded-lg border border-bg-border">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input type="checkbox" className="mt-0.5"
            checked={form.ruleAdherence} onChange={set('ruleAdherence')} />
          <div>
            <span className="text-sm font-medium text-text-primary group-hover:text-accent-gold transition-colors">
              Rule Adherence
            </span>
            <p className="text-xs text-text-muted mt-0.5">
              This trade followed my predefined trading rules (correct SL placement, position size, entry criteria).
            </p>
          </div>
        </label>
      </div>

      {/* Notes */}
      <div className="mt-4">
        <label className="label">Notes — Optional</label>
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="Trade rationale, market context, observations..."
          value={form.notes}
          onChange={set('notes')}
          maxLength={1000}
        />
        <p className="text-xs text-text-muted mt-1 text-right">{form.notes.length}/1000</p>
      </div>

      {/* Submit */}
      <div className="mt-6 flex gap-3 justify-end">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : submitLabel}
        </button>
      </div>
    </form>
  );
}
