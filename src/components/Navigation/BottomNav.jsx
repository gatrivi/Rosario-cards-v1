import React from 'react';

export default function BottomNav({ vistaActiva, setVistaActiva }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: '70px',
      backgroundColor: '#111',
      borderTop: '1px solid #222',
      flexShrink: 0
    }}>
      
      <NavButton 
        id="camino" 
        icono="🚶" 
        texto="Camino" 
        activo={vistaActiva === 'camino' || vistaActiva === 'macetones'} 
        onClick={() => setVistaActiva('camino')} 
      />

      <NavButton 
        id="foco" 
        icono="🌹" 
        texto="Rezar" 
        activo={vistaActiva === 'foco'} 
        onClick={() => setVistaActiva('foco')} 
      />
      
      <NavButton 
        id="jardin" 
        icono="🪴" 
        texto="Jardín" 
        activo={vistaActiva === 'jardin'} 
        onClick={() => setVistaActiva('jardin')} 
      />

      <NavButton 
        id="virtual" 
        icono="📿" 
        texto="Virtual" 
        activo={vistaActiva === 'virtual'} 
        disabled={!virtualEnabled}
        onClick={() => setVistaActiva('virtual')} 
      />

    </div>
  );
}

export default function BottomNav({ vistaActiva, setVistaActiva, virtualEnabled }) {

function NavButton({ icono, texto, activo, onClick, disabled }) {
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
      <span style={{ fontSize: '1.5rem', marginBottom: '4px', filter: activo ? 'drop-shadow(0 0 5px rgba(212,175,55,0.5))' : (disabled ? 'grayscale(1)' : 'none') }}>
        {icono}
      </span>
      <span style={{ fontSize: disabled ? '0.6rem' : '0.7rem', fontWeight: activo ? 'bold' : 'normal' }}>
        {texto}
      </span>
    </button>
  );
}
