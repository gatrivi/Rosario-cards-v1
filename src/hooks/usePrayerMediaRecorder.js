import { useRef, useCallback } from 'react';
import { saveRecording } from '../utils/prayerRecordingStore';

function makeRecorderError(message, name = 'NotSupportedError') {
  const error = new Error(message);
  error.name = name;
  return error;
}

export function usePrayerMediaRecorder() {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const stopStream = useCallback(() => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (_) {
        /* ignore track cleanup errors */
      }
    });
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw makeRecorderError('Este navegador no ofrece acceso al micrófono.');
    }
    if (typeof MediaRecorder === 'undefined') {
      throw makeRecorderError('Este navegador no ofrece grabación de audio.');
    }

    stopStream();
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const canTestMime = typeof MediaRecorder.isTypeSupported === 'function';
      const mimeType =
        canTestMime && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : '';
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      return await new Promise((resolve, reject) => {
        let settled = false;
        const fail = (error) => {
          if (settled) return;
          settled = true;
          mediaRecorderRef.current = null;
          stopStream();
          reject(error instanceof Error ? error : new Error('MediaRecorder error'));
        };

        recorder.onstart = () => {
          if (settled) return;
          settled = true;
          resolve(true);
        };
        recorder.onerror = () => fail(new Error('MediaRecorder error'));

        try {
          recorder.start();
        } catch (error) {
          fail(error);
        }
      });
    } catch (error) {
      mediaRecorderRef.current = null;
      stopStream();
      throw error;
    }
  }, [stopStream]);

  const stopAndSave = useCallback(
    async ({ mystery, sequenceIndex, prayerId, prayerTitle, variantIndex, label, voiceLang }) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        stopStream();
        return null;
      }

      const mimeType = recorder.mimeType || 'audio/webm';
      return new Promise((resolve, reject) => {
        let settled = false;
        const fail = (error) => {
          if (settled) return;
          settled = true;
          mediaRecorderRef.current = null;
          stopStream();
          reject(error instanceof Error ? error : new Error('No se pudo detener la grabación'));
        };

        recorder.onstop = async () => {
          if (settled) return;
          settled = true;
          mediaRecorderRef.current = null;
          stopStream();

          const blob = new Blob(chunksRef.current, { type: mimeType });
          chunksRef.current = [];
          if (blob.size < 500) {
            resolve(null);
            return;
          }

          try {
            const clipLabel =
              label || String(prayerTitle || 'Oración') + ' · sesión';
            const saved = await saveRecording({
              mystery,
              sequenceIndex,
              prayerId,
              variantIndex,
              blob,
              mimeType,
              label: clipLabel,
              voiceLang,
            });

            // Recording is private/local by default. A future explicit
            // "Compartir mi voz" submission flow may publish a selected take
            // after consent and moderation, but saving never publishes silently.
            resolve({ ...saved, cloudOk: false, cloudPending: false, localOnly: true });
          } catch (error) {
            reject(error);
          }
        };

        try {
          recorder.stop();
        } catch (error) {
          fail(error);
        }
      });
    },
    [stopStream]
  );

  const cancel = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    mediaRecorderRef.current = null;

    if (recorder?.state === 'recording') {
      recorder.onstop = () => stopStream();
      try {
        recorder.stop();
      } catch (_) {
        stopStream();
      }
    } else {
      stopStream();
    }
    chunksRef.current = [];
  }, [stopStream]);

  const isRecording = () => mediaRecorderRef.current?.state === 'recording';

  return { start, stopAndSave, cancel, isRecording };
}
