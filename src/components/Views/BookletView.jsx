import React, { useMemo, useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  getVariantStorageKey,
} from '../../data/prayerVariants';
import PrayerRecorder from '../common/PrayerRecorder';
import OptionalPrayerSheet from '../common/OptionalPrayerSheet';
import OfferingLight from '../common/OfferingLight';
import { loadPrayForIntentions } from '../../utils/prayForStore';
import {
  getBookletStepContext,
  stepContextToVitralVars,
  makeBookletRoseFingerprint,
} from '../../utils/bookletProgress';
import { playBookletTransitionSound, playOfferingChime } from '../../utils/bookletSounds';
import {
  pickPrayerImage,
  getLitanyVerseImageCandidates,
  resolveLitanyVerseImage,
  getPrayerImageCandidates,
} from '../../utils/prayerImages';
import { getLitanyVerse, isLitanyPrayer, formatLitanyLine } from '../../utils/litanyHelpers';
import {
  getPrayerVerseCount,
  getPrayerVerseText,
  getPrayerVerseImageCandidates,
  resolvePrayerVerseImage,
} from '../../utils/prayerVerseImages';
import { supportsPerVerseImages } from '../../data/prayerVerseCatalog';
import LitanyEntrance from '../Litany/LitanyEntrance';
import VitralBackground from '../common/VitralBackground';
import BookletPrayerPanel from './BookletPrayerPanel';
import { buildSequence, isDivineMercyMode, isStationsDevotion, isMarianDevotionMode, isSagradoCorazonAdoracionMode, isValidRosaryMystery } from '../../utils/bookletSequence';
import { getDefaultMystery } from '../utils/getDefaultMystery';
import { imagePath as registryImage } from '../../data/imageRegistry';
import {
  ANGELUS_ID,
  MAGNIFICAT_ID,
  angelusThumbnail,
  magnificatThumbnail,
} from '../../data/marianDevotionsData';
import {
  SAGRADO_CORAZON_ADORACION_ID,
  sagradoCorazonAdoracionThumbnail,
} from '../../data/sagradoCorazonAdoracionData';
import FaustinaMercyThumb from '../common/FaustinaMercyThumb';
import StationsDevotionThumb from '../common/StationsDevotionThumb';
import MercyWindowThumb from '../common/MercyWindowThumb';
import DevotionsShelf, { ShelfItem } from '../common/DevotionsShelf';
import { optionalPrayerThumbnail } from '../../data/optionalPrayers';
import { resolveDisplayText } from '../../utils/bookletDisplayText';
import { cleanPrayerDisplayTitle, getSpeakablePrayerText } from '../../utils/speakablePrayerText';
import { getAveMariaRunInfo } from '../../utils/aveMariaRunInfo';
import {
  playStepVoice,
  stopStepVoice,
  nextVoiceMode,
  VOICE_MODES,
} from '../../utils/prayerVoicePlayback';
import PrayerShareCard from '../common/PrayerShareCard';
import PrayerSharePreviewModal from '../common/PrayerSharePreviewModal';
import BookletOutlineView from './BookletOutlineView';
import {
  buildShareCardPayload,
  buildSharePrayerText,
  captureShareCardPng,
  deliverSharePng,
  formatBookletShareProgress,
  getBookletDevotionLabel,
  makeShareFilename,
  preloadShareImage,
} from '../../utils/bookletShare';
import './BookletView.css';
import { devLog } from '../../utils/devotionsDebug';

const TRANSITION_PHASE = {
  READY: 'ready',
  LEAVING: 'leaving',
  LINGER: 'linger',
  ARRIVING: 'arriving',
  ENTERING: 'entering',
};

export const BOOKLET_TIMING = {
  /** Minimum gap before vitral swaps after prayer chrome leaves */
  minGap: 72,
  textOut: 220,
  linger: 280,
  imageBeforeText: 480,
  textIn: 300,
  stepGlow: 380,
};

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const MYSTERY_OPTIONS = [
  {
    id: 'gozosos',
    label: 'Gozosos',
    img: '/gallery-images/misterios/modooscuro/misteriogozo0.webp',
  },
  {
    id: 'dolorosos',
    label: 'Dolorosos',
    img: '/gallery-images/misterios/modooscuro/misteriodolor0.jpg',
  },
  {
    id: 'gloriosos',
    label: 'Gloriosos',
    img: '/gallery-images/misterios/modooscuro/misteriogloria0.jpg',
  },
  {
    id: 'luminosos',
    label: 'Luminosos',
    img: '/gallery-images/misterios/modooscuro/misterioLUZ0.webp',
  },
];

function getDevotionChrome(misterioActual) {
  return getBookletDevotionLabel(misterioActual);
}

function getBookletDisplayTitle(prayer) {
  if (!prayer) return '';
  if (prayer.id === 'DMO1') return 'Expiraste, Jesús';
  if (prayer.id === 'DMO2') return 'Sangre y Agua';
  return cleanPrayerDisplayTitle(prayer.title);
}


