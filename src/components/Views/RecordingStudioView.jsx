import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildSequence } from '../../utils/bookletSequence';
import {
  blobToObjectUrl,
  deleteRecording,
  listRecordingsForSlot,
  saveRecording,
} from '../../utils/prayerRecordingStore';
import { getVoiceCoverageMap, VOICE_STUDIO_OPTIONS } from '../../utils/voiceCoverage';
import { usePrayerMediaRecorder } from '../../hooks/usePrayerMediaRecorder';
import { useSpeechAdvance } from '../../hooks/useSpeechAdvance';
import { getSpeechProviderLabel } from '../../utils/speechProvider';
import { getVoicePrefs, setVoicePrefs } from '../../utils/voicePrefs';
import './RecordingStudioView.css';

export default function RecordingStudioView({ mysteryType, onMysteryChange }) {
  const [mode, setMode] = useState('map');
  const [coverage, setCoverage] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [voicePrefs, setVoicePrefsState] = useState(getVoicePrefs);

  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionOnlyMissing, setSessionOnlyMissing] = useState(true);
  const [speechOn, setSpeechOn] = useState(true);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const [clips, setClips] = useState([]);

  const audioRef = useRef(null);
  const autoStartedRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadTargetRef = useRef(null);

  const sequence = useMemo(
    () =>
      buildSequence(mysteryType, { novenaDay: 1 }).map((item, index) => ({
        index,
        id: item.id,
        title: item.title,
        text: item.text,
      })),
    [mysteryType]
  );

  const sessionQueue = useMemo(() => {
    const items = sequence.map((item) => ({
      slotIndex: item.index,
      prayerId: item.id,
      title: item.title,
      text: item.text,
    }));
    if (!sessionOnlyMissing) return items;
    const missing = new Set(
      coverage.filter((c) => !c.hasUser).map((c) => c.slotIndex)
    );
    return items.filter((item) => missing.has(item.slotIndex));
  }, [sequence, coverage, sessionOnlyMissing]);

  const current = sessionQueue[sessionIndex] ?? null;

  const { start, stopAndSave, cancel, isRecording } = usePrayerMediaRecorder();

  const refreshCoverage = useCallback(async () => {
    setLoading(true);
    try {
      setCoverage(await getVoiceCoverageMap(mysteryType));
    } catch (e) {
      console.warn('[RecordingStudio] coverage', e);
    } finally {
      setLoading(false);
    }
  }, [mysteryType]);

  const refreshClips = useCallback(async () => {
    if (!current) return;
    try {
      const list = await listRecordingsForSlot(mysteryType, current.slotIndex);
      setClips(list.sort((a, b) => a.createdAt - b.createdAt));
    } catch (e) {
      console.warn('[RecordingStudio] clips', e);
    }
  }, [mysteryType, current]);

  useEffect(() => {
    refreshCoverage();
  }, [refreshCoverage]);

  useEffect(() => {
    refreshClips();
  }, [refreshClips]);

  useEffect(
    () => () => {
      cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    },
    [cancel]
  );

  const stats = useMemo(() => {
    const userDone = coverage.filter((c) => c.hasUser).length;
    const t3Only = coverage.filter((c) => !c.hasUser && c.hasBundled).length;
    const empty = coverage.filter((c) => !c.hasUser && !c.hasBundled).length;
    const total = sequence.length;
    return {
      done: userDone,
      total,
      missing: total - userDone,
      pct: total ? Math.round((userDone / total) * 100) : 0,
      t3Only,
      empty,
    };
  }, [coverage, sequence]);

  const filteredRows = useMemo(() => {
    if (filter === 'missing') return coverage.filter((c) => !c.hasUser);
    if (filter === 'empty') return coverage.filter((c) => !c.hasUser && !c.hasBundled);
    if (filter === 'done') return coverage.filter((c) => c.hasUser);
    return coverage;
  }, [coverage, filter]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const advanceSession = useCallback(() => {
    if (sessionIndex < sessionQueue.length - 1) {
      setSessionIndex((i) => i + 1);
      autoStartedRef.current = null;
    } else {
      showToast('Sesión completa. ¡Bendiciones!');
      refreshCoverage();
    }
  }, [sessionIndex, sessionQueue.length, refreshCoverage]);

  const beginRecording = useCallback(async () => {
    if (!current) return;
    setError('');
    try {
      await start();
      setRecording(true);
    } catch (e) {
      setError('Micrófono no disponible');
      console.warn(e);
    }
  }, [current, start]);

  const finishAndSave = useCallback(async () => {
    if (!current) return;
    setError('');
    try {
      if (isRecording()) {
        const variantIndex = clips.filter((c) => c.prayerId === current.prayerId).length;
        const saved = await stopAndSave({
          mystery: mysteryType,
          sequenceIndex: current.slotIndex,
          prayerId: current.prayerId,
          variantIndex,
          label: `${current.title} toma ${variantIndex + 1}`,
        });
        if (saved) showToast('Guardado (Tier S)');
      }
      setRecording(false);
      await refreshClips();
      await refreshCoverage();
      advanceSession();
    } catch (e) {
      setError('No se pudo guardar');
      console.warn(e);
    }
  }, [
    current,
    clips,
    isRecording,
    stopAndSave,
    mysteryType,
    refreshClips,
    refreshCoverage,
    advanceSession,
  ]);

  const startSession = (onlyMissing) => {
    cancel();
    setRecording(false);
    setSessionOnlyMissing(onlyMissing);
    setSessionIndex(0);
    autoStartedRef.current = null;
    setMode('session');
  };

  const jumpToSlot = (slotIndex) => {
    setSessionOnlyMissing(false);
    setSessionIndex(slotIndex);
    autoStartedRef.current = null;
    setMode('session');
  };

  const handleSpeechComplete = useCallback(() => {
    finishAndSave();
  }, [finishAndSave]);

  const { start: startSpeech, stop: stopSpeech } = useSpeechAdvance({
    enabled: mode === 'session' && speechOn && !!current?.text,
    expectedText: current?.text ?? '',
    onComplete: handleSpeechComplete,
  });

  const playClip = (clip) => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }
    const url = blobToObjectUrl(clip);
    if (!url) return;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => URL.revokeObjectURL(url);
    audio.play();
  };

  const handleDeleteClip = async (id) => {
    await deleteRecording(id);
    await refreshClips();
    await refreshCoverage();
  };

  const openUpload = (row) => {
    uploadTargetRef.current = row;
    fileInputRef.current?.click();
  };

  const onFilePicked = async (e) => {
    const file = e.target.files?.[0];
    const row = uploadTargetRef.current;
    e.target.value = '';
    if (!file || !row) return;
    try {
      await saveRecording({
        mystery: mysteryType,
        sequenceIndex: row.slotIndex,
        prayerId: row.prayerId,
        variantIndex: row.takeCount || 0,
        blob: file,
        mimeType: file.type || 'audio/wav',
        label: `Import · ${file.name}`,
      });
      showToast('Audio importado (Tier S)');
      await refreshCoverage();
    } catch (err) {
      setError('No se pudo importar');
      console.warn(err);
    }
  };

  const togglePref = (key) => {
    const next = setVoicePrefs({ [key]: !voicePrefs[key] });
    setVoicePrefsState(next);
  };

  const mysteryLabel =
    VOICE_STUDIO_OPTIONS.find((m) => m.id === mysteryType)?.label ?? mysteryType;

  useEffect(() => {
    if (mode !== 'session' || !recording || !speechOn) {
      stopSpeech();
      return undefined;
    }
    startSpeech();
    return () => stopSpeech();
  }, [mode, recording, speechOn, current?.slotIndex, startSpeech, stopSpeech]);

  useEffect(() => {
    if (mode !== 'session' || !current) return undefined;
    const key = `${mysteryType}-${current.slotIndex}`;
    if (autoStartedRef.current === key) return undefined;
    autoStartedRef.current = key;
    const t = setTimeout(() => {
      beginRecording();
    }, 500);
    return () => clearTimeout(t);
  }, [mode, current, mysteryType, beginRecording]);

  useEffect(() => {
    setSessionIndex(0);
    autoStartedRef.current = null;
  }, [sessionOnlyMissing, mysteryType]);

  return (
    <div className="recording-studio-view">
      <header className="rs-header">
        <h1 className="rs-title">Estudio de voz</h1>
        <p className="rs-sub">
          Liber ▶: 1× oración · al terminar, otra vez = auto ≫. Fallback: TTS del navegador (es-ES). Tier S
          gana si hay grabación; T3 cuando haya WAV en /voice/en/.
        </p>
      </header>

      <div className="rs-prefs-row">
        <label className="rs-pref">
          <input
            type="checkbox"
            checked={voicePrefs.useUserVoice}
            onChange={() => togglePref('useUserVoice')}
          />
          Usar tu voz (S)
        </label>
        <label className="rs-pref">
          <input
            type="checkbox"
            checked={voicePrefs.useBundledVoice}
            onChange={() => togglePref('useBundledVoice')}
          />
          Guía T3 (EN)
        </label>
        <label className="rs-pref">
          <input
            type="checkbox"
            checked={voicePrefs.useBrowserTts !== false}
            onChange={() => togglePref('useBrowserTts')}
          />
          TTS navegador ES
        </label>
      </div>

      <div className="rs-prefs-row rs-prefs-row--tts">
        <label className="rs-pref rs-pref--slider" htmlFor="rs-tts-rate">
          Ritmo TTS
          <input
            id="rs-tts-rate"
            type="range"
            min="0.7"
            max="1.5"
            step="0.05"
            value={voicePrefs.ttsRate ?? 1}
            onChange={(e) => {
              const next = setVoicePrefs({ ttsRate: parseFloat(e.target.value) });
              setVoicePrefsState(next);
            }}
          />
          <span>{Number(voicePrefs.ttsRate ?? 1).toFixed(2)}×</span>
        </label>
        <p className="rs-pref-legend">
          Idioma guía: {voicePrefs.ttsLang || 'es-ES'} (sin títulos de oración).
        </p>
      </div>

      <div className="rs-mystery-row">
        <label htmlFor="rs-mystery">Devoción</label>
        <select
          id="rs-mystery"
          value={VOICE_STUDIO_OPTIONS.some((o) => o.id === mysteryType) ? mysteryType : 'angelus'}
          onChange={(e) => onMysteryChange?.(e.target.value)}
        >
          {VOICE_STUDIO_OPTIONS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rs-stats-card">
        <div className="rs-stat-main">
          <span className="rs-stat-num">{stats.done}</span>
          <span className="rs-stat-den">/ {stats.total}</span>
          <span className="rs-stat-label">con tu voz (Tier S)</span>
        </div>
        <div className="rs-progress-bar">
          <div className="rs-progress-fill" style={{ width: `${stats.pct}%` }} />
        </div>
        <p className="rs-stat-meta">
          {stats.missing} sin tu voz · {stats.t3Only} solo T3 · {stats.empty} sin audio
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.wav,.mp3,.ogg,.webm,.m4a"
        hidden
        onChange={onFilePicked}
      />

      <div className="rs-mode-tabs">
        <button
          type="button"
          className={`rs-tab ${mode === 'map' ? 'active' : ''}`}
          onClick={() => {
            cancel();
            setRecording(false);
            setMode('map');
            refreshCoverage();
          }}
        >
          Mapa
        </button>
        <button
          type="button"
          className={`rs-tab ${mode === 'session' ? 'active' : ''}`}
          onClick={() => startSession(true)}
        >
          Rezar y grabar
        </button>
      </div>

      {mode === 'map' && (
        <section className="rs-map-section">
          <div className="rs-filter-row">
            <button
              type="button"
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              Todas ({stats.total})
            </button>
            <button
              type="button"
              className={filter === 'missing' ? 'active' : ''}
              onClick={() => setFilter('missing')}
            >
              Sin S ({stats.missing})
            </button>
            <button
              type="button"
              className={filter === 'empty' ? 'active' : ''}
              onClick={() => setFilter('empty')}
            >
              Sin audio ({stats.empty})
            </button>
            <button
              type="button"
              className={filter === 'done' ? 'active' : ''}
              onClick={() => setFilter('done')}
            >
              Tier S ({stats.done})
            </button>
          </div>

          {loading ? (
            <p className="rs-loading">Cargando…</p>
          ) : (
            <ul className="rs-slot-list">
              {filteredRows.map((row) => (
                  <li
                    key={row.slotIndex}
                    className={`rs-slot ${row.hasUser ? 'done' : row.hasBundled ? 't3' : 'missing'}`}
                  >
                    <button
                      type="button"
                      className="rs-slot-btn"
                      onClick={() => jumpToSlot(row.slotIndex)}
                    >
                      <span className="rs-slot-idx">{row.slotIndex + 1}</span>
                      <span className="rs-slot-name">{row.title}</span>
                      <span
                        className={`rs-slot-badge ${row.hasUser ? 'tier-s' : row.hasBundled ? 'tier-t3' : 'tier-none'}`}
                        title={
                          row.hasUser
                            ? 'Tu voz (Tier S)'
                            : row.hasBundled
                              ? 'Guía T3 (EN)'
                              : 'Sin audio'
                        }
                      >
                        {row.hasUser
                          ? `${row.takeCount}·S`
                          : row.hasBundled
                            ? 'T3'
                            : '—'}
                      </span>
                    </button>
                    {!row.hasUser && (
                      <button
                        type="button"
                        className="rs-upload-btn"
                        title="Subir audio (Tier S)"
                        onClick={() => openUpload(row)}
                      >
                        ↑
                      </button>
                    )}
                  </li>
              ))}
            </ul>
          )}

          <div className="rs-map-actions">
            <button type="button" className="rs-primary" onClick={() => startSession(true)}>
              Grabar sin tu voz ({stats.missing})
            </button>
            <button type="button" className="rs-secondary" onClick={() => startSession(false)}>
              Grabar todo
            </button>
          </div>
        </section>
      )}

      {mode === 'session' && (
        <section className="rs-session-section">
          {sessionQueue.length === 0 ? (
            <div className="rs-empty-session">
              <p>Todo con Tier S en {mysteryLabel}.</p>
              <button
                type="button"
                className="rs-secondary"
                onClick={() => {
                  setMode('map');
                  refreshCoverage();
                }}
              >
                Volver al mapa
              </button>
            </div>
          ) : (
            <>
              <div className="rs-session-progress">
                {sessionIndex + 1} / {sessionQueue.length}
                <span className="rs-session-slot">
                  (casilla {current.slotIndex + 1} · {current.title})
                </span>
              </div>

              <div className="rs-session-card">
                <h2 className="rs-prayer-title">{current.title}</h2>
                <p className="rs-prayer-text">{current.text}</p>
                <p className="rs-session-hint">
                  Reza en voz alta. La grabación empieza sola. Di «Amén» al terminar o pulsa
                  Terminé. Queda como Tier S.
                </p>

                <div className={`rs-rec-indicator ${recording ? 'live' : ''}`}>
                  {recording ? '● Grabando…' : 'Listo'}
                </div>

                {error && <p className="rs-error">{error}</p>}
                {toast && <p className="rs-toast">{toast}</p>}

                <label className="rs-speech-toggle">
                  <input
                    type="checkbox"
                    checked={speechOn}
                    onChange={(e) => setSpeechOn(e.target.checked)}
                  />
                  Avance por voz ({getSpeechProviderLabel()})
                </label>

                <div className="rs-session-controls">
                  {recording ? (
                    <button type="button" className="rs-primary" onClick={finishAndSave}>
                      Terminé — guardar y siguiente
                    </button>
                  ) : (
                    <button type="button" className="rs-secondary" onClick={beginRecording}>
                      Volver a grabar
                    </button>
                  )}
                  <button
                    type="button"
                    className="rs-ghost"
                    onClick={() => {
                      cancel();
                      setRecording(false);
                      setMode('map');
                      refreshCoverage();
                    }}
                  >
                    Salir sesión
                  </button>
                </div>

                {clips.length > 0 && (
                  <ul className="rs-clip-list">
                    {clips.map((clip) => (
                      <li key={clip.id}>
                        <button type="button" onClick={() => playClip(clip)}>
                          ▶ {clip.label || 'toma'}
                        </button>
                        <button type="button" onClick={() => handleDeleteClip(clip.id)}>
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {mode === 'map' && toast && <p className="rs-toast rs-toast-float">{toast}</p>}
      {mode === 'map' && error && <p className="rs-error">{error}</p>}
    </div>
  );
}
