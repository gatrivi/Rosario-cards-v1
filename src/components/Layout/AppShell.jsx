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
  const [vistaActiva, setVistaActiva] = useState('camino'); 
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem('rosario_cards_intro'));
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

  const confirmPendingSync = () => {
    if (pendingSyncId) {
      forceSetSyncId(pendingSyncId);
      window.location.href = window.location.origin + window.location.pathname; // Clean URL
    }
  };

  const dismissIntro = () => {
    localStorage.setItem('rosario_cards_intro', '1');
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
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 20000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#111', border: '1px solid #D4AF37', borderRadius: '20px',
            padding: '30px', maxWidth: '350px', textAlign: 'center', boxShadow: '0 20px 60px black'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔗</div>
            <h2 style={{ color: '#D4AF37', marginBottom: '15px' }}>¿Vincular Dispositivo?</h2>
            <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '25px' }}>
              Hemos detectado una llave de peregrinación. <br/>
              Si aceptas, tu progreso actual en este dispositivo será reemplazado por el de la llave entrante.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={confirmPendingSync}
                style={{ flex: 1, padding: '12px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}
              >
                Sí, Vincular
              </button>
              <button 
                onClick={() => setPendingSyncId(null)}
                style={{ flex: 1, padding: '12px', background: '#333', color: '#fff', border: 'none', borderRadius: '10px' }}
              >
                Ahora No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WELCOME INTRO */}
      {showIntro && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }} onClick={dismissIntro}>
          <div style={{
            background: 'linear-gradient(145deg, #111, #1a0a0a)', border: '1px solid #D4AF37',
            borderRadius: '16px', padding: '30px 20px', maxWidth: '400px', textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }} onClick={e => e.stopPropagation()}>
            <h1 style={{ color: '#D4AF37', margin: '0 0 15px', fontSize: '1.8rem' }}>Rosario Cards</h1>
            <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: '1.6', margin: '0 0 20px' }}>
              Una herramienta devocional para meditar profundamente.
            </p>
            <div style={{ textAlign: 'left', color: '#aaa', fontSize: '0.85rem', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>🚶 <strong>El Camino:</strong> Observa tu progreso histórico hacia la meta espiritual.</div>
              <div>🌹 <strong>Rezar:</strong> Lee lentamente siguiendo la luz para cultivar concentración total.</div>
              <div>🪴 <strong>El Jardín:</strong> Colecciona rosas vectoriales generadas según tu nivel de devoción.</div>
            </div>
            
            <button 
              onClick={dismissIntro}
              style={{
                width: '100%', padding: '12px', background: '#D4AF37', color: '#000',
                border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem',
                cursor: 'pointer', opacity: 0.9, transition: 'opacity 0.2s'
              }}
            >
              Comenzar Peregrinación
            </button>
            <p style={{ fontSize: '0.7rem', color: '#666', margin: '15px 0 0 0' }}>
              Podrás acceder a esta información guiada luego tocando los íconos (ℹ️).
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
