import React, { useState } from 'react';

export default function TutorialOverlay({ title, text, imageSrc, icon = "ℹ️" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          background: 'none', border: 'none', fontSize: '1.2rem', 
          cursor: 'pointer', opacity: 0.7, padding: '5px',
          color: '#D4AF37', transition: 'opacity 0.2s'
        }}
        title="Tutorial"
      >
        {icon}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
          zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '20px'
        }} onClick={() => setIsOpen(false)}>
          <div style={{
            background: '#111', border: '1px solid #D4AF37', borderRadius: '12px',
            maxWidth: '400px', width: '100%', overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            
            <img 
              src={imageSrc} 
              alt="Saint" 
              style={{ width: '100%', height: '200px', objectFit: 'cover', opacity: 0.8 }} 
            />
            
            <div style={{ padding: '20px' }}>
              <h3 style={{ color: '#D4AF37', margin: '0 0 10px 0' }}>{title}</h3>
              <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                {text}
              </p>
              
              <button 
                onClick={() => setIsOpen(false)}
                style={{
                  marginTop: '20px', width: '100%', padding: '10px',
                  background: '#2a0a0a', border: '1px solid #D4AF37', borderRadius: '6px',
                  color: '#D4AF37', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Continuar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
