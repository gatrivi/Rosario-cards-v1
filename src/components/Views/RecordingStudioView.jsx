import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildRosarySequence, MYSTERY_OPTIONS } from '../../utils/rosarySequence';
import {
  blobToObjectUrl,
  deleteRecording,
  getCoverageMap,
  listRecordingsForSlot,
} from '../../utils/prayerRecordingStore';
import { usePrayerMediaRecorder } from '../../hooks/usePrayerMediaRecorder';
import { useSpeechAdvance } from '../../hooks/useSpeechAdvance';
import { getSpeechProviderLabel } from '../../utils/speechProvider';
import './RecordingStudioView.css';

export default function RecordingStudioView({ mysteryType, onMysteryChange }) {
  const [mode, setMode] = useState('map');
  const [coverage, setCoverage] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionOnlyMissing, setSessionOnlyMissing] = useState(true);
  const [speechOn, setSpeechOn] = useState(true);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const [clips, setClips] = useState([]);

  const audioRef = useRef(null);
  const autoStartedRef = useRef(null);

  const sequence = useMemo(() => buildRosarySequence(mysteryType), [mysteryType]);

  const sessionQueue = useMemo(() => {
    const items = sequence.map((item) => ({
      slotIndex: item.index,
      prayerId: item.id,
      title: item.title,
      text: item.text,
    }));
    if (!sessionOnlyMissing) return items;
    const missing = new Set(
      coverage.filter((c) => !c.hasRecording).map((c) => c.slotIndex)
    );
    return items.filter((item) => missing.has(item.slotIndex));
  }, [sequence, coverage, sessionOnlyMissing]);

  const current = sessionQueue[sessionIndex] ?? null;

  const { start, stopAndSave, cancel, isRecording } = usePrayerMediaRecorder();

  const refreshCoverage = useCallback(async () => {
    setLoading(true);
    try {
      setCoverage(await getCoverageMap(mysteryType));
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
    const done = coverage.filter((c) => c.hasRecording).length;
    const total = sequence.length;
    const uniqueIds = new Set(sequence.map((s) => s.id));
    const idsWithAny = new Set(
      coverage.filter((c) => c.hasRecording).map((c) => c.prayerId)
    );
    return {
      done,
      total,
      missing: total - done,
      pct: total ? Math.round((done / total) * 100) : 0,
      uniqueDone: idsWithAny.size,
      uniqueTotal: uniqueIds.size,
    };
  }, [coverage, sequence]);

  const filteredRows = useMemo(() => {
    if (filter === 'missing') return coverage.filter((c) => !c.hasRecording);
    if (filter === 'done') return coverage.filter((c) => c.hasRecording);
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
          prayerTitle: current.title,
          variantIndex,
          label: `${current.title} · sesión`,
        });
        setRecording(false);
        if (saved) {
          showToast('Grabación guardada');
          await refreshClips();
          await refreshCoverage();
        }
      }
      advanceSession();
    } catch (e) {
      setError('No se pudo guardar la grabación');
      console.warn(e);
    }
  }, [
    current,
    isRecording,
    stopAndSave,
    mysteryType,
    clips,
    advanceSession,
    refreshClips,
    refreshCoverage,
  ]);

  const handleSpeechComplete = useCallback(() => {
    finishAndSave();
  }, [finishAndSave]);

  const { start: startSpeech, stop: stopSpeech } = useSpeechAdvance({
    enabled: mode === 'session' && speechOn && !!current?.text,
    expectedText: current?.text ?? '',
    onComplete: handleSpeechComplete,
  });

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
    if (mode === 'session') {
      setSessionIndex(0);
      autoStartedRef.current = null;
    }
  }, [mode, sessionOnlyMissing, mysteryType]);

  const startSession = (onlyMissing) => {
    setSessionOnlyMissing(onlyMissing);
    setSessionIndex(0);
    autoStartedRef.current = null;
    setMode('session');
    setToast('');
    setError('');
  };

  const jumpToSlot = (slotIndex) => {
    setSessionOnlyMissing(false);
    setSessionIndex(slotIndex);
    autoStartedRef.current = null;
    setMode('session');
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
    await refreshCoverage();
  };

  const mysteryLabel =
    MYSTERY_OPTIONS.find((m) => m.id === mysteryType)?.label ?? mysteryType;

  return (
    <div className="recording-studio-view">
      <header className="rs-header">
        <h1 className="rs-title">Estudio de voz</h1>
        <p className="rs-sub">
          Graba tu voz rezando para reproducirla después en el rosario automático.
        </p>
      </header>

      <div className="rs-mystery-row">
        <label htmlFor="rs-mystery">Misterios</label>
        <select
          id="rs-mystery"
          value={mysteryType}
          onChange={(e) => onMysteryChange?.(e.target.value)}
        >
          {MYSTERY_OPTIONS.map((m) => (
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
          <span className="rs-stat-label">oraciones grabadas</span>
        </div>
        <div className="rs-progress-bar">
          <div className="rs-progress-fill" style={{ width: `${stats.pct}%` }} />
        </div>
        <p className="rs-stat-meta">
          {stats.missing} faltantes · {stats.uniqueDone}/{stats.uniqueTotal} textos únicos con al
          menos una toma
        </p>
      </div>

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
              Faltantes ({stats.missing})
            </button>
            <button
              type="button"
              className={filter === 'done' ? 'active' : ''}
              onClick={() => setFilter('done')}
            >
              Listas ({stats.done})
            </button>
          </div>

          {loading ? (
            <p className="rs-loading">Cargando grabaciones…</p>
          ) : (
            <ul className="rs-slot-list">
              {filteredRows.map((row) => (
                <li
                  key={row.slotIndex}
                  className={`rs-slot ${row.hasRecording ? 'done' : 'missing'}`}
                >
                  <button
                    type="button"
                    className="rs-slot-btn"
                    onClick={() => jumpToSlot(row.slotIndex)}
                  >
                    <span className="rs-slot-idx">{row.slotIndex + 1}</span>
                    <span className="rs-slot-name">{row.title}</span>
                    <span className="rs-slot-badge">
                      {row.hasRecording
                        ? `${row.takeCount} toma${row.takeCount !== 1 ? 's' : ''}`
                        : '—'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="rs-map-actions">
            <button type="button" className="rs-primary" onClick={() => startSession(true)}>
              Rezar solo faltantes ({stats.missing})
            </button>
            <button type="button" className="rs-secondary" onClick={() => startSession(false)}>
              Rezar todo el rosario
            </button>
          </div>
        </section>
      )}

      {mode === 'session' && (
        <section className="rs-session-section">
          {sessionQueue.length === 0 ? (
            <div className="rs-empty-session">
              <p>¡Todo grabado para misterios {mysteryLabel}! No hay oraciones faltantes.</p>
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
                  Terminé.
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
                  <ul className="rs-takes-mini">
                    {clips.slice(-3).map((clip) => (
                      <li key={clip.id}>
                        <button type="button" onClick={() => playClip(clip)}>
                          ▶ {clip.label || clip.prayerKey}
                        </button>
                        <button
                          type="button"
                          className="rs-del"
                          onClick={() => handleDelete(clip.id)}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rs-session-nav">
                <button
                  type="button"
                  disabled={sessionIndex <= 0}
                  onClick={() => {
                    cancel();
                    setRecording(false);
                    autoStartedRef.current = null;
                    setSessionIndex((i) => Math.max(0, i - 1));
                  }}
                >
                  ‹ Anterior
                </button>
                <button
                  type="button"
                  disabled={sessionIndex >= sessionQueue.length - 1}
                  onClick={() => {
                    cancel();
                    setRecording(false);
                    autoStartedRef.current = null;
                    setSessionIndex((i) => i + 1);
                  }}
                >
                  Siguiente ›
                </button>
              </div>
            </>
          )}
        </section>
      )}

      <p className="rs-footnote">
        Deepgram no está conectado aún — el avance por voz usa el reconocimiento del navegador
        (Chrome/Android). Añade <code>REACT_APP_DEEPGRAM_API_KEY</code> en el futuro para mayor
        precisión.
      </p>
    </div>
  );
}
