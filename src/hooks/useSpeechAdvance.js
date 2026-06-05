import { useRef, useCallback, useEffect } from 'react';
import {
  getBrowserSpeechRecognition,
  prayerSpeechLooksComplete,
} from '../utils/speechProvider';

/**
 * Listen while user prays aloud; calls onComplete when prayer sounds finished.
 */
export function useSpeechAdvance({ enabled, expectedText, onComplete, lang = 'es-ES' }) {
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) { /* ignore */ }
      recognitionRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    transcriptRef.current = '';
    const SpeechRecognition = getBrowserSpeechRecognition();
    if (!SpeechRecognition || !enabled) return false;

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let chunk = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        chunk += event.results[i][0].transcript;
      }
      transcriptRef.current += ` ${chunk}`;
      if (prayerSpeechLooksComplete(expectedText, transcriptRef.current)) {
        stop();
        onCompleteRef.current?.('speech');
      }
    };

    recognition.onerror = () => {
      stop();
    };

    recognition.onend = () => {
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      return true;
    } catch (_) {
      return false;
    }
  }, [enabled, expectedText, lang, stop]);

  useEffect(() => () => stop(), [stop]);

  return { start, stop, getTranscript: () => transcriptRef.current.trim() };
}
