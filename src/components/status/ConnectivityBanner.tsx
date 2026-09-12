import { WifiOff } from 'lucide-react';
import { usePreferences } from '../../app/providers/PreferencesProvider';
import { useOfflineQueue } from '../../app/providers/OfflineQueueProvider';

export default function ConnectivityBanner() {
  const { t } = usePreferences();
  const { isOnline, pending } = useOfflineQueue();

  if (isOnline && pending.length === 0) return null;

  return (
    <div
      role="status"
      className="w-full border-b"
      style={{
        background: 'var(--color-surface-muted)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3 text-sm">
        {!isOnline && <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />}
        <div>
          {!isOnline && (
            <span className="font-semibold mr-2">{t('offline.banner')}</span>
          )}
          {!isOnline && <span className="text-text-muted">{t('offline.bannerDetail')}</span>}
          {isOnline && pending.length > 0 && (
            <span>{t('offline.pendingCount', { count: pending.length })}</span>
          )}
        </div>
      </div>
    </div>
  );
}
