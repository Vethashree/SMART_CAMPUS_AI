import { useState } from 'react';
import { Star } from 'lucide-react';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import { ticketRepository } from '../../../repositories';
import type { Ticket } from '../../../domain/tickets/Ticket';

export default function FeedbackForm({
  ticket,
  onSubmitted,
}: {
  ticket: Ticket;
  onSubmitted: (ticket: Ticket) => void;
}) {
  const { t } = usePreferences();
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState('');
  const [firstContact, setFirstContact] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (ticket.feedback) {
    return <p className="text-sm text-text-muted mt-2">{t('tracking.feedbackThanks')}</p>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const updated = await ticketRepository.submitFeedback({
      ticketId: ticket.ticketId,
      rating,
      comment: comment.trim() || undefined,
      firstContactResolution: firstContact,
    });
    setSubmitting(false);
    onSubmitted(updated);
  };

  return (
    <form onSubmit={submit} className="card p-4 mt-3 space-y-4">
      <div role="radiogroup" aria-label={t('tracking.feedbackHeading')} className="flex gap-1">
        {([1, 2, 3, 4, 5] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={String(value)}
            onClick={() => setRating(value)}
            className="min-h-touch min-w-touch flex items-center justify-center"
          >
            <Star
              className="w-6 h-6"
              fill={value <= rating ? 'var(--color-accent)' : 'none'}
              style={{ color: 'var(--color-accent)' }}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={firstContact} onChange={(e) => setFirstContact(e.target.checked)} className="w-5 h-5" />
        <span className="text-sm">{t('tracking.firstContact')}</span>
      </label>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full rounded border px-3 py-2"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      />

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? t('common.loading') : t('tracking.feedbackSubmit')}
      </button>
    </form>
  );
}
