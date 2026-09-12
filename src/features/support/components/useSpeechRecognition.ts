import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpeechRecognitionLike } from '../../../types/speech-recognition';
import type { Language } from '../../../domain/accessibility/AccessibilityPreferences';

const LOCALE_MAP: Record<Language, string> = {
  en: 'en-IN',
  ta: 'ta-IN',
};

function getRecognitionConstructor(): (new () => SpeechRecognitionLike) | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getRecognitionConstructor());
}

export interface UseSpeechRecognitionResult {
  supported: boolean;
  recording: boolean;
  transcript: string;
  errorReason: 'unsupported' | 'permission-denied' | 'failed' | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(language: Language): UseSpeechRecognitionResult {
  const supported = isSpeechRecognitionSupported();
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorReason, setErrorReason] = useState<UseSpeechRecognitionResult['errorReason']>(
    supported ? null : 'unsupported',
  );
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionConstructor();
    if (!Ctor) {
      setErrorReason('unsupported');
      return;
    }

    setTranscript('');
    setErrorReason(null);

    const recognition = new Ctor();
    recognition.lang = LOCALE_MAP[language] ?? 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let combined = '';
      for (let i = 0; i < event.results.length; i += 1) {
        combined += event.results[i][0].transcript;
      }
      setTranscript(combined);
    };

    recognition.onerror = (event) => {
      setErrorReason(event.error === 'not-allowed' || event.error === 'permission-denied' ? 'permission-denied' : 'failed');
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setRecording(true);
    } catch {
      setErrorReason('failed');
      setRecording(false);
    }
  }, [language]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setRecording(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setErrorReason(supported ? null : 'unsupported');
  }, [supported]);

  return { supported, recording, transcript, errorReason, start, stop, reset };
}
