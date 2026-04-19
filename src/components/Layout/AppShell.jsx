import React, { useState } from 'react';
import RosarioVirtualView from '../Views/RosarioVirtualView';
import RezoEnFocoView from '../Views/RezoEnFocoView';
import JardinDeRosasView from '../Views/JardinDeRosasView';
import PeregrinacionView from '../Views/PeregrinacionView';
import BottomNav from '../Navigation/BottomNav';

export default function AppShell() {
  const [vistaActiva, setVistaActiva] = useState('camino'); 

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
      fontFamily: 'serif'
    }}>
      
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {renderizarVista()}
      </div>

      <BottomNav vistaActiva={vistaActiva} setVistaActiva={setVistaActiva} />

    </div>
  );
}
