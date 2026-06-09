/**
 * SACRED PERFORMANCE LICENSE - Edition v1.2
 * Copyright (c) 2026 gatrivi. All Rights Reserved.
 * 
 * This code and its associated "Cosmic Alignment" algorithms, interaction models,
 * and procedural devotional logic are protected as intellectual and spiritual property.
 * Modification or redistribution for commercial purposes is prohibited without 
 * express spiritual and legal consent.
 */
import React, { useState, useEffect } from 'react';
import RosarioVirtualView from '../Views/RosarioVirtualView';
import RoseView from '../Views/RoseView';
import BookletView from '../Views/BookletView';
import MacetonView from '../Views/MacetonView';
import PeregrinacionView from '../Views/PeregrinacionView';
import MonkView from '../Views/MonkView';
import RecordingStudioView from '../Views/RecordingStudioView';
import BottomNav from '../Navigation/BottomNav';
import SyncManager from '../common/SyncManager';
import SettingsOverlay from '../common/SettingsOverlay';
import { useCloudSync } from '../../hooks/useCloudSync';
import DailyTracker from '../Rosedal/DailyTracker';
import StatsView from '../StatsView';
import FeedbackOverlay from '../common/FeedbackOverlay';
import { getDefaultMystery } from '../utils/getDefaultMystery';
import {
  applyPendingUpdate,
  playUpdateAvailableSound,
  scheduleUpdateReminder,
  clearUpdateReminder,
} from '../../utils/appUpdate';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';

const APP_VERSION = '0.3.33';
const ROSARY_INDEX_KEY = 'rosario_booklet_index';
const ROSARY_MYSTERY_KEY = 'rosario_booklet_mystery';


