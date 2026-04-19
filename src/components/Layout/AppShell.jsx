import React, { useState } from 'react';
import RosarioVirtualView from '../Views/RosarioVirtualView';
import RezoEnFocoView from '../Views/RezoEnFocoView';
import JardinDeRosasView from '../Views/JardinDeRosasView';
import PeregrinacionView from '../Views/PeregrinacionView';
import BottomNav from '../Navigation/BottomNav';

export default function AppShell() {
  const [vistaActiva, setVistaActiva] = useState('camino'); 
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem('rosario_cards_intro'));

  const dismissIntro = () => {
    localStorage.setItem('rosario_cards_intro', '1');
    setShowIntro(false);
  };

  const renderizarVista = () => {
    switch (vistaActiva) {
      case 'virtual': return <RosarioVirtualView />;
      case 'foco':    return <RezoEnFocoView />;
      case 'jardin':  return <JardinDeRosasView />;
      case 'camino':  return <PeregrinacionView />;
      default:        return <PeregrinacionView />;
    }
  };

  return (
    <div style={{
      height: '100dvh', 
      width: '100vw',
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0A0A0A',
      color: '#E0E0E0',
      overflow: 'hidden',
      fontFamily: 'serif',
      position: 'relative'
    }}>
      
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {renderizarVista()}
      </div>

      <BottomNav vistaActiva={vistaActiva} setVistaActiva={setVistaActiva} />

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
