import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  saveRecording,
  listRecordingsForPrayer,
  listRecordingsForSlot,
  deleteRecording,
  blobToObjectUrl,
} from '../../utils/prayerRecordingStore';
import './PrayerRecorder.css';

export default function PrayerRecorder({
  prayerId,
  prayerTitle,
  mystery,
  sequenceIndex,
  simpleMode = false,
  placement = 'header',
}) {
  const [expanded, setExpanded] = useState(false);
  const [micAvailable, setMicAvailable] = useState(null);
  const [recording, setRecording] = useState(false);
  const [clips, setClips] = useState([]);
  const [status, setStatus] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioRef = useRef(null);

  const refreshClips = useCallback(async () => {
    try {
      const [slotList, prayerList] = await Promise.all([
        listRecordingsForSlot(mystery, sequenceIndex),
        listRecordingsForPrayer(prayerId),
      ]);
      const merged = [...slotList];
      prayerList.forEach((c) => {
        if (!merged.some((m) => m.id === c.id)) merged.push(c);
      });
      merged.sort((a, b) => a.createdAt - b.createdAt);
      setClips(merged);
    } catch (err) {
      console.warn('Could not load recordings:', err);
    }
  }, [mystery, sequenceIndex, prayerId]);

  useEffect(() => {
    refreshClips();
  }, [refreshClips]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicAvailable(false);
      return;
    }
    setMicAvailable(true);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
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
      recorder.onstop = async () => {
        stopStream();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const variantIndex = clips.filter((c) => c.prayerId === prayerId).length;
        const label =
          prayerId === 'A'
            ? `Ave María toma ${variantIndex + 1}`
            : `${prayerTitle} toma ${variantIndex + 1}`;
        await saveRecording({
          mystery,
          sequenceIndex,
          prayerId,
          variantIndex,
          blob,
          mimeType,
          label,
        });
        setStatus('Guardado ✓');
        await refreshClips();
        setTimeout(() => setStatus(''), 2000);
      };
      recorder.start();
      setRecording(true);
      setStatus('Grabando…');
    } catch (err) {
      setStatus('Micrófono no disponible');
      console.warn(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    setStatus('');
  };

  const playClip = (clip) => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }
    const url = blobToObjectUrl(clip);
    if (!url) return;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
  };

  const handleDelete = async (id) => {
    await deleteRecording(id);
    await refreshClips();
  };

  const hmVariants = clips.filter((c) => c.prayerId === 'A').length;

  const disabled = micAvailable === false;

  return (
    <div
      className={`prayer-recorder prayer-recorder--${placement}${expanded ? ' prayer-recorder--open' : ''}${disabled ? ' prayer-recorder--disabled' : ''}`}
    >
      <button
        type="button"
        className="prayer-recorder__toggle"
        onClick={() => !disabled && setExpanded((v) => !v)}
        aria-expanded={expanded}
        disabled={disabled}
        title={
          disabled
            ? 'Micrófono no disponible en este dispositivo'
            : 'Grabar tu voz para modo automático'
        }
      >
        🎙️ {clips.length > 0 ? clips.length : ''}
      </button>

      {expanded && (
        <div className="prayer-recorder__panel">
          <p className="prayer-recorder__title">
            {simpleMode ? 'Graba tu voz' : 'Voz propia · modo automático'}
          </p>
          {prayerId === 'A' && (
            <p className="prayer-recorder__hint">
              Puedes grabar muchas tomas del Ave María ({hmVariants} guardadas).
              La app rotará entre ellas para que no suene repetitivo.
            </p>
          )}
          <div className="prayer-recorder__controls">
            {!recording ? (
              <button type="button" className="prayer-recorder__btn" onClick={startRecording}>
                ● Grabar
              </button>
            ) : (
              <button
                type="button"
                className="prayer-recorder__btn prayer-recorder__btn--stop"
                onClick={stopRecording}
              >
                ■ Detener
              </button>
            )}
            {status && <span className="prayer-recorder__status">{status}</span>}
          </div>
          {clips.length > 0 && (
            <ul className="prayer-recorder__list">
              {clips.map((clip) => (
                <li key={clip.id} className="prayer-recorder__item">
                  <button
                    type="button"
                    className="prayer-recorder__play"
                    onClick={() => playClip(clip)}
                  >
                    ▶ {clip.label || clip.prayerKey}
                  </button>
                  <button
                    type="button"
                    className="prayer-recorder__delete"
                    onClick={() => handleDelete(clip.id)}
                    aria-label="Eliminar grabación"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
