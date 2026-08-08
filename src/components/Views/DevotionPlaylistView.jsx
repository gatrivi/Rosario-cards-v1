import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BOOKLET_MYSTERY_IDS } from '../../utils/bookletSequence';
import {
  loadPlaylist,
  savePlaylist,
  getDefaultPlaylist,
  loadPlayStats,
  formatLastPlayed,
  playHeat,
  stepCountFor,
  devotionVoiceLabel,
  MAX_REPEATS,
} from '../../utils/devotionPlaylist';
import { startPlaylist, stopPlaylist, isPlaylistActive } from '../../utils/devotionPlaylistRunner';
import './DevotionPlaylistView.css';

export default function DevotionPlaylistView() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => loadPlaylist());
  const [stats, setStats] = useState(() => loadPlayStats());
  const [playing, setPlaying] = useState(() => isPlaylistActive());

  const persist = useCallback((next) => {
    const saved = savePlaylist(next);
    setItems(saved);
    return saved;
  }, []);

  const missingIds = useMemo(() => {
    const have = new Set(items.map((r) => r.id));
    return BOOKLET_MYSTERY_IDS.filter((id) => !have.has(id));
  }, [items]);

  const move = (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    const tmp = next[index];
    next[index] = next[j];
    next[j] = tmp;
    persist(next);
  };

  const setRepeats = (index, delta) => {
    const next = items.map((row, i) => {
      if (i !== index) return row;
      return {
        ...row,
        repeats: Math.min(MAX_REPEATS, Math.max(1, row.repeats + delta)),
      };
    });
    persist(next);
  };

  const removeAt = (index) => {
    persist(items.filter((_, i) => i !== index));
  };

  const addId = (id) => {
    if (!id || items.some((r) => r.id === id)) return;
    persist([...items, { id, repeats: 1 }]);
  };

  const resetDefault = () => {
    persist(getDefaultPlaylist());
  };

  const clearAll = () => {
    stopPlaylist();
    setPlaying(false);
    persist([]);
  };

  const play = () => {
    const queue = items.length ? items : getDefaultPlaylist();
    if (!items.length) persist(queue);
    setStats(loadPlayStats());
    setPlaying(true);
    startPlaylist(queue, navigate);
  };

  const refreshStats = () => setStats(loadPlayStats());

  return (
    <div className="cola-view" onFocus={refreshStats}>
      <header className="cola-header">
        <h1 className="cola-title">Cola</h1>
        <p className="cola-sub">Corta → larga por defecto · Liber AUTO</p>
      </header>

      <div className="cola-actions">
        <button type="button" className="cola-btn" onClick={resetDefault}>
          Restablecer corta→larga
        </button>
        <button type="button" className="cola-btn cola-btn--primary" onClick={play}>
          {playing ? 'Reproducir de nuevo' : 'Reproducir'}
        </button>
        <button type="button" className="cola-btn cola-btn--ghost" onClick={clearAll}>
          Limpiar
        </button>
      </div>

      <ul className="cola-list" aria-label="Cola de devociones">
        {items.map((row, index) => {
          const st = stats[row.id] || { count: 0, lastAt: 0 };
          const heat = playHeat(st.count);
          return (
            <li key={row.id} className="cola-row">
              <span className={`cola-heat cola-heat--${heat}`} title={`${st.count} veces`} aria-hidden />
              <div className="cola-row-main">
                <span className="cola-row-label">{devotionVoiceLabel(row.id)}</span>
                <span className="cola-row-meta">
                  {stepCountFor(row.id)} pasos · {formatLastPlayed(st.lastAt)}
                </span>
              </div>
              <div className="cola-row-controls">
                <button type="button" className="cola-icon" onClick={() => setRepeats(index, -1)} aria-label="Menos repeticiones">
                  −
                </button>
                <span className="cola-repeats" aria-label="Repeticiones">{row.repeats}</span>
                <button type="button" className="cola-icon" onClick={() => setRepeats(index, 1)} aria-label="Más repeticiones">
                  +
                </button>
                <button type="button" className="cola-icon" onClick={() => move(index, -1)} aria-label="Subir" disabled={index === 0}>
                  ↑
                </button>
                <button type="button" className="cola-icon" onClick={() => move(index, 1)} aria-label="Bajar" disabled={index === items.length - 1}>
                  ↓
                </button>
                <button type="button" className="cola-icon cola-icon--danger" onClick={() => removeAt(index)} aria-label="Quitar">
                  ×
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {missingIds.length > 0 ? (
        <div className="cola-catalog">
          <p className="cola-catalog-label">Añadir</p>
          <div className="cola-catalog-strip">
            {missingIds.map((id) => (
              <button key={id} type="button" className="cola-add" onClick={() => addId(id)}>
                + {devotionVoiceLabel(id)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
