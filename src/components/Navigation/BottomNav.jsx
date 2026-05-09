import React from 'react';

function NavButton({ icono, texto, activo, onClick, disabled, simpleMode }) {
  return (
    <button 
      onClick={disabled ? null : onClick}
      disabled={disabled}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        background: 'transparent',
        border: 'none',
        color: disabled ? '#333' : (activo ? '#D4AF37' : '#666'),
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'color 0.2s ease',
        WebkitTapHighlightColor: 'transparent',
        opacity: disabled ? 0.5 : 1
      }}
    >
      <span style={{ fontSize: simpleMode ? '1.8rem' : '1.5rem', marginBottom: '4px', filter: activo ? 'drop-shadow(0 0 5px rgba(212,175,55,0.5))' : (disabled ? 'grayscale(1)' : 'none') }}>
        {icono}
      </span>
      <span style={{ fontSize: simpleMode ? '0.8rem' : (disabled ? '0.6rem' : '0.7rem'), fontWeight: activo ? 'bold' : 'normal' }}>
        {texto}
      </span>
    </button>
  );
}

export default function BottomNav({ vistaActiva, setVistaActiva, isLeftHanded, simpleMode = false }) {
  const navItems = [
    { id: 'monk', icono: '🧘', texto: 'Monje' },
    { id: 'camino', icono: '🚶', texto: 'Camino' },
    { id: 'tracker', icono: '📅', texto: 'Plan' },
    { id: 'rosary', icono: '📿', texto: 'Rosario' },
    { id: 'rose', icono: '🌹', texto: 'Rosa' },
    { id: 'stats', icono: '📊', texto: 'Stats' },
  ];

  const orderedItems = isLeftHanded ? [...navItems].reverse() : navItems;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '70px',
      backgroundColor: '#111',
      borderTop: '1px solid #222',
      flexShrink: 0,
      position: 'relative',
      zIndex: 50
    }}>
      {orderedItems.map((item) => (
        <NavButton 
          key={item.id}
          icono={item.icono} 
          texto={item.texto} 
          activo={vistaActiva === item.id} 
          onClick={() => setVistaActiva(item.id)} 
          simpleMode={simpleMode}
        />
      ))}
    </div>
  );
}
