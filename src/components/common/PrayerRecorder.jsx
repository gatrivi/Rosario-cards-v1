import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  saveRecording,
  listRecordingsForPrayer,
  listRecordingsForSlot,
  deleteRecording,
  blobToObjectUrl,
} from '../../utils/prayerRecordingStore';
import { resolveBundledVoiceUrl } from '../../data/bundledVoiceMap';
import { VOICE_MODES } from '../../utils/prayerVoicePlayback';
import './PrayerRecorder.css';

function voiceControlIcon(voiceMode, voicePlaying) {
  if (voiceMode === VOICE_MODES.AUTO) return '≫';
  if (voicePlaying) return '⏸';
  return '▶';
}

function voiceControlLabel(voiceMode, voicePlaying) {
  if (voiceMode === VOICE_MODES.AUTO) return 'Detener auto-play';
  if (voicePlaying) return 'Activar auto-play (o pausar)';
  return 'Reproducir oración';
}

export default function PrayerRecorder({
  prayerId,
  prayerTitle,
  mystery,
  sequenceIndex,
  simpleMode = false,
  placement = 'header',
  isLeftHanded = false,
  children,
  /** Lifted Libro voice FSM */
  voiceMode = VOICE_MODES.OFF,
  voicePlaying = false,
  onVoiceControlTap,
  voiceControlEnabled = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const [micAvailable, setMicAvailable] = useState(null);
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [clips, setClips] = useState([]);
  const [status, setStatus] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const bundledUrl = resolveBundledVoiceUrl(prayerId);

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
    setPlaying(false);
    setExpanded(false);
  }, [prayerId, sequenceIndex]);

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
        audioRef.current.pause();
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

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
  };

  const playUrl = (url, revoke = false) => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src?.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    }
    if (!url) return;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      setPlaying(false);
      if (revoke) URL.revokeObjectURL(url);
    };
    audio.onpause = () => setPlaying(false);
    audio.play();
    setPlaying(true);
  };

  const playClip = (clip) => {
    const url = blobToObjectUrl(clip);
    if (!url) return;
    playUrl(url, true);
  };

  const togglePlayback = () => {
    if (playing) {
      stopPlayback();
      return;
    }
    if (clips.length > 0) {
      playClip(clips[clips.length - 1]);
      return;
    }
    if (bundledUrl) playUrl(bundledUrl);
  };

  const handleDelete = async (id) => {
    await deleteRecording(id);
    await refreshClips();
  };

  const hmVariants = clips.filter((c) => c.prayerId === 'A').length;

  const disabled = micAvailable === false;
  const hasClips = clips.length > 0;
  const canPlayLegacy = hasClips || Boolean(bundledUrl);
  const isTitle = placement === 'title';

  const panel = expanded && (
    <div className="prayer-recorder__panel">
      <p className="prayer-recorder__title">
        {simpleMode ? 'Graba tu voz' : 'Voz propia · suena al llegar a esta oración'}
      </p>
      <p className="prayer-recorder__hint">
        ▶ una vez = esta oración · otra vez = auto ≫ hasta el final · /voz para ritmo EN TTS.
      </p>
      {bundledUrl && !hasClips && (
        <p className="prayer-recorder__hint">
          Guía Tier 3. ▶ para oírla; 🎙️ graba Tier S (reemplaza la guía).
        </p>
      )}
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
  );

  if (isTitle) {
    // Liber owns ▶ in thumb-zone FAB; title row keeps mic only (no legacy side play).
    const showTitlePlay =
      voiceControlEnabled && typeof onVoiceControlTap === 'function';
    return (
      <div
        className={`prayer-recorder prayer-recorder--title${expanded ? ' prayer-recorder--open' : ''}${disabled ? ' prayer-recorder--disabled' : ''}${
          voiceMode === VOICE_MODES.AUTO ? ' prayer-recorder--auto' : ''
        }`}
      >
        <div className={`prayer-recorder__title-row${isLeftHanded ? ' prayer-recorder__title-row--left' : ''}`}>
          {showTitlePlay ? (
            <button
              type="button"
              className={`prayer-recorder__side-btn${
                voiceMode === VOICE_MODES.AUTO ? ' prayer-recorder__side-btn--auto' : ''
              }`}
              onClick={onVoiceControlTap}
              aria-label={voiceControlLabel(voiceMode, voicePlaying)}
              title={voiceControlLabel(voiceMode, voicePlaying)}
            >
              {voiceControlIcon(voiceMode, voicePlaying)}
            </button>
          ) : (
            <span className="prayer-recorder__side-spacer" aria-hidden="true" />
          )}
          <div className="prayer-recorder__title-slot">{children}</div>
          <button
            type="button"
            className="prayer-recorder__side-btn"
            onClick={() => !disabled && setExpanded((v) => !v)}
            disabled={disabled}
            aria-expanded={expanded}
            aria-label="Grabar tu voz"
            title="Grabar tu voz"
          >
            🎙️
          </button>
        </div>
        {panel}
      </div>
    );
  }

  const handleToggle = () => {
    if (disabled && !canPlayLegacy) return;
    if (canPlayLegacy && placement === 'footer-inline') {
      togglePlayback();
      return;
    }
    setExpanded((v) => !v);
  };

  return (
    <div
      className={`prayer-recorder prayer-recorder--${placement}${expanded ? ' prayer-recorder--open' : ''}${disabled ? ' prayer-recorder--disabled' : ''}`}
    >
      <button
        type="button"
        className="prayer-recorder__toggle"
        onClick={handleToggle}
        aria-expanded={expanded}
        disabled={disabled && !canPlayLegacy}
        title={
          disabled && !canPlayLegacy
            ? 'Micrófono no disponible en este dispositivo'
            : canPlayLegacy && placement === 'footer-inline'
              ? playing
                ? 'Pausar'
                : 'Reproducir'
              : 'Grabar tu voz para modo automático'
        }
      >
        {canPlayLegacy && placement === 'footer-inline'
          ? playing
            ? '⏸'
            : '▶'
          : `🎙️${clips.length > 0 ? ` ${clips.length}` : ''}`}
      </button>
      {panel}
    </div>
  );
}
