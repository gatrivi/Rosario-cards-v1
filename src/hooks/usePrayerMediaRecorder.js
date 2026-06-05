import { useRef, useCallback } from 'react';
import { saveRecording } from '../utils/prayerRecordingStore';

export function usePrayerMediaRecorder() {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    stopStream();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    return new Promise((resolve, reject) => {
      recorder.onstart = () => resolve(true);
      recorder.onerror = () => reject(new Error('MediaRecorder error'));
      recorder.start();
    });
  }, [stopStream]);

  const stopAndSave = useCallback(
    async ({ mystery, sequenceIndex, prayerId, prayerTitle, variantIndex, label }) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        stopStream();
        return null;
      }

      const mimeType = recorder.mimeType || 'audio/webm';
      return new Promise((resolve, reject) => {
        recorder.onstop = async () => {
          stopStream();
          const blob = new Blob(chunksRef.current, { type: mimeType });
          if (blob.size < 500) {
            resolve(null);
            return;
          }
          try {
            const saved = await saveRecording({
              mystery,
              sequenceIndex,
              prayerId,
              variantIndex,
              blob,
              mimeType,
              label: label || `${prayerTitle} · sesión`,
            });
            resolve(saved);
          } catch (err) {
            reject(err);
          }
        };
        recorder.stop();
      });
    },
    [stopStream]
  );

  const cancel = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.onstop = () => stopStream();
      mediaRecorderRef.current.stop();
    } else {
      stopStream();
    }
    chunksRef.current = [];
  }, [stopStream]);

  const isRecording = () => mediaRecorderRef.current?.state === 'recording';

  return { start, stopAndSave, cancel, isRecording };
}