export default function BookletView({
  currentPrayerIndex,
  misterioActual,
  onUpdateProgreso,
  onMysteryChange,
  isLeftHanded = false,
  simpleMode = false,
  soundEnabled = true,
  mercyOptionalOpening = true,
  litanyEntranceEnabled = true,
  perVersePrayerImages = false,
  onAveMariaComplete,
  onAveMariaUndo,
  novenaDay = 1,
  onNovenaDayChange,
  openOptionalId = null,
}) {
  const isMercy = isDivineMercyMode(misterioActual);
  const isStations = isStationsDevotion(misterioActual);
  const isMarianDevotion = isMarianDevotionMode(misterioActual);
  const isSagradoCorazon = isSagradoCorazonAdoracionMode(misterioActual);
  const showRosaryPills = !isMercy && !isStations && !isMarianDevotion && !isSagradoCorazon;
  const pickDevotion = useCallback(
    (id, label) => {
      devLog('shelf-pick', { id, label, from: misterioActual });
      onMysteryChange?.(id);
    },
    [misterioActual, onMysteryChange]
  );
  const secuencia = useMemo(
    () => buildSequence(misterioActual, { includeMercyOpening: mercyOptionalOpening, novenaDay }),
    [misterioActual, mercyOptionalOpening, novenaDay]
  );

  useEffect(() => {
    if (showRosaryPills) return;
    devLog('sequence-ready', {
      misterio: misterioActual,
      steps: secuencia.length,
      first: secuencia[0]?.title,
    });
  }, [misterioActual, secuencia, showRosaryPills]);

  const total = secuencia.length;
  const safeIndex = Math.min(
    Math.max(currentPrayerIndex, 0),
    Math.max(total - 1, 0)
  );
  const [displayIndex, setDisplayIndex] = useState(safeIndex);
  const [transitionPhase, setTransitionPhase] = useState(TRANSITION_PHASE.READY);
  const transitionPhaseRef = useRef(TRANSITION_PHASE.READY);
  const transitionTimersRef = useRef([]);
  const imageReadyRef = useRef(true);
  const afterImageReadyRef = useRef(null);
  const activePrayer = secuencia[displayIndex];
  const isTransitioning = transitionPhase !== TRANSITION_PHASE.READY;

  const variants = activePrayer?.variants;
  const [variantId, setVariantId] = useState(() => {
    if (!activePrayer?.variants?.length) return null;
    try {
      const saved = localStorage.getItem(getVariantStorageKey(activePrayer.id));
      if (saved && activePrayer.variants.some((v) => v.id === saved)) return saved;
    } catch (_) { /* ignore */ }
    return activePrayer.variants[0].id;
  });
  const [stepGlow, setStepGlow] = useState(false);
  const [offeringLight, setOfferingLight] = useState(false);
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [optionalPrayerId, setOptionalPrayerId] = useState('guardian');
  const [optionalGlow, setOptionalGlow] = useState(false);
  const optionalIdleRef = useRef(null);
  const mountedRef = useRef(true);
  const [shelfOpen, setShelfOpen] = useState(false);
  const prevIndexRef = useRef(safeIndex);
  const isFirstRenderRef = useRef(true);
  const [litanyVerseIndex, setLitanyVerseIndex] = useState(0);
  const [prayerVerseIndex, setPrayerVerseIndex] = useState(0);
  const [showLitanyEntrance, setShowLitanyEntrance] = useState(false);
  const litanyEntranceShownRef = useRef(false);
  const shareCardRef = useRef(null);
  const shareBlobRef = useRef(null);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [sharePreviewOpen, setSharePreviewOpen] = useState(false);
  const [sharePreviewUrl, setSharePreviewUrl] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [voiceMode, setVoiceMode] = useState(VOICE_MODES.OFF);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const voiceModeRef = useRef(VOICE_MODES.OFF);
  const canAdvanceVoiceRef = useRef(false);

  // Always-on step autoplay removed — Liber ▶ owns once/auto (see prayerVoicePlayback).

  const isLitany = isLitanyPrayer(activePrayer);
  const isPerVersePrayer = perVersePrayerImages && supportsPerVerseImages(activePrayer?.id);
  const prayerVerseTotal = isPerVersePrayer ? getPrayerVerseCount(activePrayer.id) : 0;
  const litanyVerse = isLitany ? getLitanyVerse(litanyVerseIndex, activePrayer) : null;
  const litanyVerseTotal = activePrayer?.verses?.length || 0;
  const innerVerseIndex = isLitany ? litanyVerseIndex : prayerVerseIndex;
  const innerVerseTotal = isLitany ? litanyVerseTotal : prayerVerseTotal;
  const hasInnerVerses = isLitany || isPerVersePrayer;

  useEffect(() => {
    if (activePrayer?.id === 'LL') {
      setLitanyVerseIndex(0);
      if (litanyEntranceEnabled && !litanyEntranceShownRef.current) {
        setShowLitanyEntrance(true);
        litanyEntranceShownRef.current = true;
      }
    } else {
      setLitanyVerseIndex(0);
      setShowLitanyEntrance(false);
    }
    setPrayerVerseIndex(0);
  }, [displayIndex, activePrayer?.id, litanyEntranceEnabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const resetOptionalIdle = useCallback(() => {
    setOptionalGlow(false);
    if (optionalIdleRef.current) clearTimeout(optionalIdleRef.current);
    optionalIdleRef.current = setTimeout(() => {
      if (mountedRef.current) setOptionalGlow(true);
    }, 30000);
  }, []);

  const openOptionalPrayer = useCallback((id = 'guardian') => {
    setOptionalPrayerId(id);
    setShelfOpen(false);
    setOptionalOpen(true);
    resetOptionalIdle();
  }, [resetOptionalIdle]);

  // Deep link ?oracion=expedito (etc.) — open once when Libro mounts with id.
  useEffect(() => {
    if (!openOptionalId || !optionalPrayerThumbnail(openOptionalId)) return;
    openOptionalPrayer(openOptionalId);
  }, [openOptionalId, openOptionalPrayer]);

  useEffect(() => {
    resetOptionalIdle();
    return () => {
      if (optionalIdleRef.current) clearTimeout(optionalIdleRef.current);
    };
  }, [safeIndex, misterioActual, optionalOpen, resetOptionalIdle]);

  const setPhase = useCallback((phase) => {
    transitionPhaseRef.current = phase;
    setTransitionPhase(phase);
  }, []);

  const clearTransitionTimers = useCallback(() => {
    transitionTimersRef.current.forEach((id) => clearTimeout(id));
    transitionTimersRef.current = [];
  }, []);

  const scheduleTransition = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    transitionTimersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => () => clearTransitionTimers(), [clearTransitionTimers]);

  useEffect(() => {
    clearTransitionTimers();
    setPhase(TRANSITION_PHASE.READY);
    setDisplayIndex(safeIndex);
  }, [misterioActual, clearTransitionTimers, setPhase, safeIndex]);

  useEffect(() => {
    if (transitionPhaseRef.current === TRANSITION_PHASE.READY && displayIndex !== safeIndex) {
      setDisplayIndex(safeIndex);
    }
  }, [safeIndex, displayIndex]);

  const beginTextEnter = useCallback(() => {
    setPhase(TRANSITION_PHASE.ENTERING);
    scheduleTransition(() => setPhase(TRANSITION_PHASE.READY), BOOKLET_TIMING.textIn);
  }, [scheduleTransition, setPhase]);

  const beginArrivingHold = useCallback(() => {
    imageReadyRef.current = false;
    afterImageReadyRef.current = () => {
      scheduleTransition(beginTextEnter, BOOKLET_TIMING.imageBeforeText);
    };
    scheduleTransition(() => {
      if (!afterImageReadyRef.current) return;
      imageReadyRef.current = true;
      const run = afterImageReadyRef.current;
      afterImageReadyRef.current = null;
      run();
    }, 900);
  }, [beginTextEnter, scheduleTransition]);

  const handleImageReady = useCallback(() => {
    imageReadyRef.current = true;
    if (
      transitionPhaseRef.current === TRANSITION_PHASE.ARRIVING &&
      afterImageReadyRef.current
    ) {
      const run = afterImageReadyRef.current;
      afterImageReadyRef.current = null;
      run();
    }
  }, []);

  useEffect(() => {
    if (!activePrayer?.variants?.length) {
      setVariantId(null);
      return;
    }
    try {
      const saved = localStorage.getItem(getVariantStorageKey(activePrayer.id));
      if (saved && activePrayer.variants.some((v) => v.id === saved)) {
        setVariantId(saved);
        return;
      }
    } catch (_) { /* ignore */ }
    setVariantId(activePrayer.variants[0].id);
  }, [activePrayer?.id, activePrayer?.variants]);

  const displayText = useMemo(() => {
    if (isPerVersePrayer) {
      return getPrayerVerseText(activePrayer.id, prayerVerseIndex) || '';
    }
    return resolveDisplayText(activePrayer, variantId);
  }, [activePrayer, variantId, isPerVersePrayer, prayerVerseIndex]);

  const bumpInnerVerse = useCallback((delta) => {
    if (isLitany) {
      setLitanyVerseIndex((prev) => {
        const max = litanyVerseTotal - 1;
        if (max < 0) return 0;
        return Math.min(Math.max(prev + delta, 0), max);
      });
    } else if (isPerVersePrayer) {
      setPrayerVerseIndex((prev) => {
        const max = prayerVerseTotal - 1;
        if (max < 0) return 0;
        return Math.min(Math.max(prev + delta, 0), max);
      });
    }
    setStepGlow(true);
    scheduleTransition(() => setStepGlow(false), BOOKLET_TIMING.stepGlow);
  }, [isLitany, isPerVersePrayer, litanyVerseTotal, prayerVerseTotal, scheduleTransition]);

  const cycleVariant = useCallback(() => {
    if (!variants?.length) return;
    const idx = variants.findIndex((v) => v.id === variantId);
    const next = variants[(idx + 1) % variants.length];
    setVariantId(next.id);
    try {
      localStorage.setItem(getVariantStorageKey(activePrayer.id), next.id);
    } catch (_) { /* ignore */ }
  }, [variants, variantId, activePrayer?.id]);

  const navigateTo = useCallback(
    (newIndex) => {
      if (newIndex < 0 || newIndex >= total || newIndex === displayIndex) return;
      if (transitionPhaseRef.current !== TRANSITION_PHASE.READY) return;

      const oldIndex = displayIndex;
      const leaving = secuencia[oldIndex];
      const entering = secuencia[newIndex];
      const enteringCtx = getBookletStepContext(secuencia, newIndex, total);

      if (newIndex > oldIndex) {
        if (leaving?.id === 'A' && !isMercy) {
          const fp = makeBookletRoseFingerprint(
            getAveMariaRunInfo(secuencia, oldIndex),
            getBookletStepContext(secuencia, oldIndex, total).mysteryDecade
          );
          onAveMariaComplete?.(fp);
        }
      } else if (newIndex < oldIndex && secuencia[newIndex]?.id === 'A' && !isMercy) {
        onAveMariaUndo?.();
      }

      const finishSwap = () => {
        setDisplayIndex(newIndex);
        onUpdateProgreso(newIndex);
        playBookletTransitionSound({
          prayerId: entering?.id,
          stepContext: enteringCtx,
          soundEnabled,
        });
        setStepGlow(true);
        scheduleTransition(() => setStepGlow(false), BOOKLET_TIMING.stepGlow);
        setPhase(TRANSITION_PHASE.ARRIVING);
        beginArrivingHold();
        scheduleTransition(() => {
          if (!afterImageReadyRef.current) return;
          imageReadyRef.current = true;
          handleImageReady();
        }, 48);
      };

      if (newIndex > oldIndex) {
        setOfferingLight(true);
        playOfferingChime(soundEnabled);
        scheduleTransition(() => setOfferingLight(false), 900);
      }

      if (prefersReducedMotion()) {
        setDisplayIndex(newIndex);
        onUpdateProgreso(newIndex);
        playBookletTransitionSound({
          prayerId: entering?.id,
          stepContext: enteringCtx,
          soundEnabled,
        });
        setPhase(TRANSITION_PHASE.READY);
        return;
      }

      setPhase(TRANSITION_PHASE.LEAVING);
      scheduleTransition(() => {
        setPhase(TRANSITION_PHASE.LINGER);
        scheduleTransition(finishSwap, BOOKLET_TIMING.linger);
      }, BOOKLET_TIMING.textOut);
    },
    [
      displayIndex,
      secuencia,
      total,
      onUpdateProgreso,
      onAveMariaComplete,
      onAveMariaUndo,
      soundEnabled,
      isMercy,
      scheduleTransition,
      setPhase,
      beginArrivingHold,
      handleImageReady,
    ]
  );

  const goPrev = useCallback(() => {
    if (hasInnerVerses && innerVerseIndex > 0) {
      bumpInnerVerse(-1);
      return;
    }
    if (displayIndex > 0) navigateTo(displayIndex - 1);
  }, [hasInnerVerses, innerVerseIndex, bumpInnerVerse, navigateTo, displayIndex]);

  const goNext = useCallback(() => {
    if (hasInnerVerses && innerVerseIndex < innerVerseTotal - 1) {
      bumpInnerVerse(1);
      return;
    }
    if (displayIndex < total - 1) navigateTo(displayIndex + 1);
  }, [hasInnerVerses, innerVerseIndex, innerVerseTotal, bumpInnerVerse, navigateTo, displayIndex, total]);

  voiceModeRef.current = voiceMode;
  canAdvanceVoiceRef.current =
    (hasInnerVerses && innerVerseIndex < innerVerseTotal - 1) || displayIndex < total - 1;

  const speakableText = useMemo(() => {
    if (isLitany && litanyVerse) return formatLitanyLine(litanyVerse);
    if (isPerVersePrayer) {
      return getPrayerVerseText(activePrayer?.id, prayerVerseIndex) || '';
    }
    return getSpeakablePrayerText(activePrayer);
  }, [isLitany, litanyVerse, isPerVersePrayer, activePrayer, prayerVerseIndex]);

  const voiceStepKey = `${misterioActual}:${displayIndex}:${innerVerseIndex}:${activePrayer?.id || ''}`;

  useEffect(() => {
    voiceModeRef.current = VOICE_MODES.OFF;
    setVoiceMode(VOICE_MODES.OFF);
    setVoicePlaying(false);
    stopStepVoice();
  }, [misterioActual]);

  useEffect(() => {
    if (!soundEnabled || voiceMode === VOICE_MODES.OFF || isTransitioning) {
      if (voiceMode === VOICE_MODES.OFF || isTransitioning) {
        stopStepVoice();
        setVoicePlaying(false);
      }
      return undefined;
    }

    let cancelled = false;
    setVoicePlaying(true);
    (async () => {
      const result = await playStepVoice({
        text: speakableText,
        prayerId: activePrayer?.id,
        mystery: misterioActual,
        sequenceIndex: displayIndex,
      });
      if (cancelled) return;
      setVoicePlaying(false);
      if (result.cancelled || !result.ended) return;
      const mode = voiceModeRef.current;
      if (mode === VOICE_MODES.ONCE) return;
      if (mode === VOICE_MODES.AUTO) {
        if (canAdvanceVoiceRef.current) goNext();
        else setVoiceMode(VOICE_MODES.OFF);
      }
    })();

    return () => {
      cancelled = true;
      stopStepVoice();
    };
    // ponytail: voiceMode===off gates; once→auto must not restart mid-utterance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceStepKey, voiceMode === VOICE_MODES.OFF, soundEnabled, isTransitioning, speakableText]);

  const handleVoiceControlTap = useCallback(() => {
    if (!soundEnabled) return;
    const mode = voiceModeRef.current;
    if (voicePlaying) {
      stopStepVoice();
      setVoicePlaying(false);
      setVoiceMode(VOICE_MODES.OFF);
      return;
    }
    if (mode === VOICE_MODES.ONCE) {
      setVoiceMode(VOICE_MODES.AUTO);
      if (canAdvanceVoiceRef.current) goNext();
      return;
    }
    const next = nextVoiceMode(mode, 'tap');
    if (next === VOICE_MODES.OFF) {
      stopStepVoice();
      setVoicePlaying(false);
    }
    setVoiceMode(next);
  }, [soundEnabled, voicePlaying, goNext]);

  useEffect(() => {
    return () => stopStepVoice();
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        goPrev();
      }
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext]);

  // BottomNav ‹ › icons (same bar as Libro/Rosa) — keep booklet footer for Devociones only.
  useEffect(() => {
    const onStep = (event) => {
      const dir = event?.detail?.dir;
      if (dir < 0) goPrev();
      else if (dir > 0) goNext();
    };
    window.addEventListener('rosario-booklet-step', onStep);
    return () => window.removeEventListener('rosario-booklet-step', onStep);
  }, [goPrev, goNext]);

  const stepContext = useMemo(
    () => getBookletStepContext(secuencia, displayIndex, total),
    [secuencia, displayIndex, total]
  );

  const chromePhaseClass =
    transitionPhase === TRANSITION_PHASE.LEAVING
      ? ' booklet-prayer-chrome--leaving'
      : transitionPhase === TRANSITION_PHASE.LINGER ||
          transitionPhase === TRANSITION_PHASE.ARRIVING
        ? ' booklet-prayer-chrome--hidden'
        : transitionPhase === TRANSITION_PHASE.ENTERING
          ? ' booklet-prayer-chrome--entering'
          : '';

  const aveRunInfo = stepContext.aveRun;
  const mercyRunInfo = stepContext.mercyRun;
  const tripletRunInfo = stepContext.tripletRun;
  const isAveMaria = activePrayer?.id === 'A' && aveRunInfo && !isMercy;
  const isMercyPassion = activePrayer?.id === 'MP' && mercyRunInfo;
  const isMercyDecade = activePrayer?.id === 'EF' && stepContext.kind === 'decade';
  const isHolyGod = activePrayer?.id === 'HG' && tripletRunInfo;
  const isOptionalMercyStep =
    isMercy && (activePrayer?.id === 'DMO1' || activePrayer?.id === 'DMO2');
  const displayPrayerTitle = getBookletDisplayTitle(activePrayer);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      prevIndexRef.current = safeIndex;
      return undefined;
    }
    prevIndexRef.current = safeIndex;
    return undefined;
  }, [safeIndex]);

  const vitralCandidates = useMemo(() => {
    if (!activePrayer) return [];
    if (isLitany && litanyVerse) {
      const all = getLitanyVerseImageCandidates(litanyVerse, activePrayer, litanyVerseIndex);
      const picked = resolveLitanyVerseImage(litanyVerse, activePrayer, litanyVerseIndex);
      return [picked, ...all.filter((u) => u !== picked)];
    }
    if (isPerVersePrayer) {
      const all = getPrayerVerseImageCandidates(
        activePrayer.id,
        prayerVerseIndex,
        activePrayer,
        misterioActual
      );
      const picked = resolvePrayerVerseImage(
        activePrayer.id,
        prayerVerseIndex,
        activePrayer,
        misterioActual
      );
      return [picked, ...all.filter((u) => u !== picked)];
    }
    const all = activePrayer.imgCandidates?.length
      ? activePrayer.imgCandidates
      : getPrayerImageCandidates(activePrayer, misterioActual);
    const picked = pickPrayerImage(all, safeIndex);
    return [picked, ...all.filter((u) => u !== picked)];
  }, [
    activePrayer,
    safeIndex,
    isLitany,
    litanyVerse,
    litanyVerseIndex,
    isPerVersePrayer,
    prayerVerseIndex,
    misterioActual,
  ]);

  const devotionChrome = getDevotionChrome(misterioActual);

  const shareProgressLabel = useMemo(
    () =>
      formatBookletShareProgress({
        displayIndex,
        total,
        isSagradoCorazon,
        misterioActual,
        novenaDay,
        activePrayerId: activePrayer?.id,
        isLitany,
        litanyVerseIndex,
        litanyVerseTotal,
        isPerVersePrayer,
        prayerVerseIndex,
        prayerVerseTotal,
        stepContext,
        isMercy,
        isAveMaria,
        aveRunInfo,
        mercyRunInfo,
        tripletRunInfo,
        isMercyDecade,
        isMercyPassion,
        isHolyGod,
      }),
    [
      displayIndex,
      total,
      isSagradoCorazon,
      misterioActual,
      novenaDay,
      activePrayer?.id,
      isLitany,
      litanyVerseIndex,
      litanyVerseTotal,
      isPerVersePrayer,
      prayerVerseIndex,
      prayerVerseTotal,
      stepContext,
      isMercy,
      isAveMaria,
      aveRunInfo,
      mercyRunInfo,
      tripletRunInfo,
      isMercyDecade,
      isMercyPassion,
      isHolyGod,
    ]
  );

  const shareCardPayload = useMemo(
    () =>
      buildShareCardPayload({
        misterioActual,
        prayerTitle: displayPrayerTitle,
        prayerText: buildSharePrayerText({ displayText, isLitany, litanyVerse }),
        backgroundUrl: vitralCandidates[0],
        progressLabel: shareProgressLabel,
      }),
    [
      misterioActual,
      displayPrayerTitle,
      displayText,
      isLitany,
      litanyVerse,
      vitralCandidates,
      shareProgressLabel,
    ]
  );

  const closeSharePreview = useCallback(() => {
    if (sharePreviewUrl) URL.revokeObjectURL(sharePreviewUrl);
    setSharePreviewUrl(null);
    setSharePreviewOpen(false);
    shareBlobRef.current = null;
  }, [sharePreviewUrl]);

  const handleSharePrayer = useCallback(async () => {
    if (isSharing || isTransitioning || !activePrayer) return;
    setIsSharing(true);
    try {
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
      await preloadShareImage(shareCardPayload.backgroundUrl);
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
      const blob = await captureShareCardPng(shareCardRef.current);
      shareBlobRef.current = blob;
      const filename = makeShareFilename(displayPrayerTitle);
      const outcome = await deliverSharePng(blob, {
        filename,
        title: displayPrayerTitle,
        text: `${shareCardPayload.devotionTitle}${shareCardPayload.prayerTitle ? ` — ${shareCardPayload.prayerTitle}` : ''}`,
        url: typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}`
          : undefined,
      });
      if (outcome === 'preview') {
        setSharePreviewUrl(URL.createObjectURL(blob));
        setSharePreviewOpen(true);
      }
    } catch (_) {
      if (shareBlobRef.current) {
        setSharePreviewUrl(URL.createObjectURL(shareBlobRef.current));
        setSharePreviewOpen(true);
      }
    } finally {
      setIsSharing(false);
    }
  }, [
    isSharing,
    isTransitioning,
    activePrayer,
    shareCardPayload,
    displayPrayerTitle,
  ]);

  const handleSharePreviewDownload = useCallback(() => {
    const blob = shareBlobRef.current;
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = makeShareFilename(displayPrayerTitle);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [displayPrayerTitle]);

  const handleOutlineSelect = useCallback(
    (index) => {
      setOutlineOpen(false);
      navigateTo(index);
    },
    [navigateTo]
  );

  useEffect(() => () => {
    if (sharePreviewUrl) URL.revokeObjectURL(sharePreviewUrl);
  }, [sharePreviewUrl]);

  if (!activePrayer) {
    return (
      <div className="booklet-view booklet-view--empty">
        <p>No se encontraron oraciones para este misterio.</p>
      </div>
    );
  }

  const activeVariantLabel = variants?.find((v) => v.id === variantId)?.label;

  const vitralStyle = stepContextToVitralVars(stepContext);
  const vitralKind = isAveMaria || isMercyPassion
    ? 'ave'
    : stepContext.kind === 'mystery' || stepContext.kind === 'decade'
      ? 'mystery'
      : 'prayer';

  return (
    <div className="booklet-view" style={vitralStyle} onPointerDown={resetOptionalIdle}>
      <VitralBackground
        candidates={vitralCandidates}
        kind={vitralKind}
        stepGlow={stepGlow}
        crossfade
        onReady={handleImageReady}
        useBookletClasses
      />

      <div className={`booklet-prayer-chrome${chromePhaseClass}`}>
        <header className="booklet-header">
          {showRosaryPills && !shelfOpen && (
          <div className="booklet-mystery-bar">
            <div className="booklet-mystery-row">
              {MYSTERY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`booklet-mystery-pill${
                    misterioActual === opt.id ? ' booklet-mystery-pill--active' : ''
                  }`}
                  onClick={() => onMysteryChange?.(opt.id)}
                  disabled={isTransitioning}
                  aria-label={opt.label}
                >
                  <img
                    src={opt.img}
                    alt={opt.label}
                    className="booklet-mystery-pill__thumb-img"
                    draggable={false}
                  />
                  <span className="booklet-mystery-pill__thumb-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          )}
          {misterioActual === 'divinamisericordia_novena' && (
            <div className="booklet-novena-selector">
              <span className="booklet-novena-selector__label">Día</span>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    resetOptionalIdle();
                    onNovenaDayChange?.(d);
                  }}
                  disabled={isTransitioning}
                  className={`booklet-novena-day-btn${novenaDay === d ? ' booklet-novena-day-btn--active' : ''}`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
          <div className="booklet-share-actions">
            <button
              type="button"
              className="booklet-share-btn"
              onClick={() => setOutlineOpen(true)}
              disabled={isTransitioning || total < 2}
              title="Ver recorrido de la devoción"
              aria-label="Ver recorrido de la devoción"
            >
              Recorrido
            </button>
            <button
              type="button"
              className="booklet-share-btn booklet-share-btn--primary"
              onClick={handleSharePrayer}
              disabled={isTransitioning || isSharing}
              title="Compartir esta oración"
              aria-label="Compartir esta oración"
            >
              {isSharing ? '…' : 'Compartir'}
            </button>
          </div>
          <p className="booklet-progress" data-testid="booklet-progress">
            {showRosaryPills && (
              <>
                <button
                  type="button"
                  className={`booklet-optional-btn${optionalGlow ? ' booklet-optional-btn--glow' : ''}`}
                  onClick={() => openOptionalPrayer('guardian')}
                  title="Oraciones opcionales: Ángel de la Guarda y San Benito"
                  aria-label="Oraciones opcionales: Ángel de la Guarda y San Benito"
                >
                  <span className="booklet-optional-btn__star" aria-hidden>✦</span>
                  <span className="booklet-optional-btn__label">Ángel · Benito</span>
                </button>
                {' '}
              </>
            )}
            {isOptionalMercyStep && (
              <button
                type="button"
                className="booklet-mercy-info"
                title="Oración opcional de apertura. Puedes omitirla en Ajustes."
                aria-label="Oración opcional de apertura. Puedes omitirla en Ajustes."
              >
                ⓘ
              </button>
            )}
            {isOptionalMercyStep && ' '}
            {isSagradoCorazon
              ? `Paso ${displayIndex + 1} de ${total}`
              : `${displayIndex + 1} / ${total}`}
            {misterioActual === 'divinamisericordia_novena' && activePrayer?.id === 'NOVENA_DAY_INTENTION' && (
              <span className="booklet-ave-count">
                {' '}
                · Día {novenaDay} de 9
              </span>
            )}
            {isLitany && litanyVerseTotal > 0 && (
              <span className="booklet-ave-count">
                {' '}
                · letanía {litanyVerseIndex + 1} / {litanyVerseTotal}
              </span>
            )}
            {isPerVersePrayer && prayerVerseTotal > 0 && (
              <span className="booklet-ave-count">
                {' '}
                · verso {prayerVerseIndex + 1} / {prayerVerseTotal}
              </span>
            )}
            {isAveMaria && (
              <span className="booklet-ave-count">
                {' '}
                · {aveRunInfo.position} de {aveRunInfo.total}
              </span>
            )}
            {isMercyPassion && (
              <span className="booklet-ave-count">
                {' '}
                · {mercyRunInfo.position} de {mercyRunInfo.total}
              </span>
            )}
            {isHolyGod && (
              <span className="booklet-ave-count">
                {' '}
                · {tripletRunInfo.position} de {tripletRunInfo.total}
              </span>
            )}
            {stepContext.kind === 'mystery' && stepContext.mysteryDecade && (
              <span className="booklet-ave-count">
                {' '}
                · misterio {stepContext.mysteryDecade} de 5
              </span>
            )}
            {isMercyDecade && stepContext.mysteryDecade && (
              <span className="booklet-ave-count">
                {' '}
                · década {stepContext.mysteryDecade} de 5
              </span>
            )}
          </p>
          {!shelfOpen && (
          <p
            className={`booklet-devotion${isMercy ? ' booklet-devotion--mercy' : ''}`}
            aria-live="polite"
          >
            <span className="booklet-devotion__title">{devotionChrome.title}</span>
            {devotionChrome.subtitle && (
              <span className="booklet-devotion__subtitle">{devotionChrome.subtitle}</span>
            )}
          </p>
          )}
          <PrayerRecorder
            prayerId={activePrayer.id}
            prayerTitle={displayPrayerTitle}
            mystery={misterioActual}
            sequenceIndex={displayIndex}
            simpleMode={simpleMode}
            placement="title"
            isLeftHanded={isLeftHanded}
            voiceControlEnabled
            voiceMode={voiceMode}
            voicePlaying={voicePlaying}
            onVoiceControlTap={handleVoiceControlTap}
          >
            <h1
              className={`booklet-title${isAveMaria || isMercyPassion ? ' booklet-title--ave' : ''}${stepContext.kind === 'mystery' || isMercyDecade ? ' booklet-title--mystery' : ''}`}
              style={{ fontSize: simpleMode ? '1.75rem' : '1.35rem' }}
            >
              {displayPrayerTitle}
              {isOptionalMercyStep && (
                <span className="booklet-optional-chip">opcional</span>
              )}
            </h1>
          </PrayerRecorder>
          {variants && (
            <button
              type="button"
              className="booklet-variant-turn"
              onClick={cycleVariant}
              aria-label={`Cambiar versión del ${activePrayer.title}`}
              disabled={isTransitioning}
            >
              ◇ {activeVariantLabel}
              <span className="booklet-variant-turn__hint"> · tocar para otra versión</span>
            </button>
          )}
        </header>

        <BookletPrayerPanel
          displayText={displayText}
          simpleMode={simpleMode}
          isAveMaria={Boolean(isAveMaria)}
          isLitany={isLitany}
          litanyVerse={litanyVerse}
          litanyVerseIndex={litanyVerseIndex}
          litanyVerseTotal={litanyVerseTotal}
          litanySections={activePrayer.sections}
          misterioActual={misterioActual}
          stepContext={stepContext}
          variant="booklet"
          isTransitioning={isTransitioning}
          onTapNav={(dir) => (dir === 'next' ? goNext() : goPrev())}
        />
      </div>

      <OfferingLight
        active={offeringLight}
        count={Math.max(loadPrayForIntentions().length, 1)}
      />

      {optionalOpen && (
        <OptionalPrayerSheet
          initialPrayerId={optionalPrayerId}
          onClose={() => setOptionalOpen(false)}
        />
      )}

      {showLitanyEntrance && litanyEntranceEnabled && (
        <LitanyEntrance
          currentMystery={misterioActual}
          onComplete={() => setShowLitanyEntrance(false)}
        />
      )}

      {isSharing &&
        createPortal(
          <div className="booklet-share-capture-host" aria-hidden="true">
            <PrayerShareCard ref={shareCardRef} {...shareCardPayload} />
          </div>,
          document.body
        )}

      {outlineOpen && (
        <BookletOutlineView
          steps={secuencia}
          currentIndex={displayIndex}
          devotionTitle={devotionChrome.title}
          devotionSubtitle={devotionChrome.subtitle}
          mysteryType={misterioActual}
          onSelectStep={handleOutlineSelect}
          onClose={() => setOutlineOpen(false)}
        />
      )}

      {sharePreviewOpen && (
        <PrayerSharePreviewModal
          imageUrl={sharePreviewUrl}
          onClose={closeSharePreview}
          onDownload={handleSharePreviewDownload}
        />
      )}

      {/* Host only — toggle lives in BottomNav (Libro). */}
      <DevotionsShelf
        externalToggle
        misterioActual={misterioActual}
        active={!showRosaryPills}
        open={shelfOpen}
        onOpenChange={setShelfOpen}
        recorridos={
          <>
            <ShelfItem label="Estaciones">
              <StationsDevotionThumb
                misterioActual={misterioActual}
                onMysteryChange={onMysteryChange}
              />
            </ShelfItem>
            <ShelfItem label="Letanía Sangre">
              <MercyWindowThumb
                active={misterioActual === 'sangrepreciosa_litany'}
                onClick={() => pickDevotion('sangrepreciosa_litany', 'Letanía Sangre')}
                title="Letanía de la Preciosísima Sangre (Julio)"
                img={registryImage('vitreauxCruz')}
                badge="L"
              />
            </ShelfItem>
            <ShelfItem label="Corona Sangre">
              <MercyWindowThumb
                active={misterioActual === 'sangrepreciosa_chaplet'}
                onClick={() => pickDevotion('sangrepreciosa_chaplet', 'Corona Sangre')}
                title="Corona de la Preciosísima Sangre"
                img={registryImage('crux')}
                badge="C"
              />
            </ShelfItem>
            <ShelfItem label="7 Ofrendas">
              <MercyWindowThumb
                active={misterioActual === 'sangrepreciosa_ofrendas'}
                onClick={() => pickDevotion('sangrepreciosa_ofrendas', '7 Ofrendas')}
                title="Siete Ofrendas de la Sangre de Cristo"
                img={registryImage('lamb')}
                badge="7"
              />
            </ShelfItem>
            <ShelfItem label="Sagrado Corazón">
              <MercyWindowThumb
                active={misterioActual === SAGRADO_CORAZON_ADORACION_ID}
                onClick={() => pickDevotion(SAGRADO_CORAZON_ADORACION_ID, 'Sagrado Corazón')}
                title="Adoración Eucarística — Sagrado Corazón de Jesús"
                img={sagradoCorazonAdoracionThumbnail}
                badge="SC"
              />
            </ShelfItem>
            <ShelfItem label="Sta. Faustina">
              <FaustinaMercyThumb
                misterioActual={misterioActual}
                onMysteryChange={onMysteryChange}
              />
            </ShelfItem>
          </>
        }
        breves={
          <>
            <ShelfItem label="Ángelus">
              <MercyWindowThumb
                active={misterioActual === ANGELUS_ID}
                onClick={() => pickDevotion(ANGELUS_ID, 'Ángelus')}
                title="Ángelus"
                img={angelusThumbnail}
                badge="A"
              />
            </ShelfItem>
            <ShelfItem label="Magnificat">
              <MercyWindowThumb
                active={misterioActual === MAGNIFICAT_ID}
                onClick={() => pickDevotion(MAGNIFICAT_ID, 'Magnificat')}
                title="Magnificat"
                img={magnificatThumbnail}
                badge="M"
              />
            </ShelfItem>
            <ShelfItem label="Virgen del Carmen">
              <MercyWindowThumb
                active={optionalOpen && optionalPrayerId === 'carmen'}
                onClick={() => openOptionalPrayer('carmen')}
                title="Virgen del Carmen — 16 de julio"
                img={optionalPrayerThumbnail('carmen')}
                badge="16"
              />
            </ShelfItem>
            <ShelfItem label="Ángel Guarda">
              <MercyWindowThumb
                active={optionalOpen && optionalPrayerId === 'guardian'}
                onClick={() => openOptionalPrayer('guardian')}
                title="Ángel de la Guarda"
                img={optionalPrayerThumbnail('guardian')}
                badge="Á"
              />
            </ShelfItem>
            <ShelfItem label="San Miguel">
              <MercyWindowThumb
                active={optionalOpen && optionalPrayerId === 'michael'}
                onClick={() => openOptionalPrayer('michael')}
                title="San Miguel Arcángel"
                img={optionalPrayerThumbnail('michael')}
                badge="SM"
              />
            </ShelfItem>
            <ShelfItem label="San Expedito">
              <MercyWindowThumb
                active={optionalOpen && optionalPrayerId === 'expedito'}
                onClick={() => openOptionalPrayer('expedito')}
                title="San Expedito — causas urgentes (HODIE)"
                img={optionalPrayerThumbnail('expedito')}
                badge="H"
              />
            </ShelfItem>
            <ShelfItem label="San Benito">
              <MercyWindowThumb
                active={optionalOpen && optionalPrayerId === 'benedict'}
                onClick={() => openOptionalPrayer('benedict')}
                title="San Benito"
                img={optionalPrayerThumbnail('benedict')}
                badge="B"
              />
            </ShelfItem>
          </>
        }
        proximas={null}
        onReturnToRosary={
          !isValidRosaryMystery(misterioActual)
            ? () => onMysteryChange?.(getDefaultMystery())
            : undefined
        }
      />
    </div>
  );
}
