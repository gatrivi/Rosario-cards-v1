import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BOOKLET_MYSTERY_IDS, buildSequence } from '../../utils/bookletSequence';
import {
  blobToObjectUrl,
  deleteRecording,
  listRecordingsForSlot,
  saveRecording,
} from '../../utils/prayerRecordingStore';
import { devotionVoiceLabel, getVoiceCoverageMap } from '../../utils/voiceCoverage';
import { usePrayerMediaRecorder } from '../../hooks/usePrayerMediaRecorder';
import { useSpeechAdvance } from '../../hooks/useSpeechAdvance';
import { getSpeechProviderLabel } from '../../utils/speechProvider';
import { getVoicePrefs, setVoicePrefs } from '../../utils/voicePrefs';
import './RecordingStudioView.css';

const MAX_AUDIO_UPLOAD_BYTES = 50 * 1024 * 1024;
const REVIEW_KEY = 'rosario_voice_reviewed_steps';

function loadReviewedVoiceSteps() {
  try {
    const raw = localStorage.getItem(REVIEW_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (_) {
    return new Set();
  }
}

function persistReviewedVoiceSteps(reviewed) {
  try {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(Array.from(reviewed)));
  } catch (_) { /* quota */ }
}

export default function RecordingStudioView({ mysteryType, onMysteryChange }) {
  const [mode, setMode] = useState('map');
  const [coverage, setCoverage] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [coverageError, setCoverageError] = useState('');
  const [voicePrefs, setVoicePrefsState] = useState(getVoicePrefs);

  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionOnlyMissing, setSessionOnlyMissing] = useState(true);
  const [speechOn, setSpeechOn] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingClipId, setDeletingClipId] = useState(null);
  const [clips, setClips] = useState([]);
  const [reviewedSteps, setReviewedSteps] = useState(loadReviewedVoiceSteps);

  const audioRef = useRef(null);
  const startingRef = useRef(false);
  const coverageRequestRef = useRef(0);
  const clipsRequestRef = useRef(0);

  const savingRef = useRef(false);
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
  const voiceLang = voicePrefs.voiceLang || 'es';
  const busy = recording || saving || starting || uploading;
  const stopClipPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.onended = null;
    audio.onerror = null;
    const src = audio.src;
    audioRef.current = null;
    if (src?.startsWith('blob:')) URL.revokeObjectURL(src);
  }, []);

  useEffect(() => {
    const onPrefs = (event) => {
      if (event?.detail) setVoicePrefsState((prev) => ({ ...prev, ...event.detail }));
    };
    window.addEventListener('rosario-voice-prefs', onPrefs);
    return () => window.removeEventListener('rosario-voice-prefs', onPrefs);
  }, []);

  const { start, stopAndSave, cancel, isRecording } = usePrayerMediaRecorder();

  const refreshCoverage = useCallback(async () => {
    const requestId = ++coverageRequestRef.current;
    setLoading(true);
    setCoverageError('');
    try {
      const nextCoverage = await getVoiceCoverageMap(mysteryType, { lang: voiceLang });
      if (requestId !== coverageRequestRef.current) return;
      setCoverage(nextCoverage);
    } catch (e) {
      if (requestId !== coverageRequestRef.current) return;
      setCoverage([]);
      setCoverageError('No se pudo cargar la cobertura. Pulsa Reintentar.');
      console.warn('[RecordingStudio] coverage', e);
    } finally {
      if (requestId === coverageRequestRef.current) setLoading(false);
    }
  }, [mysteryType, voiceLang]);

  const refreshClips = useCallback(async () => {
    const requestId = ++clipsRequestRef.current;
    if (!current) {
      setClips([]);
      return;
    }
    const slotIndex = current.slotIndex;
    setClips([]);
    try {
      const list = await listRecordingsForSlot(mysteryType, slotIndex);
      if (requestId !== clipsRequestRef.current) return;
      setClips(list.sort((a, b) => a.createdAt - b.createdAt));
    } catch (e) {
      if (requestId !== clipsRequestRef.current) return;
      setError('No se pudieron cargar las tomas.');
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
      startingRef.current = false;
      cancel();
      stopClipPlayback();
    },
    [cancel, stopClipPlayback]
  );

  const stats = useMemo(() => {
    const userDone = coverage.filter((c) => c.hasUser).length;
    const t3Only = coverage.filter((c) => !c.hasUser && c.hasBundled).length;
    const empty = coverage.filter((c) => !c.hasUser && !c.hasBundled).length;
    const total = sequence.length;
    const reviewed = sequence.filter((item) => reviewedSteps.has(`${voiceLang}:${mysteryType}:${item.index}`)).length;
    return {
      done: userDone,
      total,
      missing: total - userDone,
      pct: total ? Math.round((userDone / total) * 100) : 0,
      t3Only,
      empty,
      reviewed,
    };
  }, [coverage, sequence, reviewedSteps, voiceLang, mysteryType]);

  const filteredRows = useMemo(() => {
    if (filter === 'reviewed') return coverage.filter((c) => reviewedSteps.has(`${voiceLang}:${mysteryType}:${c.slotIndex}`));
    if (filter === 'unreviewed') return coverage.filter((c) => !reviewedSteps.has(`${voiceLang}:${mysteryType}:${c.slotIndex}`));
    if (filter === 'missing') return coverage.filter((c) => !c.hasUser);
    if (filter === 'empty') return coverage.filter((c) => !c.hasUser && !c.hasBundled);
    if (filter === 'done') return coverage.filter((c) => c.hasUser);
    return coverage;
  }, [coverage, filter, reviewedSteps, voiceLang, mysteryType]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const advanceSession = useCallback(() => {
    if (sessionIndex < sessionQueue.length - 1) {
      setSessionIndex((i) => i + 1);

    } else {
      showToast('Sesión completa. ¡Bendiciones!');
      refreshCoverage();
    }
  }, [sessionIndex, sessionQueue.length, refreshCoverage]);

  const beginRecording = useCallback(async () => {
    if (!current || savingRef.current || startingRef.current || recording) return;
    startingRef.current = true;
    setStarting(true);
    setError('');
    try {
      await start();
      if (!startingRef.current) {
        cancel();
        return;
      }
      setRecording(true);
    } catch (e) {
      const name = e?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setError('Micrófono bloqueado. Permite el micrófono en el navegador y reintenta.');
      } else if (name === 'NotFoundError') {
        setError('No se encontró un micrófono disponible.');
      } else if (name === 'NotSupportedError') {
        setError('Este navegador no permite grabar audio.');
      } else {
        setError('No se pudo iniciar el micrófono. Revisa el permiso y reintenta.');
      }
      console.warn(e);
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  }, [current, start, cancel, recording]);

  const finishAndSave = useCallback(async () => {
    if (!current || savingRef.current || startingRef.current || !recording) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    try {
      if (!isRecording()) {
        setRecording(false);
        return;
      }
      const variantIndex = clips.filter((c) => c.prayerId === current.prayerId).length;
      const saved = await stopAndSave({
        mystery: mysteryType,
        sequenceIndex: current.slotIndex,
        prayerId: current.prayerId,
        variantIndex,
        voiceLang,
        label: `${current.title} toma ${variantIndex + 1}`,
      });
      setRecording(false);
      if (!saved) {
        setError('La toma fue demasiado corta; no se avanzó.');
        return;
      }
      showToast('Guardado (Tier S)');
      setReviewedSteps((previous) => {
        const next = new Set(previous).add(`${voiceLang}:${mysteryType}:${current.slotIndex}`);
        persistReviewedVoiceSteps(next);
        return next;
      });
      await refreshClips();
      await refreshCoverage();
      advanceSession();
    } catch (e) {
      setError('No se pudo guardar');
      console.warn(e);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [
    current,
    clips,
    recording,
    isRecording,
    stopAndSave,
    mysteryType,
    voiceLang,
    refreshClips,
    refreshCoverage,
    advanceSession,
  ]);
  const startSession = (onlyMissing) => {
    if (busy || loading || coverageError || coverage.length !== sequence.length) {
      showToast(busy ? 'Hay una operación en curso.' : coverageError ? 'No hay cobertura disponible; reintenta.' : 'Esperando cobertura de audio…');
      return;
    }
    cancel();
    setRecording(false);
    setError('');
    setToast('');
    setSessionOnlyMissing(onlyMissing);
    setSessionIndex(0);

    setMode('session');
  };

  const jumpToSlot = (slotIndex) => {
    if (busy) return;
    setSessionOnlyMissing(false);
    setSessionIndex(slotIndex);

    setMode('session');
  };

  const handleSpeechComplete = useCallback(() => {
    finishAndSave();
  }, [finishAndSave]);

  const { start: startSpeech, stop: stopSpeech } = useSpeechAdvance({
    enabled: mode === 'session' && speechOn && !!current?.text,
    expectedText: current?.text ?? '',
    onComplete: handleSpeechComplete,
    lang: voiceLang === 'en' ? 'en-US' : 'es-ES',
  });
  const handleExitSession = useCallback(() => {
    if (saving || starting || uploading) return;
    if (
      recording &&
      typeof window !== 'undefined' &&
      typeof window.confirm === 'function' &&
      !window.confirm('Hay una toma activa. ¿Salir y descartarla?')
    ) {
      return;
    }
    cancel();
    setRecording(false);
    setError('');
    setMode('map');
    refreshCoverage();
  }, [cancel, refreshCoverage, recording, saving, starting, uploading]);

  const playClip = useCallback((clip) => {
    if (busy) return;
    stopClipPlayback();
    const url = blobToObjectUrl(clip);
    if (!url) {
      setError('No se pudo abrir esta toma.');
      return;
    }

    try {
      const audio = new Audio(url);
      audioRef.current = audio;
      const cleanup = () => {
        if (audioRef.current === audio) audioRef.current = null;
        audio.onended = null;
        audio.onerror = null;
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      };
      audio.onended = cleanup;
      audio.onerror = () => {
        cleanup();
        setError('No se pudo reproducir esta toma.');
      };
      const playPromise = audio.play();
      playPromise?.catch(() => {
        cleanup();
        setError('El navegador bloqueó la reproducción de esta toma.');
      });
    } catch (error) {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      setError('No se pudo reproducir esta toma.');
      console.warn('[RecordingStudio] playback', error);
    }
  }, [busy, stopClipPlayback]);
  const handleDeleteClip = useCallback(async (id) => {
    if (busy || deletingClipId) return;
    const clip = clips.find((item) => item.id === id);
    const label = clip?.label || 'esta toma';
    if (
      typeof window !== 'undefined' &&
      typeof window.confirm === 'function' &&
      !window.confirm('¿Eliminar ' + label + '? Esta acción no se puede deshacer.')
    ) {
      return;
    }

    setDeletingClipId(id);
    setError('');
    try {
      await deleteRecording(id);
      await refreshClips();
      await refreshCoverage();
    } catch (error) {
      setError('No se pudo eliminar la toma.');
      console.warn('[RecordingStudio] delete', error);
    } finally {
      setDeletingClipId(null);
    }
  }, [busy, deletingClipId, clips, refreshClips, refreshCoverage]);
  const openUpload = (row) => {
    if (busy || loading || coverageError) return;
    uploadTargetRef.current = row;
    fileInputRef.current?.click();
  };
  const onFilePicked = async (e) => {
    const file = e.target.files?.[0];
    const row = uploadTargetRef.current;
    uploadTargetRef.current = null;
    e.target.value = '';
    if (!file || !row) return;

    const extensionOk = /\.(wav|mp3|ogg|webm|m4a)$/i.test(file.name || '');
    const audioTypeOk = !file.type || file.type.startsWith('audio/') || extensionOk;
    if (!audioTypeOk) {
      setError('Elegí un archivo de audio WAV, MP3, OGG, WEBM o M4A.');
      return;
    }
    if (!file.size || file.size > MAX_AUDIO_UPLOAD_BYTES) {
      setError('El audio debe pesar entre 1 byte y 50 MB.');
      return;
    }

    setError('');
    setUploading(true);
    try {
      await saveRecording({
        mystery: mysteryType,
        sequenceIndex: row.slotIndex,
        prayerId: row.prayerId,
        variantIndex: row.takeCount || 0,
        blob: file,
        mimeType: file.type || 'audio/wav',
        voiceLang,
        label: 'Import · ' + file.name,
      });
      showToast('Audio importado (Tier S)');
      await refreshCoverage();
    } catch (err) {
      setError('No se pudo importar el audio.');
      console.warn('[RecordingStudio] import', err);
    } finally {
      setUploading(false);
    }
  };
  const togglePref = (key) => {
    if (busy) return;
    const next = setVoicePrefs({ [key]: !voicePrefs[key] });
    setVoicePrefsState(next);
  };

  const mysteryLabel = devotionVoiceLabel(mysteryType);

  useEffect(() => {
    if (mode !== 'session' || !recording || !speechOn) {
      stopSpeech();
      return undefined;
    }
    startSpeech();
    return () => stopSpeech();
  }, [mode, recording, speechOn, current?.slotIndex, startSpeech, stopSpeech]);


  useEffect(() => {
    setSessionIndex(0);

  }, [sessionOnlyMissing, mysteryType]);

  return (
    <div className="recording-studio-view">
      <header className="rs-header">
        <h1 className="rs-title">Estudio de voz</h1>
        <p className="rs-sub">
          Liber ▶: 1× oración · 2× auto ≫. Pack = idioma ES|EN|LA. Tier S
          gana si hay grabación; T3 = /voice/{voicePrefs.voiceLang}/.
        </p>
      </header>

      <div className="rs-prefs-row">
        <label className="rs-pref">
          <input
            type="checkbox"
            checked={voicePrefs.useUserVoice}
            disabled={busy}
            onChange={() => togglePref('useUserVoice')}
          />
          Usar tu voz (S)
        </label>
        <label className="rs-pref">
          <input
            type="checkbox"
            checked={voicePrefs.useBundledVoice}
            disabled={busy}
            onChange={() => togglePref('useBundledVoice')}
          />
          Guía T3 ({voiceLang.toUpperCase()})
        </label>
        <label className="rs-pref">
          <input
            type="checkbox"
            checked={voicePrefs.useBrowserTts !== false}
            disabled={busy}
            onChange={() => togglePref('useBrowserTts')}
          />
          TTS navegador {voiceLang.toUpperCase()}
        </label>
        <label className="rs-pref" htmlFor="rs-voice-lang">
          Idioma de la toma
          <select
            id="rs-voice-lang"
            value={voiceLang}
            disabled={busy}
            onChange={(e) => {
              const next = setVoicePrefs({ voiceLang: e.target.value });
              setVoicePrefsState(next);
            }}
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
            <option value="la">LA</option>
          </select>
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
            disabled={busy}
            onChange={(e) => {
              const next = setVoicePrefs({ ttsRate: parseFloat(e.target.value) });
              setVoicePrefsState(next);
            }}
          />
          <span>{Number(voicePrefs.ttsRate ?? 1).toFixed(2)}×</span>
        </label>
        <p className="rs-pref-legend">
          Idioma guía: {voicePrefs.ttsLang || 'en-US'} (sin títulos de oración).
        </p>
      </div>

      <div className="rs-mystery-row">
        <label htmlFor="rs-mystery">Devoción</label>
        <select
          id="rs-mystery"
          value={BOOKLET_MYSTERY_IDS.includes(mysteryType) ? mysteryType : BOOKLET_MYSTERY_IDS[0]}
          disabled={busy}
          onChange={(e) => onMysteryChange?.(e.target.value)}
        >
          {BOOKLET_MYSTERY_IDS.map((id) => (
            <option key={id} value={id}>
              {devotionVoiceLabel(id)}
            </option>
          ))}
        </select>
      </div>

      <div className="rs-stats-card">
        <div className="rs-stat-main">
          <span className="rs-stat-num">{stats.done}</span>
          <span className="rs-stat-den">/ {stats.total}</span>
          <span className="rs-stat-label">con tu voz ({voiceLang.toUpperCase()}) (Tier S)</span>
        </div>
        <div className="rs-progress-bar">
          <div className="rs-progress-fill" style={{ width: `${stats.pct}%` }} />
        </div>
        <p className="rs-stat-meta">
          {stats.missing} sin tu voz · {stats.t3Only} solo T3 · {stats.empty} sin audio Â· {stats.reviewed} revisados
        </p>
      </div>

       {coverageError && (
         <div className="rs-coverage-error" role="alert">
           <span>{coverageError}</span>
           <button type="button" className="rs-ghost" onClick={refreshCoverage} disabled={loading}>
             Reintentar
           </button>
         </div>
       )}
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
          disabled={busy}
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
          disabled={busy}
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
              className={filter === 'unreviewed' ? 'active' : ''}
              onClick={() => setFilter('unreviewed')}
            >
              Sin revisar ({stats.total - stats.reviewed})
            </button>
            <button
              type="button"
              className={filter === 'reviewed' ? 'active' : ''}
              onClick={() => setFilter('reviewed')}
            >
              Revisados ({stats.reviewed})
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
                              ? `Guía T3 ${voiceLang.toUpperCase()}`
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
                        aria-label={'Subir audio para ' + row.title}
                        disabled={busy || loading || !!coverageError}
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
            <button
              type="button"
              className="rs-primary"
              disabled={busy || loading || !!coverageError || stats.missing === 0}
              onClick={() => startSession(true)}
            >
              Grabar faltantes ({stats.missing}) Â· {stats.reviewed} revisados
            </button>
            <button
              type="button"
              className="rs-secondary"
              disabled={busy || loading || !!coverageError}
              onClick={() => startSession(false)}
            >
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
                  Cuando estés listo, pulsa «Empezar grabación». Reza en voz alta y pulsa «Terminé» para guardar esta toma como Tier S.
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
                  Avance automático por voz (opcional) · {getSpeechProviderLabel()}
                </label>

                <div className="rs-session-controls">
                  {recording ? (
                    <button type="button" className="rs-primary" disabled={busy} onClick={finishAndSave}>
                      {saving ? 'Guardando…' : 'Terminé — guardar y siguiente'}
                    </button>
                  ) : (
                    <button type="button" className="rs-secondary" disabled={busy} onClick={beginRecording}>
                      {clips.length > 0 ? 'Grabar otra toma' : 'Empezar grabación'}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={saving || starting || uploading}
                    className="rs-ghost"
                    onClick={handleExitSession}
                  >
                    Salir sesión
                  </button>
                </div>

                {clips.length > 0 && (
                  <ul className="rs-clip-list">
                    {clips.map((clip) => (
                      <li key={clip.id}>
                        <button type="button" disabled={busy} onClick={() => playClip(clip)}>
                          ▶ {clip.label || 'toma'}
                        </button>
                        <button type="button" disabled={busy || deletingClipId === clip.id} onClick={() => handleDeleteClip(clip.id)}>
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
