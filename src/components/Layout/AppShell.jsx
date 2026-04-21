import React, { useState, useEffect } from 'react';
import RosarioVirtualView from '../Views/RosarioVirtualView';
import RezoEnFocoView from '../Views/RezoEnFocoView';
import JardinDeRosasView from '../Views/JardinDeRosasView';
import MacetonView from '../Views/MacetonView';
import PeregrinacionView from '../Views/PeregrinacionView';
import BottomNav from '../Navigation/BottomNav';
import SyncManager from '../common/SyncManager';
import SettingsOverlay from '../common/SettingsOverlay';
import { useCloudSync } from '../../hooks/useCloudSync';

export default function AppShell() {
  const INTRO_VERSION = 'v1.0'; // Change this to show intro again on major updates
  const [vistaActiva, setVistaActiva] = useState('camino'); 
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem(`rosario_intro_${INTRO_VERSION}`));
  const [showSync, setShowSync] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingSyncId, setPendingSyncId] = useState(null);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('rosario_settings');
    return saved ? JSON.parse(saved) : {
      virtualRosaryEnabled: true,
      soundEnabled: localStorage.getItem('rosario_sound_enabled') !== 'false'
    };
  });

  useEffect(() => {
    localStorage.setItem('rosario_settings', JSON.stringify(settings));
    localStorage.setItem('rosario_sound_enabled', String(settings.soundEnabled));
  }, [settings]);

  // --- Lifting Prayer State ---
  const [misterioActual, setMisterioActual] = useState('gozosos');
  const [currentPrayerIndex, setCurrentPrayerIndex] = useState(0);

  const { forceSetSyncId, syncId } = useCloudSync();

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

  const handleUpdateProgreso = (newIndex) => {
    setCurrentPrayerIndex(newIndex);
  };

  const renderizarVista = () => {
    switch (vistaActiva) {
  case 'virtual': return (
    <RosarioVirtualView 
      currentPrayerIndex={currentPrayerIndex}
      misterioActual={misterioActual}
      onUpdateProgreso={handleUpdateProgreso}
      soundEnabled={settings.soundEnabled}
    />
  );
      case 'foco': return (
        <RezoEnFocoView 
          currentPrayerIndex={currentPrayerIndex}
          misterioActual={misterioActual}
          onUpdateProgreso={handleUpdateProgreso}
          onBack={() => setVistaActiva('macetones')}
          soundEnabled={settings.soundEnabled}
          onToggleSound={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
        />
      );
      case 'jardin':  return <JardinDeRosasView />;
      case 'camino':  return <PeregrinacionView onSelectLevel={(lvl) => { setSelectedLevel(lvl); setVistaActiva('macetones'); }} />;
      case 'macetones': return <MacetonView level={selectedLevel} onBack={() => setVistaActiva('camino')} onSelectMaceton={() => setVistaActiva('foco')} />;
      default:        return <PeregrinacionView onSelectLevel={(lvl) => { setSelectedLevel(lvl); setVistaActiva('macetones'); }} />;
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
    }}>
      
      {/* FLOATING HEADER CONTROLS */}
      <div style={{
        position: 'absolute', top: 15, left: 15, right: 15,
        display: 'flex', justifyContent: 'space-between', zIndex: 100,
        pointerEvents: 'none'
      }}>
        <div /> {/* Spacer */}
        <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
          <button 
            onClick={() => setShowSync(true)}
            style={{ 
              background: 'rgba(20,20,20,0.6)', border: '1px solid #333', 
              color: syncId ? '#D4AF37' : '#fff', width: '40px', height: '40px',
              borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(5px)',
              fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
          >
            {syncId ? '☁️' : '☁️'}
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            style={{ 
              background: 'rgba(20,20,20,0.6)', border: '1px solid #333', 
              color: '#fff', width: '40px', height: '40px',
              borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(5px)',
              fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} className="view-enter-active">
        {renderizarVista()}
      </div>

      <BottomNav 
        vistaActiva={vistaActiva} 
        setVistaActiva={setVistaActiva} 
        virtualEnabled={settings.virtualRosaryEnabled}
      />

      {/* OVERLAYS */}
      {showSync && <SyncManager onClose={() => setShowSync(false)} />}
      {showSettings && (
        <SettingsOverlay 
          settings={settings} 
          onUpdateSettings={setSettings} 
          onClose={() => setShowSettings(false)} 
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
