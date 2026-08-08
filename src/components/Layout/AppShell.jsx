/**
 * SACRED PERFORMANCE LICENSE - Edition v1.2
 * Copyright (c) 2026 gatrivi. All Rights Reserved.
 * 
 * This code and its associated "Cosmic Alignment" algorithms, interaction models,
 * and procedural devotional logic are protected as intellectual and spiritual property.
 * Modification or redistribution for commercial purposes is prohibited without 
 * express spiritual and legal consent.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import RosarioVirtualView from '../Views/RosarioVirtualView';
import RoseView from '../Views/RoseView';
import BookletView from '../Views/BookletView';
import MacetonView from '../Views/MacetonView';
import JardinDeRosasView from '../Views/JardinDeRosasView';
import PeregrinacionView from '../Views/PeregrinacionView';
import MonkView from '../Views/MonkView';
import RecordingStudioView from '../Views/RecordingStudioView';
import AssetStudio from '../Views/AssetStudio';
import BottomNav from '../Navigation/BottomNav';
import SyncManager from '../common/SyncManager';
import SettingsOverlay from '../common/SettingsOverlay';
import ReleaseNotesOverlay from '../common/ReleaseNotesOverlay';
import ViewErrorBoundary from '../common/ViewErrorBoundary';
import { getUpdateSummaryLine } from '../../data/releaseNotes';
import { useCloudSync } from '../../hooks/useCloudSync';
import DailyTracker from '../Rosedal/DailyTracker';
import FeedbackOverlay from '../common/FeedbackOverlay';
import PrayForOrbs from '../common/PrayForOrbs';
import {
  IconHelp,
  IconSettings,
  IconHandLeft,
  IconHandRight,
} from '../Navigation/NavIcons';
import { getDefaultMystery } from '../utils/getDefaultMystery';
import audioManager from '../../utils/audioManager';
import {
  applyPendingUpdate,
  playUpdateAvailableSound,
  scheduleUpdateReminder,
  clearUpdateReminder,
} from '../../utils/appUpdate';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import { useArtConfigCloudSync } from '../../hooks/useArtConfigCloudSync';
import { getViewIdFromPath, getPathForView, VALID_PATHS } from '../../navigation/routes';
import {
  resolveRosaryMystery,
  isValidBookletMystery,
  isValidRosaryMystery,
  buildSequence,
} from '../../utils/bookletSequence';
import { getBookletStepContext } from '../../utils/bookletProgress';
import {
  saveCompromiso,
  tryFulfillCompromiso,
  isCompromisoCampaignActive,
  hasActiveCompromiso,
} from '../../utils/compromisoStore';
import CompromisoSheet from '../compromiso/CompromisoSheet';
import { SAGRADO_CORAZON_ADORACION_ID } from '../../data/sagradoCorazonAdoracionData';
import { devLog } from '../../utils/devotionsDebug';
import MobileElementStepper from './MobileElementStepper';
import './AppShell.css';

const APP_VERSION = '0.3.66';
const ROSARY_INDEX_KEY = 'rosario_booklet_index';
const ROSARY_MYSTERY_KEY = 'rosario_booklet_mystery';
const ROSARY_ONLY_INDEX_KEY = 'rosario_rosary_index';
const ROSARY_ONLY_MYSTERY_KEY = 'rosario_rosary_mystery';
const NOVENA_DAY_KEY = 'rosario_booklet_novena_day';


export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const vistaActiva = getViewIdFromPath(location.pathname);
  const initializedFromUrl = useRef(false);

  const INTRO_VERSION = 'v2.0'; // Honest first-run + compromiso CTAs
  const [showIntro, setShowIntro] = useState(false);
  const [showCompromiso, setShowCompromiso] = useState(false);
  const [compromisoMode, setCompromisoMode] = useState('commit'); // commit | done
  const [showSync, setShowSync] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [pendingSyncId, setPendingSyncId] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateApplying, setUpdateApplying] = useState(false);
  const [openOptionalId, setOpenOptionalId] = useState(null);
  const compromisoUrlHandled = useRef(false);
  const oracionUrlHandled = useRef(false);

  useEffect(() => {
    const handleUpdate = () => {
      setUpdateAvailable(true);
      playUpdateAvailableSound().catch(() => {});
      scheduleUpdateReminder(() => {
        setUpdateAvailable((still) => {
          if (still) playUpdateAvailableSound().catch(() => {});
          return still;
        });
      });
    };
    window.addEventListener('appUpdateAvailable', handleUpdate);
    return () => {
      window.removeEventListener('appUpdateAvailable', handleUpdate);
      clearUpdateReminder();
    };
  }, []);

  const [settings, setSettings] = useState(() => {
    const defaults = {
      virtualRosaryEnabled: true,
      soundEnabled: localStorage.getItem('rosario_sound_enabled') !== 'false',
      meditationRitmo: 'incienso', // oro, incienso, mirra
      isLeftHanded: localStorage.getItem('rosario_left_handed') === 'true',
      simpleMode: localStorage.getItem('rosario_simple_mode') === 'true',
      oneHandMode: localStorage.getItem('rosario_one_hand_mode') === 'true',
      oneHandQuickToggleEnabled: localStorage.getItem('rosario_one_hand_quick_toggle_enabled') !== 'false',
      mobileElementArrowsEnabled: localStorage.getItem('rosario_mobile_element_arrows_enabled') !== 'false',
      mercyOptionalOpening: true,
      litanyEntranceEnabled: true,
      perVersePrayerImages: false,
      useUserVoice: localStorage.getItem('rosario_voice_user') !== 'false',
      useBundledVoice: localStorage.getItem('rosario_voice_bundled') !== 'false',
    };
    const saved = localStorage.getItem('rosario_settings');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  useEffect(() => {
    localStorage.setItem('rosario_settings', JSON.stringify(settings));
    localStorage.setItem('rosario_sound_enabled', String(settings.soundEnabled));
    localStorage.setItem('rosario_left_handed', String(settings.isLeftHanded));
    localStorage.setItem('rosario_simple_mode', String(settings.simpleMode));
    localStorage.setItem('rosario_one_hand_mode', String(settings.oneHandMode === true));
    localStorage.setItem('rosario_one_hand_quick_toggle_enabled', String(settings.oneHandQuickToggleEnabled !== false));
    localStorage.setItem('rosario_mobile_element_arrows_enabled', String(settings.mobileElementArrowsEnabled !== false));
    localStorage.setItem('rosario_voice_user', String(settings.useUserVoice !== false));
    localStorage.setItem('rosario_voice_bundled', String(settings.useBundledVoice !== false));
  }, [settings]);

  // --- Lifting Prayer State ---
  const [misterioActual, setMisterioActual] = useState(() => {
    try {
      return localStorage.getItem(ROSARY_MYSTERY_KEY) || getDefaultMystery();
    } catch {
      return getDefaultMystery();
    }
  });
  const [currentPrayerIndex, setCurrentPrayerIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(ROSARY_INDEX_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [rosaryPrayerIndex, setRosaryPrayerIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(ROSARY_ONLY_INDEX_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [rosaryMystery, setRosaryMystery] = useState(() => {
    try {
      const saved = localStorage.getItem(ROSARY_ONLY_MYSTERY_KEY);
      if (saved && isValidRosaryMystery(saved)) return saved;
      const booklet = localStorage.getItem(ROSARY_MYSTERY_KEY);
      return resolveRosaryMystery(booklet || getDefaultMystery());
    } catch {
      return getDefaultMystery();
    }
  });
  const [novenaDay, setNovenaDay] = useState(() => {
    try {
      const saved = localStorage.getItem(NOVENA_DAY_KEY);
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  const handleNovenaDayChange = (day) => {
    setNovenaDay(day);
    setCurrentPrayerIndex(0);
    try {
      localStorage.setItem(NOVENA_DAY_KEY, String(day));
      localStorage.setItem(ROSARY_INDEX_KEY, '0');
    } catch (_) { /* ignore */ }
  };

  const prevMercyOpeningRef = useRef(settings.mercyOptionalOpening);
  useEffect(() => {
    if (prevMercyOpeningRef.current === settings.mercyOptionalOpening) return;
    prevMercyOpeningRef.current = settings.mercyOptionalOpening;
    if (misterioActual !== 'divinamisericordia' && misterioActual !== 'divinamisericordia_novena') return;
    setCurrentPrayerIndex(0);
    try {
      localStorage.setItem(ROSARY_INDEX_KEY, '0');
    } catch (_) { /* ignore */ }
  }, [settings.mercyOptionalOpening, misterioActual]);

  const {
    addRosas,
    removeRosas,
    storeRoseData,
    popRoseData,
  } = useAveMariaStats();

  const { forceSetSyncId, syncId, syncStatus, cloudState, syncToCloud } = useCloudSync();

  useArtConfigCloudSync({ syncId, cloudState, syncToCloud });

  const [loadedBookletFromCloud, setLoadedBookletFromCloud] = useState(false);
  useEffect(() => {
    if (!cloudState || loadedBookletFromCloud) return;
    if (cloudState.bookletIndex !== undefined) {
      setCurrentPrayerIndex(cloudState.bookletIndex);
      try {
        localStorage.setItem(ROSARY_INDEX_KEY, String(cloudState.bookletIndex));
      } catch (_) { /* ignore */ }
    }
    if (cloudState.rosaryIndex !== undefined) {
      setRosaryPrayerIndex(cloudState.rosaryIndex);
      try {
        localStorage.setItem(ROSARY_ONLY_INDEX_KEY, String(cloudState.rosaryIndex));
      } catch (_) { /* ignore */ }
    }
    if (cloudState.rosaryMystery && isValidRosaryMystery(cloudState.rosaryMystery)) {
      setRosaryMystery(cloudState.rosaryMystery);
      try {
        localStorage.setItem(ROSARY_ONLY_MYSTERY_KEY, cloudState.rosaryMystery);
      } catch (_) { /* ignore */ }
    }
    if (cloudState.bookletMystery) {
      setMisterioActual(cloudState.bookletMystery);
      try {
        localStorage.setItem(ROSARY_MYSTERY_KEY, cloudState.bookletMystery);
      } catch (_) { /* ignore */ }
    }
    setLoadedBookletFromCloud(true);
  }, [cloudState, loadedBookletFromCloud]);

  useEffect(() => {
    if (initializedFromUrl.current) return;
    initializedFromUrl.current = true;

    const misterio = searchParams.get('misterio');
    const paso = searchParams.get('paso');
    const dia = searchParams.get('dia');
    if (misterio && isValidBookletMystery(misterio)) {
      setMisterioActual(misterio);
      try {
        localStorage.setItem(ROSARY_MYSTERY_KEY, misterio);
      } catch (_) { /* ignore */ }
    }
    if (misterio === 'divinamisericordia_novena' && dia !== null) {
      const dayNum = parseInt(dia, 10);
      if (!Number.isNaN(dayNum) && dayNum >= 1 && dayNum <= 9) {
        setNovenaDay(dayNum);
        try {
          localStorage.setItem(NOVENA_DAY_KEY, String(dayNum));
        } catch (_) { /* ignore */ }
      }
    }
    if (paso !== null) {
      const idx = parseInt(paso, 10);
      if (!Number.isNaN(idx) && idx >= 0) {
        setCurrentPrayerIndex(idx);
        try {
          localStorage.setItem(ROSARY_INDEX_KEY, String(idx));
        } catch (_) { /* ignore */ }
      }
    }
  }, [searchParams]);

  // ?compromiso=1 → CTA → Libro (today's mystery after commit)
  useEffect(() => {
    if (compromisoUrlHandled.current) return;
    const flag = searchParams.get('compromiso');
    if (flag !== '1' && flag !== 'true') return;
    compromisoUrlHandled.current = true;
    if (isCompromisoCampaignActive()) {
      setCompromisoMode('commit');
      setShowCompromiso(true);
      setShowIntro(false);
      navigate('/libro', { replace: true });
    }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('compromiso');
      return next;
    }, { replace: true });
  }, [searchParams, navigate, setSearchParams]);

  // ?oracion=expedito → Libro + optional prayer sheet
  useEffect(() => {
    if (oracionUrlHandled.current) return;
    const id = searchParams.get('oracion');
    if (!id) return;
    oracionUrlHandled.current = true;
    setOpenOptionalId(id);
    setShowIntro(false);
    navigate('/libro', { replace: true });
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('oracion');
      return next;
    }, { replace: true });
  }, [searchParams, navigate, setSearchParams]);

  // Honest first-run (skip if compromiso / oración deep-link already open)
  useEffect(() => {
    try {
      if (compromisoUrlHandled.current || oracionUrlHandled.current) return;
      if (searchParams.get('compromiso') === '1' || searchParams.get('compromiso') === 'true') return;
      if (searchParams.get('oracion')) return;
      if (!localStorage.getItem(`rosario_intro_${INTRO_VERSION}`)) {
        setShowIntro(true);
      }
    } catch (_) { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, []);

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('misterio', misterioActual);
      const paso = ['rosary', 'rose'].includes(vistaActiva)
        ? rosaryPrayerIndex
        : currentPrayerIndex;
      next.set('paso', String(paso));
      if (misterioActual === 'divinamisericordia_novena') {
        next.set('dia', String(novenaDay));
      } else {
        next.delete('dia');
      }
      next.delete('compromiso');
      next.delete('oracion');
      if (prev.toString() === next.toString()) return prev;
      return next;
    }, { replace: true });
  }, [misterioActual, currentPrayerIndex, rosaryPrayerIndex, vistaActiva, novenaDay, setSearchParams]);

  useEffect(() => {
    if (!VALID_PATHS.has(location.pathname)) {
      navigate('/libro', { replace: true });
    }
  }, [location.pathname, navigate]);

  // --- URL Detection for Sync Key ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sId = params.get('sync');
    if (sId && sId !== syncId) {
      setPendingSyncId(sId);
    }
  }, [syncId]);

  const cleanSyncParam = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('sync');
    window.history.replaceState({}, '', url.pathname + url.search);
  };

  const confirmPendingSync = () => {
    if (pendingSyncId) {
      forceSetSyncId(pendingSyncId);
      cleanSyncParam();
      setPendingSyncId(null);
    }
  };

  const dismissSync = () => {
    setPendingSyncId(null);
    cleanSyncParam();
  };

  const dismissIntro = () => {
    localStorage.setItem(`rosario_intro_${INTRO_VERSION}`, '1');
    setShowIntro(false);
  };

  const handleUpdateProgreso = React.useCallback((newIndex) => {
    setCurrentPrayerIndex(newIndex);
    try {
      localStorage.setItem(ROSARY_INDEX_KEY, String(newIndex));
    } catch (_) { /* ignore */ }
    syncToCloud({ bookletIndex: newIndex, todayDate: new Date().toDateString() });

    if (hasActiveCompromiso() && isValidRosaryMystery(misterioActual)) {
      const seq = buildSequence(misterioActual);
      const decade = getBookletStepContext(seq, newIndex, seq.length)?.mysteryDecade;
      const done = tryFulfillCompromiso(seq, newIndex, misterioActual, decade);
      if (done) {
        setCompromisoMode('done');
        setShowCompromiso(true);
      }
    }
  }, [syncToCloud, misterioActual]);

  const handleRosaryProgreso = React.useCallback((newIndex) => {
    setRosaryPrayerIndex(newIndex);
    try {
      localStorage.setItem(ROSARY_ONLY_INDEX_KEY, String(newIndex));
    } catch (_) { /* ignore */ }
    syncToCloud({ rosaryIndex: newIndex, todayDate: new Date().toDateString() });

    if (hasActiveCompromiso() && isValidRosaryMystery(rosaryMystery)) {
      const seq = buildSequence(rosaryMystery);
      const decade = getBookletStepContext(seq, newIndex, seq.length)?.mysteryDecade;
      const done = tryFulfillCompromiso(seq, newIndex, rosaryMystery, decade);
      if (done) {
        setCompromisoMode('done');
        setShowCompromiso(true);
      }
    }
  }, [syncToCloud, rosaryMystery]);

  const handleMysteryChange = React.useCallback((mystery) => {
    devLog('mystery-change', { mystery, from: misterioActual, view: vistaActiva });
    setMisterioActual(mystery);
    setCurrentPrayerIndex(0);
    if (isValidRosaryMystery(mystery)) {
      setRosaryMystery(mystery);
      setRosaryPrayerIndex(0);
      try {
        localStorage.setItem(ROSARY_ONLY_MYSTERY_KEY, mystery);
        localStorage.setItem(ROSARY_ONLY_INDEX_KEY, '0');
      } catch (_) { /* ignore */ }
    }
    try {
      localStorage.setItem(ROSARY_MYSTERY_KEY, mystery);
      localStorage.setItem(ROSARY_INDEX_KEY, '0');
    } catch (_) { /* ignore */ }
    syncToCloud({ bookletMystery: mystery, bookletIndex: 0, todayDate: new Date().toDateString() });
  }, [syncToCloud, misterioActual, vistaActiva]);

  const startLibroHoy = React.useCallback((mystery) => {
    const m = mystery || getDefaultMystery();
    setMisterioActual(m);
    setCurrentPrayerIndex(0);
    if (isValidRosaryMystery(m)) {
      setRosaryMystery(m);
      try {
        localStorage.setItem(ROSARY_ONLY_MYSTERY_KEY, m);
      } catch (_) { /* ignore */ }
    }
    try {
      localStorage.setItem(ROSARY_MYSTERY_KEY, m);
      localStorage.setItem(ROSARY_INDEX_KEY, '0');
    } catch (_) { /* ignore */ }
    syncToCloud({ bookletMystery: m, bookletIndex: 0, todayDate: new Date().toDateString() });
    navigate('/libro');
  }, [navigate, syncToCloud]);

  const handleCompromisoCommit = React.useCallback(() => {
    const mystery = getDefaultMystery();
    saveCompromiso({ mysteryId: mystery });
    startLibroHoy(mystery);
    setShowCompromiso(false);
    dismissIntro();
  }, [startLibroHoy]);

  const renderizarVista = () => {
    switch (vistaActiva) {
      case 'booklet':
        return (
          <BookletView
            currentPrayerIndex={currentPrayerIndex}
            misterioActual={misterioActual}
            onUpdateProgreso={handleUpdateProgreso}
            onMysteryChange={handleMysteryChange}
            isLeftHanded={settings.isLeftHanded}
            simpleMode={settings.simpleMode}
            soundEnabled={settings.soundEnabled}
            mercyOptionalOpening={settings.mercyOptionalOpening !== false}
            litanyEntranceEnabled={settings.litanyEntranceEnabled !== false}
            perVersePrayerImages={settings.perVersePrayerImages === true}
            onAveMariaComplete={(fingerprint) => {
              if (misterioActual === 'divinamisericordia_novena') return;
              if (misterioActual === SAGRADO_CORAZON_ADORACION_ID) return;
              addRosas(1);
              storeRoseData(fingerprint);
            }}
            onAveMariaUndo={() => {
              if (misterioActual === 'divinamisericordia_novena') return;
              if (misterioActual === SAGRADO_CORAZON_ADORACION_ID) return;
              removeRosas(1);
              popRoseData();
            }}
            novenaDay={novenaDay}
            onNovenaDayChange={handleNovenaDayChange}
            openOptionalId={openOptionalId}
          />
        );
      case 'monk': return <MonkView />;
      case 'assets': return <AssetStudio />;
      case 'voz':
        return (
          <RecordingStudioView
            mysteryType={misterioActual}
            onMysteryChange={handleMysteryChange}
          />
        );
      case 'camino': return (
        <PeregrinacionView
          onSelectLevel={() => navigate(getPathForView('tracker'))}
          onPray={() => navigate(getPathForView('rosary'))}
          onRosedal={() => navigate(getPathForView('macetones'))}
          onContinueCompromiso={() => navigate('/libro')}
          onOpenCompromiso={() => {
            setCompromisoMode('commit');
            setShowCompromiso(true);
          }}
        />
      );
      case 'macetones': return (
        <MacetonView
          onSelectMaceton={() => navigate(getPathForView('rose'))}
          onViewGarden={() => navigate(getPathForView('jardin'))}
        />
      );
      case 'jardin': return <JardinDeRosasView />;
      case 'tracker': return <DailyTracker />;
      case 'rosary': {
        const sharedClassic = isValidRosaryMystery(misterioActual);
        const m = sharedClassic ? misterioActual : rosaryMystery;
        const idx = sharedClassic ? currentPrayerIndex : rosaryPrayerIndex;
        const onProg = sharedClassic ? handleUpdateProgreso : handleRosaryProgreso;
        return (
        <RosarioVirtualView 
          currentPrayerIndex={idx}
          misterioActual={m}
          onUpdateProgreso={onProg}
          soundEnabled={settings.soundEnabled}
          isLeftHanded={settings.isLeftHanded}
          simpleMode={settings.simpleMode}
          litanyEntranceEnabled={settings.litanyEntranceEnabled !== false}
          perVersePrayerImages={settings.perVersePrayerImages === true}
          onToggleSimpleMode={() => setSettings(s => ({ ...s, simpleMode: !s.simpleMode }))}
          onShowRosedal={() => navigate(getPathForView('macetones'))}
          onAveMariaComplete={(fingerprint) => {
            addRosas(1);
            storeRoseData(fingerprint);
          }}
          onAveMariaUndo={() => {
            removeRosas(1);
            popRoseData();
          }}
        />
        );
      }
      case 'rose': {
        const sharedClassic = isValidRosaryMystery(misterioActual);
        const m = sharedClassic ? misterioActual : rosaryMystery;
        const idx = sharedClassic ? currentPrayerIndex : rosaryPrayerIndex;
        const onProg = sharedClassic ? handleUpdateProgreso : handleRosaryProgreso;
        return (
        <RoseView 
          currentPrayerIndex={idx}
          misterioActual={m}
          onUpdateProgreso={onProg}
          onBack={() => navigate(getPathForView('macetones'))}
          soundEnabled={settings.soundEnabled}
          onToggleSound={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
          meditationRitmo={settings.meditationRitmo}
          simpleMode={settings.simpleMode}
        />
        );
      }
      default: return (
        <PeregrinacionView
          onSelectLevel={() => navigate(getPathForView('tracker'))}
          onPray={() => navigate(getPathForView('rosary'))}
          onRosedal={() => navigate(getPathForView('macetones'))}
          onContinueCompromiso={() => navigate('/libro')}
          onOpenCompromiso={() => {
            setCompromisoMode('commit');
            setShowCompromiso(true);
          }}
        />
      );
    }
  };

  const telemetryData = {
    v: APP_VERSION,
    view: vistaActiva,
    mystery: misterioActual,
    idx: currentPrayerIndex,
    simpleMode: settings.simpleMode,
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  };

  const handleStartAmbientAudio = async () => {
    try {
      const ctx = audioManager.getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') await ctx.resume();
    } catch (_) {
      // Silent fallback: if the browser still blocks, user can try again.
    }
  };

  const handleApplyPendingUpdate = async () => {
    if (updateApplying) return;
    setUpdateApplying(true);
    try {
      await applyPendingUpdate();
    } catch (_) {
      // Keep the current build usable if the browser rejects the update check.
    } finally {
      setUpdateApplying(false);
    }
  };

  return (
    <div style={{
      height: '100dvh', 
      width: '100vw',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0A0A0A',
      color: '#E0E0E0',
      overflow: 'hidden',
      fontFamily: 'serif',
      position: 'relative'
    }} className={`app-shell${vistaActiva === 'booklet' ? ' app-shell--booklet' : ''}${settings.oneHandMode ? ' app-shell--one-hand' : ''}`}>
      
      <AppActionDock
        simpleMode={settings.simpleMode}
        soundEnabled={settings.soundEnabled}
        onHelp={() => setShowIntro(true)}
        onSettings={() => setShowSettings(true)}
      />

      {/* Update banner — visible when a new service worker is waiting */}
      {updateAvailable && (
        <div style={{
          position: 'absolute', top: 60, left: 12, right: 12, zIndex: 200,
          background: 'rgba(20,20,20,0.95)', border: '1px solid #D4AF37',
          borderRadius: '12px', padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 'bold' }}>
                Nueva versión (v{APP_VERSION})
              </div>
              <div style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '4px', lineHeight: 1.35 }}>
                {getUpdateSummaryLine()}
              </div>
            </div>
            <button
              type="button"
              onClick={handleApplyPendingUpdate}
              disabled={updateApplying}
              style={{
                background: '#D4AF37', color: '#000', border: 'none',
                borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold',
                cursor: updateApplying ? 'wait' : 'pointer', fontSize: '0.85rem', flexShrink: 0,
                opacity: updateApplying ? 0.7 : 1,
              }}
            >
              {updateApplying ? 'Actualizando…' : 'Actualizar'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowReleaseNotes(true)}
            style={{
              background: 'transparent', border: 'none', color: '#888',
              fontSize: '0.7rem', cursor: 'pointer', textAlign: 'left', padding: 0,
              textDecoration: 'underline',
            }}
          >
            Ver todas las novedades
          </button>
        </div>
      )}

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', zIndex: 10, minHeight: 0 }} className="view-enter-active app-view-layer">
        <ViewErrorBoundary viewId={vistaActiva}>
          {renderizarVista()}
        </ViewErrorBoundary>
      </div>

      {settings.oneHandQuickToggleEnabled !== false && (
        <OneHandQuickToggle
          oneHandMode={settings.oneHandMode === true}
          isLeftHanded={settings.isLeftHanded}
          onToggle={() => setSettings((s) => ({ ...s, oneHandMode: !s.oneHandMode }))}
        />
      )}

      <MobileElementStepper
        enabled={settings.mobileElementArrowsEnabled}
        isLeftHanded={settings.isLeftHanded}
      />

      {/* Handedness Toggle (Floating above nav) */}
      <HandToggle
        isLeftHanded={settings.isLeftHanded}
        bookletActive={vistaActiva === 'booklet'}
        onToggle={() => setSettings(s => ({ ...s, isLeftHanded: !s.isLeftHanded }))}
      />

      <BottomNav 
        isLeftHanded={settings.isLeftHanded}
        simpleMode={settings.simpleMode}
      />

      {/* Version badge — tap for Novedades */}
      <button
        type="button"
        onClick={() => setShowReleaseNotes(true)}
        title="Novedades de esta versión"
        aria-label={`Versión ${APP_VERSION}. Ver novedades`}
        className={`app-version-badge ${settings.oneHandMode ? 'app-version-badge--one-hand' : 'app-version-badge--default'}`}
      >
        v{APP_VERSION}
      </button>

      {/* OVERLAYS */}
      {showSync && <SyncManager onClose={() => setShowSync(false)} />}
      {/* MODALS */}
      {showSettings && (
        <SettingsOverlay 
          settings={settings} 
          onUpdateSettings={setSettings} 
          onClose={() => setShowSettings(false)}
          appVersion={APP_VERSION}
          onCheckForUpdate={handleApplyPendingUpdate}
          onStartAmbientAudio={handleStartAmbientAudio}
          onOpenAssetStudio={() => navigate(getPathForView('assets'))}
          onOpenVoiceStudio={() => navigate(getPathForView('voz'))}
          onOpenReleaseNotes={() => {
            setShowSettings(false);
            setShowReleaseNotes(true);
          }}
          onOpenSync={() => {
            setShowSettings(false);
            setShowSync(true);
          }}
          onOpenFeedback={() => {
            setShowSettings(false);
            setShowFeedback(true);
          }}
          syncStatus={syncStatus}
        />
      )}

      {showReleaseNotes && (
        <ReleaseNotesOverlay
          onClose={() => setShowReleaseNotes(false)}
          onOpenAssetStudio={() => navigate(getPathForView('assets'))}
        />
      )}

      {showFeedback && (
        <FeedbackOverlay 
          telemetry={telemetryData}
          onClose={() => setShowFeedback(false)}
        />
      )}

      {/* PENDING SYNC PROMPT (Magic Link activation) */}
      {pendingSyncId && (
        <div className="modal-overlay" style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 20000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
          <div className="modal-content" style={{
            background: 'linear-gradient(145deg, #111, #1a1a1a)', border: '1px solid #D4AF37', borderRadius: '20px',
            padding: '40px 30px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.9)',
            backdropFilter: 'blur(15px)'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.3))' }}>🔗</div>
            <h2 style={{ color: '#D4AF37', marginBottom: '15px', fontSize: '1.6rem', fontWeight: 'bold' }}>¿Vincular Dispositivo?</h2>
            <p style={{ color: '#bbb', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '30px', textWrap: 'pretty' }}>
              Detectamos una <strong>llave de peregrinación</strong>. <br/>
              Si aceptas, tu progreso actual será reemplazado por el de la llave entrante.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={confirmPendingSync}
                style={{ flex: 1.2, padding: '14px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'transform 0.2s' }}
              >
                Vincular
              </button>
              <button 
                onClick={dismissSync}
                style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid #444', borderRadius: '12px', fontSize: '1rem', cursor: 'pointer' }}
              >
                Ahora No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WELCOME INTRO — honest first-run */}
      {showIntro && (
        <div className="modal-overlay" style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }} onClick={dismissIntro}>
          <div className="modal-content" style={{
            background: 'linear-gradient(145deg, #0d0d0d, #1a0a0a)', border: '1px solid #D4AF37',
            borderRadius: '24px', padding: '36px 26px', maxWidth: '420px', width: '100%', textAlign: 'center',
            boxShadow: '0 30px 60px rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)',
            position: 'relative', overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <h1 style={{ color: '#D4AF37', margin: '0 0 10px', fontSize: '2rem', letterSpacing: '1px' }}>Rosario Cards</h1>
            <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: '1.55', margin: '0 0 22px' }}>
              El Libro te guía paso a paso en el Rosario de hoy. Un Rosario completo son cinco misterios (décenas).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  dismissIntro();
                  startLibroHoy();
                }}
                style={{
                  width: '100%', padding: '16px', background: 'linear-gradient(90deg, #D4AF37, #C5A028)', color: '#000',
                  border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.05rem',
                  cursor: 'pointer',
                }}
              >
                Rezar el Rosario de hoy
              </button>
              {isCompromisoCampaignActive() ? (
                <button
                  type="button"
                  onClick={() => {
                    dismissIntro();
                    setCompromisoMode('commit');
                    setShowCompromiso(true);
                  }}
                  style={{
                    width: '100%', padding: '14px',
                    background: 'linear-gradient(90deg, #2a0a0a, #3d0f0f)',
                    border: '1px solid #D4AF37', borderRadius: '12px',
                    color: '#D4AF37', fontWeight: 'bold', fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  Rezá por Argentina
                </button>
              ) : null}
              <button
                type="button"
                onClick={dismissIntro}
                style={{
                  width: '100%', padding: '12px', background: 'transparent', color: '#888',
                  border: '1px solid #333', borderRadius: '12px', fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                Más tarde
              </button>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#555', margin: '18px 0 0 0' }}>
              Ayuda (arriba) vuelve a abrir esta guía.
            </p>
          </div>
        </div>
      )}

      {showCompromiso && (
        <CompromisoSheet
          mode={compromisoMode}
          onCommit={handleCompromisoCommit}
          onDismiss={() => setShowCompromiso(false)}
          onStartPray={() => {
            setShowCompromiso(false);
            navigate('/libro');
          }}
          onOpenCamino={() => {
            setShowCompromiso(false);
            navigate(getPathForView('camino'));
          }}
        />
      )}

    </div>
  );
}

// --- Sub-components ---

function AppActionDock({
  simpleMode,
  soundEnabled = true,
  onHelp,
  onSettings,
}) {
  // Always top: user wants globes + Ayuda + Ajustes on the first row.
  // oneHandMode must not drag this chrome over Devociones / bottom nav.
  return (
    <div className="app-action-dock app-action-dock--top">
      <div className="app-action-cluster app-action-cluster--left app-action-cluster--orbs">
        <PrayForOrbs
          simpleMode={simpleMode}
          variant="header"
          soundEnabled={soundEnabled}
        />
      </div>
      <div className="app-action-cluster app-action-cluster--right">
        <button
          type="button"
          onClick={onHelp}
          title="Ayuda"
          aria-label="Ayuda"
          className={`app-action-btn app-action-btn--round${simpleMode ? ' simple-mode' : ''}`}
        >
          <IconHelp size={18} />
          {simpleMode && <span>Ayuda</span>}
        </button>
        <button
          type="button"
          onClick={onSettings}
          title="Ajustes"
          aria-label="Ajustes"
          className={`app-action-btn app-action-btn--round app-action-btn--settings${simpleMode ? ' simple-mode' : ''}`}
        >
          <IconSettings size={18} />
          {simpleMode && <span>Ajustes</span>}
        </button>
      </div>
    </div>
  );
}

function OneHandQuickToggle({ oneHandMode, isLeftHanded, onToggle }) {
  const sideClass = isLeftHanded
    ? 'app-one-hand-toggle--right'
    : 'app-one-hand-toggle--left';

  return (
    <div className={`app-one-hand-toggle ${sideClass}`}>
      <button
        type="button"
        className="app-one-hand-toggle__btn"
        onClick={onToggle}
        aria-label={oneHandMode ? 'Mover controles arriba' : 'Mover controles abajo'}
      >
        {oneHandMode ? '↑' : '↓'}
      </button>
    </div>
  );
}

function HandToggle({ isLeftHanded, bookletActive = false, onToggle }) {
  const [msg, setMsg] = React.useState('');
  const timerRef = React.useRef(null);

  const handleStart = (e) => {
    e.preventDefault();
    setMsg(isLeftHanded ? "Sostener para modo diestro" : "Sostener para modo zurdo");
    timerRef.current = setTimeout(() => {
      onToggle();
      setMsg('');
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    }, 1000);
  };

  const handleEnd = () => {
    clearTimeout(timerRef.current);
    setTimeout(() => setMsg(''), 2000);
  };

  const sideClass = isLeftHanded ? 'hand-toggle-anchor--right' : 'hand-toggle-anchor--left';
  const bookletClass = bookletActive ? ' hand-toggle-anchor--booklet' : '';

  return (
    <div
      className={`hand-toggle-anchor ${sideClass}${bookletClass}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isLeftHanded ? 'flex-end' : 'flex-start',
        pointerEvents: 'none',
      }}
    >
      {msg && (
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: '#D4AF37',
          padding: '8px 12px',
          borderRadius: '10px',
          fontSize: '0.75rem',
          marginBottom: '8px',
          border: '1px solid rgba(212,175,55,0.3)',
          animation: 'fade-in 0.3s ease'
        }}>
          {msg}
        </div>
      )}
      <button
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '1.8rem',
          opacity: 0.3, // 30% transparency
          cursor: 'pointer',
          pointerEvents: 'auto',
          padding: '10px',
          transition: 'transform 0.2s, opacity 0.2s',
          filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))'
        }}
      >
        {isLeftHanded ? <IconHandRight size={28} /> : <IconHandLeft size={28} />}
      </button>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
