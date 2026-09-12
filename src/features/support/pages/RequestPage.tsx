import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import { useSupportRequest } from '../SupportRequestContext';
import VoiceCapture from '../components/VoiceCapture';
import { classifyRequest } from '../../../domain/classification/classify';

export default function RequestPage() {
  const { t, accessMode } = usePreferences();
  const { requestText, studentId, setRequestText, setStudentId, setClassification } = useSupportRequest();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const showVoice = accessMode === 'VOICE_AUDIO' || accessMode === 'VOICE_TEXT_VISUAL';
  const showText = accessMode !== 'VOICE_AUDIO';

  const handleContinue = () => {
    const trimmed = requestText.trim();
    if (!trimmed) {
      setError(t('request.validationRequired'));
      return;
    }
    if (trimmed.length < 8) {
      setError(t('request.validationTooShort'));
      return;
    }
    if (!studentId.trim()) {
      setError(t('request.validationStudentIdRequired'));
      return;
    }
    setError(null);
    setClassification(classifyRequest(trimmed));
    navigate('/support/classification');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{t('request.heading')}</h1>

      <div className="mt-6 space-y-6">
        {showVoice && (
          <VoiceCapture
            transcript={requestText}
            onEditTranscript={setRequestText}
            onFallbackToAssisted={() => navigate('/assisted')}
          />
        )}

        {showText && (
          <div>
            {showVoice && <div className="h-px my-4" style={{ background: 'var(--color-border)' }} />}
            <label htmlFor="request-text" className="block font-medium mb-2">
              {showVoice ? t('request.typeInstead') : t('request.heading')}
            </label>
            <textarea
              id="request-text"
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder={t('request.textPlaceholder')}
              rows={5}
              className="w-full rounded border px-3 py-2"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
            />
          </div>
        )}

        <div>
          <label htmlFor="student-id" className="block font-medium mb-2">
            {t('request.studentIdLabel')}
          </label>
          <input
            id="student-id"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder={t('request.studentIdPlaceholder')}
            className="w-full sm:w-64 rounded border px-3 py-2 min-h-touch"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
          {t('common.back')}
        </button>
        <button type="button" className="btn btn-primary" onClick={handleContinue}>
          {t('request.continue')}
        </button>
      </div>
    </div>
  );
}
