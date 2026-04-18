import { useState } from 'react';

const EMOTIONS = ['Calm', 'Anxious', 'Overconfident', 'Frustrated', 'Excited', 'Fearful', 'Neutral'];

const EMOTION_COLORS = {
  Calm: 'text-outcome-win',
  Anxious: 'text-yellow-400',
  Overconfident: 'text-orange-400',
  Frustrated: 'text-outcome-loss',
  Excited: 'text-blue-400',
  Fearful: 'text-purple-400',
  Neutral: 'text-text-secondary',
};

const EMOTION_ICONS = {
  Calm: '😌',
  Anxious: '😰',
  Overconfident: '😤',
  Frustrated: '😠',
  Excited: '🤩',
  Fearful: '😨',
  Neutral: '😐',
};

export default function ReflectionForm({ onSubmit, loading = false, onCancel }) {
  const [form, setForm] = useState({
    emotionalState: 'Calm',
    whatWentWell: '',
    whatCouldImprove: '',
    lessonLearned: '',
  });

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      emotionalState: form.emotionalState || null,
      whatWentWell: form.whatWentWell || null,
      whatCouldImprove: form.whatCouldImprove || null,
      lessonLearned: form.lessonLearned || null,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Emotional state picker */}
      <div className="mb-5">
        <label className="label">Emotional State During Trade</label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {EMOTIONS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => setForm((f) => ({ ...f, emotionalState: em }))}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs transition-all ${
                form.emotionalState === em
                  ? 'border-accent-gold bg-accent-gold-glow text-accent-gold'
                  : 'border-bg-border bg-bg-secondary text-text-muted hover:border-bg-hover hover:text-text-secondary'
              }`}
            >
              <span className="text-lg">{EMOTION_ICONS[em]}</span>
              <span className="font-medium leading-tight text-center">{em}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Text fields */}
      <div className="space-y-4">
        <div>
          <label className="label">What went well?</label>
          <textarea className="input resize-none" rows={2}
            placeholder="Execution, patience, discipline..."
            value={form.whatWentWell} onChange={set('whatWentWell')} maxLength={1000} />
        </div>
        <div>
          <label className="label">What could be improved?</label>
          <textarea className="input resize-none" rows={2}
            placeholder="Entry timing, sizing, exit management..."
            value={form.whatCouldImprove} onChange={set('whatCouldImprove')} maxLength={1000} />
        </div>
        <div>
          <label className="label">Lesson learned</label>
          <textarea className="input resize-none" rows={2}
            placeholder="Key takeaway for future trades..."
            value={form.lessonLearned} onChange={set('lessonLearned')} maxLength={1000} />
        </div>
      </div>

      <div className="flex gap-3 mt-5 justify-end">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Reflection'}
        </button>
      </div>
    </form>
  );
}

export function ReflectionCard({ reflection }) {
  const EMOTION_ICONS = {
    Calm: '😌', Anxious: '😰', Overconfident: '😤',
    Frustrated: '😠', Excited: '🤩', Fearful: '😨', Neutral: '😐',
  };
  return (
    <div className="bg-bg-secondary rounded-lg border border-bg-border p-4 space-y-3 animate-in">
      <div className="flex items-center gap-2">
        <span className="text-xl">{EMOTION_ICONS[reflection.emotionalState] || '🙂'}</span>
        <div>
          <span className="text-sm font-medium text-text-primary">{reflection.emotionalState || 'Not specified'}</span>
          <p className="text-xs text-text-muted">
            {new Date(reflection.date || reflection.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </p>
        </div>
      </div>
      {reflection.whatWentWell && (
        <div>
          <p className="text-xs text-outcome-win font-medium uppercase tracking-wider mb-1">What went well</p>
          <p className="text-sm text-text-secondary">{reflection.whatWentWell}</p>
        </div>
      )}
      {reflection.whatCouldImprove && (
        <div>
          <p className="text-xs text-yellow-500 font-medium uppercase tracking-wider mb-1">Could improve</p>
          <p className="text-sm text-text-secondary">{reflection.whatCouldImprove}</p>
        </div>
      )}
      {reflection.lessonLearned && (
        <div>
          <p className="text-xs text-accent-gold font-medium uppercase tracking-wider mb-1">Lesson learned</p>
          <p className="text-sm text-text-secondary">{reflection.lessonLearned}</p>
        </div>
      )}
    </div>
  );
}
