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
        id="virtual" 
        icono="📿" 
        texto="Virtual" 
        activo={vistaActiva === 'virtual'} 
        onClick={() => setVistaActiva('virtual')} 
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

    </div>
  );
}

function NavButton({ icono, texto, activo, onClick }) {
  return (
    <button 
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        background: 'transparent',
        border: 'none',
        color: activo ? '#D4AF37' : '#666',
        cursor: 'pointer',
        transition: 'color 0.2s ease',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <span style={{ fontSize: '1.5rem', marginBottom: '4px', filter: activo ? 'drop-shadow(0 0 5px rgba(212,175,55,0.5))' : 'none' }}>
        {icono}
      </span>
      <span style={{ fontSize: '0.7rem', fontWeight: activo ? 'bold' : 'normal' }}>
        {texto}
      </span>
    </button>
  );
}
