import { Mic, Square } from 'lucide-react';
import { usePreferences } from '../../../app/providers/PreferencesProvider';
import { useSpeechRecognition } from './useSpeechRecognition';

interface VoiceCaptureProps {
  onFallbackToAssisted: () => void;
  onEditTranscript: (text: string) => void;
  transcript: string;
}

export default function VoiceCapture({ onFallbackToAssisted, onEditTranscript, transcript }: VoiceCaptureProps) {
  const { t, language } = usePreferences();
  const speech = useSpeechRecognition(language);

  const handleMicClick = () => {
    if (speech.recording) {
      speech.stop();
      if (speech.transcript) onEditTranscript(speech.transcript);
      return;
    }
    speech.start();
  };

  if (speech.errorReason === 'unsupported' || speech.errorReason === 'permission-denied' || speech.errorReason === 'failed') {
    return (
      <div className="card p-4" style={{ background: 'var(--color-surface-muted)' }} role="alert">
        <p className="text-sm">{t('request.voiceUnavailable')}</p>
        <button type="button" className="btn btn-primary text-sm mt-3" onClick={onFallbackToAssisted}>
          {t('request.voiceUnavailableCta')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-semibold">{t('request.voiceHeading')}</h2>
      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={handleMicClick}
          aria-pressed={speech.recording}
          className="btn"
          style={{
            background: speech.recording ? 'var(--color-danger)' : 'var(--color-accent)',
            color: 'var(--color-accent-contrast)',
            width: 64,
            height: 64,
            borderRadius: '50%',
            padding: 0,
          }}
        >
          {speech.recording ? <Square className="w-6 h-6" aria-hidden="true" /> : <Mic className="w-6 h-6" aria-hidden="true" />}
          <span className="visually-hidden">{t('request.voiceStart')}</span>
        </button>
        <span aria-live="polite" className="text-sm text-text-muted">
          {speech.recording ? t('request.voiceRecording') : t('request.voiceStart')}
        </span>
      </div>

      {(transcript || speech.transcript) && (
        <div className="mt-4">
          <label htmlFor="voice-transcript" className="block text-sm font-medium mb-1">
            {t('request.voiceTranscriptLabel')}
          </label>
          <textarea
            id="voice-transcript"
            value={transcript || speech.transcript}
            onChange={(e) => onEditTranscript(e.target.value)}
            rows={4}
            className="w-full rounded border px-3 py-2"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          />
          <p className="text-xs text-text-muted mt-1">{t('request.voiceEditPrompt')}</p>
        </div>
      )}
    </div>
  );
}