export default function AppShell() {
  const INTRO_VERSION = 'v1.0'; // Change this to show intro again on major updates
  const [vistaActiva, setVistaActiva] = useState('booklet'); 
  const [, setSelectedLevel] = useState(null);
  const [showIntro, setShowIntro] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [pendingSyncId, setPendingSyncId] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setUpdateAvailable(true);
      playUpdateAvailableSound();
      scheduleUpdateReminder(() => {
        setUpdateAvailable((still) => {
          if (still) playUpdateAvailableSound();
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
    const saved = localStorage.getItem('rosario_settings');
    return saved ? JSON.parse(saved) : {
      virtualRosaryEnabled: true,
      soundEnabled: localStorage.getItem('rosario_sound_enabled') !== 'false',
      meditationRitmo: 'incienso', // oro, incienso, mirra
      isLeftHanded: localStorage.getItem('rosario_left_handed') === 'true',
      simpleMode: localStorage.getItem('rosario_simple_mode') === 'true'
    };
  });

  useEffect(() => {
    localStorage.setItem('rosario_settings', JSON.stringify(settings));
    localStorage.setItem('rosario_sound_enabled', String(settings.soundEnabled));
    localStorage.setItem('rosario_left_handed', String(settings.isLeftHanded));
    localStorage.setItem('rosario_simple_mode', String(settings.simpleMode));
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

  const {
    addRosas,
    removeRosas,
    storeRoseData,
    popRoseData,
  } = useAveMariaStats();

  const { forceSetSyncId, syncId, syncStatus, cloudState, syncToCloud } = useCloudSync();

  const [loadedBookletFromCloud, setLoadedBookletFromCloud] = useState(false);
  useEffect(() => {
    if (!cloudState || loadedBookletFromCloud) return;
    if (cloudState.bookletIndex !== undefined) {
      setCurrentPrayerIndex(cloudState.bookletIndex);
      try {
        localStorage.setItem(ROSARY_INDEX_KEY, String(cloudState.bookletIndex));
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

  const getSyncColor = () => {
    if (syncStatus === 'loading') return '#888';
    if (syncStatus === 'synced') return '#D4AF37';
    if (syncStatus === 'local') return '#4CAF50'; // Green for safe local storage
    if (syncStatus === 'error') return '#F44336';
    return '#fff';
  };

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
  }, [syncToCloud]);

  const handleMysteryChange = React.useCallback((mystery) => {
    setMisterioActual(mystery);
    setCurrentPrayerIndex(0);
    try {
      localStorage.setItem(ROSARY_MYSTERY_KEY, mystery);
      localStorage.setItem(ROSARY_INDEX_KEY, '0');
    } catch (_) { /* ignore */ }
    syncToCloud({ bookletMystery: mystery, bookletIndex: 0, todayDate: new Date().toDateString() });
  }, [syncToCloud]);

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
      case 'monk': return <MonkView />;
      case 'voz':
        return (
          <RecordingStudioView
            mysteryType={misterioActual}
            onMysteryChange={handleMysteryChange}
          />
        );
      case 'camino': return <PeregrinacionView onSelectLevel={(lvl) => { setSelectedLevel(lvl); setVistaActiva('macetones'); }} />;
      case 'macetones': return <MacetonView onSelectMaceton={() => setVistaActiva('rosary')} />;
      case 'stats': return <StatsView />;
      case 'tracker': return <DailyTracker />;
      case 'rosary': return (
        <RosarioVirtualView 
          currentPrayerIndex={currentPrayerIndex}
          misterioActual={misterioActual}
          onUpdateProgreso={handleUpdateProgreso}
          soundEnabled={settings.soundEnabled}
          isLeftHanded={settings.isLeftHanded}
          simpleMode={settings.simpleMode}
        />
      );
      case 'rose': return (
        <RoseView 
          currentPrayerIndex={currentPrayerIndex}
          misterioActual={misterioActual}
          onUpdateProgreso={handleUpdateProgreso}
          onBack={() => setVistaActiva('macetones')}
          soundEnabled={settings.soundEnabled}
          onToggleSound={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
          meditationRitmo={settings.meditationRitmo}
          simpleMode={settings.simpleMode}
        />
      );
      default: return <PeregrinacionView onSelectLevel={(lvl) => { setSelectedLevel(lvl); setVistaActiva('macetones'); }} />;
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
    }}>
      
      {/* FLOATING HEADER CONTROLS */}
      <div style={{
        position: 'absolute', top: 15, left: 15, right: 15,
        display: 'flex', justifyContent: 'space-between', zIndex: 100,
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
          <button 
            onClick={() => setShowFeedback(true)}
            title="Reportar problema o sugerencia"
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#666', borderRadius: '8px', padding: '6px', cursor: 'pointer',
              fontSize: '0.96rem', backdropFilter: 'blur(5px)',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {settings.simpleMode ? '🆘 Ayuda' : '💬'}
          </button>
        </div>
        <div style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          pointerEvents: 'auto',
          flex: '1 1 auto',
          justifyContent: 'flex-end',
          minWidth: 0,
          marginLeft: '8px',
        }}>
          <div
            id="booklet-top-orbs"
            style={{
              display: vistaActiva === 'booklet' ? 'flex' : 'none',
              alignItems: 'center',
              flex: '1 1 auto',
              justifyContent: 'flex-end',
              minWidth: 0,
              maxWidth: 'calc(100vw - 9.5rem)',
              overflow: 'hidden',
            }}
          />
          <button 
            onClick={() => setShowSync(true)}
            style={{ 
              background: 'rgba(20,20,20,0.6)', border: '1px solid #333', 
              color: getSyncColor(), width: '32px', height: '32px',
              borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(5px)',
              fontSize: '0.96rem', boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
            title={`Sincronización: ${syncStatus}`}
          >
            {syncStatus === 'loading' ? '⌛' : '☁️'}
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            style={{ 
              background: 'rgba(20,20,20,0.6)', border: '1px solid #333', 
              color: '#fff', width: '32px', height: '32px',
              borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(5px)',
              fontSize: '0.96rem', boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Update banner — visible when a new service worker is waiting */}
      {updateAvailable && (
        <div style={{
          position: 'absolute', top: 60, left: 12, right: 12, zIndex: 200,
          background: 'rgba(20,20,20,0.95)', border: '1px solid #D4AF37',
          borderRadius: '12px', padding: '12px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          <span style={{ color: '#ccc', fontSize: '0.85rem' }}>
            Nueva versión disponible (v{APP_VERSION})
          </span>
          <button
            type="button"
            onClick={applyPendingUpdate}
            style={{
              background: '#D4AF37', color: '#000', border: 'none',
              borderRadius: '8px', padding: '8px 14px', fontWeight: 'bold',
              cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0
            }}
          >
            Actualizar
          </button>
        </div>
      )}

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', zIndex: 10 }} className="view-enter-active">
        {renderizarVista()}
      </div>

      {/* Handedness Toggle (Floating above nav) */}
      <HandToggle 
        isLeftHanded={settings.isLeftHanded} 
        onToggle={() => setSettings(s => ({ ...s, isLeftHanded: !s.isLeftHanded }))} 
      />

      <BottomNav 
        vistaActiva={vistaActiva} 
        setVistaActiva={setVistaActiva} 
        virtualEnabled={settings.virtualRosaryEnabled}
        isLeftHanded={settings.isLeftHanded}
        simpleMode={settings.simpleMode}
      />

      {/* Version badge */}
      <div style={{
        position: 'absolute',
        bottom: '78px',
        left: '10px',
        zIndex: 100,
        color: 'rgba(212, 175, 55, 0.35)',
        fontSize: '0.6rem',
        fontFamily: 'monospace',
        letterSpacing: '1px',
        pointerEvents: 'none',
        userSelect: 'none'
      }}>
        v{APP_VERSION}
      </div>

      {/* OVERLAYS */}
      {showSync && <SyncManager onClose={() => setShowSync(false)} />}
      {/* MODALS */}
      {showSettings && (
        <SettingsOverlay 
          settings={settings} 
          onUpdateSettings={setSettings} 
          onClose={() => setShowSettings(false)}
          appVersion={APP_VERSION}
          onCheckForUpdate={applyPendingUpdate}
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

      {/* WELCOME INTRO */}
      {showIntro && (
        <div className="modal-overlay" style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }} onClick={dismissIntro}>
          <div className="modal-content" style={{
            background: 'linear-gradient(145deg, #0d0d0d, #1a0a0a)', border: '1px solid #D4AF37',
            borderRadius: '24px', padding: '40px 30px', maxWidth: '420px', width: '100%', textAlign: 'center',
            boxShadow: '0 30px 60px rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)',
            position: 'relative', overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Subtle glow background */}
            <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100px', background: 'rgba(212,175,55,0.1)', filter: 'blur(40px)', borderRadius: '50%' }} />

            <h1 style={{ color: '#D4AF37', margin: '0 0 10px', fontSize: '2.2rem', letterSpacing: '1px' }}>Rosario Cards</h1>
            <p style={{ color: '#ccc', fontSize: '1rem', lineHeight: '1.6', margin: '0 0 30px', fontStyle: 'italic', opacity: 0.8 }}>
              «Herramienta devocional para la meditación profunda»
            </p>
            
            <div style={{ 
              textAlign: 'left', color: '#aaa', fontSize: '0.9rem', marginBottom: '35px', 
              display: 'flex', flexDirection: 'column', gap: '15px',
              background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(212,175,55,0.1)'
            }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ fontSize: '1.3rem' }}>🚶</span>
                <div><strong>El Camino:</strong> Visualiza tu recorrido espiritual paso a paso.</div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ fontSize: '1.3rem' }}>🌹</span>
                <div><strong>Rezar:</strong> Un espacio minimalista para concentrarte en el misterio.</div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ fontSize: '1.3rem' }}>🪴</span>
                <div><strong>El Jardín:</strong> Tu disciplina florece en rosas únicas coleccionables.</div>
              </div>
            </div>
            
            <button 
              onClick={dismissIntro}
              style={{
                width: '100%', padding: '16px', background: 'linear-gradient(90deg, #D4AF37, #C5A028)', color: '#000',
                border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem',
                cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', transition: 'all 0.2s'
              }}
            >
              Comenzar Peregrinación
            </button>
            <p style={{ fontSize: '0.75rem', color: '#555', margin: '20px 0 0 0' }}>
              Podrás ver esta guía luego tocando los íconos (ℹ️).
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

// --- Sub-components ---

function HandToggle({ isLeftHanded, onToggle }) {
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

  return (
    <div style={{
      position: 'absolute',
      bottom: '90px', // Just above BottomNav
      [isLeftHanded ? 'right' : 'left']: '15px', // Opposite of dominant hand
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: isLeftHanded ? 'flex-end' : 'flex-start',
      pointerEvents: 'none'
    }}>
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
        {isLeftHanded ? '🫱' : '🫲'}
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
