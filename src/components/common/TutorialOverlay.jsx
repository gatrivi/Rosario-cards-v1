import React, { useState } from 'react';

export default function TutorialOverlay({ title, text, imageSrc, icon = "ℹ️" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', 
          fontSize: '1rem', cursor: 'pointer', padding: '8px',
          color: '#D4AF37', transition: 'all 0.2s', borderRadius: '50%',
          width: '35px', height: '35px', display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(5px)'
        }}
        title="Guía"
      >
        {icon}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', 
          justifyContent: 'center', alignItems: 'center', padding: '20px'
        }} onClick={() => setIsOpen(false)}>
          <div className="modal-content" style={{
            background: 'linear-gradient(145deg, #111, #1a1a1a)', border: '1px solid #D4AF37', borderRadius: '20px',
            maxWidth: '400px', width: '100%', overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)', backdropFilter: 'blur(15px)'
          }} onClick={(e) => e.stopPropagation()}>
            
            <img 
              src={imageSrc} 
              alt="Context" 
              style={{ width: '100%', height: '220px', objectFit: 'cover', opacity: 0.9, borderBottom: '1px solid #D4AF37' }} 
            />
            
            <div style={{ padding: '30px' }}>
              <h3 style={{ color: '#D4AF37', margin: '0 0 15px 0', fontSize: '1.4rem', fontWeight: 'bold' }}>{title}</h3>
              <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {text}
              </p>
              
              <button 
                onClick={() => setIsOpen(false)}
                style={{
                  marginTop: '30px', width: '100%', padding: '14px',
                  background: 'linear-gradient(90deg, #2a0a0a, #3d0f0f)', border: '1px solid #D4AF37', borderRadius: '12px',
                  color: '#D4AF37', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem',
                  transition: 'transform 0.2s'
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
