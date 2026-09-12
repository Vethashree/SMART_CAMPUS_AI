import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../app/providers/PreferencesProvider';

export default function TrackingPage() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const lastTicketId = localStorage.getItem('ics.lastTicketId');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim().toUpperCase();
    if (trimmed) navigate(`/track/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">{t('tracking.lookupHeading')}</h1>

      <form onSubmit={submit} className="mt-4 flex flex-col sm:flex-row gap-2">
        <label htmlFor="ticket-lookup" className="visually-hidden">
          {t('tracking.lookupPlaceholder')}
        </label>
        <input
          id="ticket-lookup"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('tracking.lookupPlaceholder')}
          className="flex-1 rounded border px-3 py-2 min-h-touch"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
        />
        <button type="submit" className="btn btn-primary">
          {t('tracking.lookupCta')}
        </button>
      </form>

      {lastTicketId && (
        <div className="card p-4 mt-6">
          <p className="text-sm text-text-muted">{t('tracking.heading')}</p>
          <button
            type="button"
            className="font-semibold no-underline mt-1"
            style={{ color: 'var(--color-accent)' }}
            onClick={() => navigate(`/track/${encodeURIComponent(lastTicketId)}`)}
          >
            {lastTicketId}
          </button>
        </div>
      )}
    </div>
  );
}
