import React, { useEffect, useState } from 'react';
import { OPTIONAL_PRAYERS } from '../../data/optionalPrayers';
import { applyVariantToVoiceLang, getVoicePrefs } from '../../utils/voicePrefs';
import { playStepVoice, stopStepVoice } from '../../utils/prayerVoicePlayback';
import VitralBackground from './VitralBackground';
import { isTextHeavyImagePath } from '../../data/imageRegistry';
import './OptionalPrayerSheet.css';

function variantVoiceLang(variantId) {
  if (!variantId) return getVoicePrefs().voiceLang || 'es';
  if (variantId === 'en') return 'en';
  if (variantId === 'la' || variantId === 'latin') return 'la';
  return 'es';
}

export default function OptionalPrayerSheet({ onClose, initialPrayerId }) {
  const start =
    OPTIONAL_PRAYERS.find((p) => p.id === initialPrayerId) || OPTIONAL_PRAYERS[0];
  const [prayerId, setPrayerId] = useState(start.id);
  const [variantId, setVariantId] = useState(start.variants[0].id);
  const [playing, setPlaying] = useState(false);

  // Shelf can reopen another breve while sheet stays mounted — sync prayer.
  useEffect(() => {
    const p = OPTIONAL_PRAYERS.find((x) => x.id === initialPrayerId) || OPTIONAL_PRAYERS[0];
    setPrayerId(p.id);
    setVariantId(p.variants[0].id);
    applyVariantToVoiceLang(p.variants[0].id);
    stopStepVoice();
    setPlaying(false);
  }, [initialPrayerId]);

  const prayer = OPTIONAL_PRAYERS.find((p) => p.id === prayerId) || OPTIONAL_PRAYERS[0];
  const variant =
    prayer.variants.find((v) => v.id === variantId) || prayer.variants[0];
  const candidates = (prayer.imgCandidates?.length
    ? prayer.imgCandidates
    : [prayer.img]
  ).filter((u) => u && !isTextHeavyImagePath(u));

  useEffect(() => {
    // Kill Liber ▶/≫ so Guarda doesn't keep hearing Ángelus/Ave under the sheet.
    stopStepVoice();
    window.dispatchEvent(new CustomEvent('rosario-voice-external-stop'));
    return () => stopStepVoice();
  }, []);

  useEffect(() => {
    stopStepVoice();
    setPlaying(false);
  }, [prayerId, variantId]);

  const pickLang = (id) => {
    setVariantId(id);
    applyVariantToVoiceLang(id);
  };

  const pickPrayer = (id) => {
    setPrayerId(id);
    const p = OPTIONAL_PRAYERS.find((x) => x.id === id);
    if (p && !p.variants.some((v) => v.id === variantId)) {
      const next = p.variants[0].id;
      setVariantId(next);
      applyVariantToVoiceLang(next);
    }
  };

  const handlePlayTap = async () => {
    if (playing) {
      stopStepVoice();
      setPlaying(false);
      return;
    }
    const spoken = OPTIONAL_PRAYERS.find((p) => p.id === prayerId);
    const spokenVariant =
      spoken?.variants.find((v) => v.id === variantId) || spoken?.variants[0];
    const text = spokenVariant?.text || variant.text;
    if (!text?.trim()) return;

    setPlaying(true);
    const lang = variantVoiceLang(spokenVariant?.id || variant.id);
    const result = await playStepVoice({
      text,
      prayerId: null,
      mystery: null,
      sequenceIndex: null,
      lang,
      preferBundled: false,
      forceTts: true,
    });
    if (!result?.cancelled) setPlaying(false);
  };

  return (
    <div className="optional-prayer-backdrop" role="presentation">
      <div
        className="optional-prayer-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Oración opcional"
      >
        <VitralBackground
          candidates={candidates}
          kind="prayer"
          useBookletClasses
          style={{ position: 'absolute', inset: 0 }}
        />

        <div className="optional-prayer-sheet__chrome">
          <div className="optional-prayer-sheet__top">
            <button
              type="button"
              className="optional-prayer-sheet__dismiss"
              onClick={onClose}
              aria-label="Cerrar"
              title="Cerrar"
            >
              ✕
            </button>
            <div className="optional-prayer-sheet__tabs">
              {OPTIONAL_PRAYERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`optional-prayer-sheet__tab${p.id === prayerId ? ' active' : ''}`}
                  onClick={() => pickPrayer(p.id)}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <p className="optional-prayer-sheet__hint">
            No cambia tu lugar en el rosario.
          </p>

          <div className="optional-prayer-sheet__title-row">
            <button
              type="button"
              className={`optional-prayer-sheet__play${playing ? ' is-playing' : ''}`}
              onClick={handlePlayTap}
              aria-label={playing ? 'Detener guía' : 'Reproducir guía'}
              title={playing ? 'Detener' : 'Reproducir'}
            >
              {playing ? '⏸' : '▶'}
            </button>
            <h1 className="optional-prayer-sheet__title">{prayer.title}</h1>
            <span className="optional-prayer-sheet__play-spacer" aria-hidden="true" />
          </div>

          <div className="optional-prayer-sheet__langs">
            {prayer.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`optional-prayer-sheet__lang${v.id === variant.id ? ' active' : ''}`}
                onClick={() => pickLang(v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>

          <article className="optional-prayer-sheet__panel glass-scroll-panel">
            <div className="glass-inner booklet-glass-inner stained-glass-overlay optional-prayer-sheet__glass">
              {variant.text.split('\n').map((line, i) => (
                <p key={i} className="booklet-verse">
                  {line || '\u00a0'}
                </p>
              ))}
            </div>
          </article>

          <button type="button" className="optional-prayer-sheet__close" onClick={onClose}>
            Seguir con el rosario
          </button>
        </div>
      </div>
    </div>
  );
}
