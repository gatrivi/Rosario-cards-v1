import React from 'react';

export default function SettingsOverlay({ settings, onUpdateSettings, onClose, appVersion = '', onCheckForUpdate }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }} onClick={onClose}>
      
      <div 
        style={{
          background: '#111', border: '1px solid #333', borderRadius: '20px',
          padding: '30px', width: '100%', maxWidth: '350px',
          boxShadow: '0 20px 60px black', animation: 'settings-entry 0.3s ease-out'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#D4AF37', margin: 0, fontSize: '1.4rem' }}>Ajustes</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Virtual Rosary Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', fontSize: '1rem' }}>Rosario Virtual</div>
              <div style={{ color: '#666', fontSize: '0.75rem' }}>Interactúa con el rosario físico (Beta)</div>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.virtualRosaryEnabled}
                onChange={(e) => onUpdateSettings({ ...settings, virtualRosaryEnabled: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Sound Toggle (Mirroring global state) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', fontSize: '1rem' }}>Efectos de Sonido</div>
              <div style={{ color: '#666', fontSize: '0.75rem' }}>Organismo y campanas góticas</div>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ ...settings, soundEnabled: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Left Handed Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', fontSize: '1rem' }}>Modo Zurdo</div>
              <div style={{ color: '#666', fontSize: '0.75rem' }}>Invierte el orden de la navegación</div>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.isLeftHanded}
                onChange={(e) => onUpdateSettings({ ...settings, isLeftHanded: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Simple Mode (Accessibility) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212, 175, 55, 0.05)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <div>
              <div style={{ color: '#D4AF37', fontSize: '1rem', fontWeight: 'bold' }}>👵 Lectura Fácil</div>
              <div style={{ color: '#aaa', fontSize: '0.75rem' }}>Letras grandes y toques simples</div>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={settings.simpleMode}
                onChange={(e) => onUpdateSettings({ ...settings, simpleMode: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Meditation Rhythm (The Three Gifts) */}
          <div style={{ marginTop: '10px' }}>
            <div style={{ color: '#fff', fontSize: '1rem', marginBottom: '12px' }}>Ritmo de Meditación</div>
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '12px' }}>
              {[
                { id: 'oro', label: '🌕 Oro', desc: 'Fluido' },
                { id: 'incienso', label: '🌫️ Incienso', desc: 'Normal' },
                { id: 'mirra', label: '🌑 Mirra', desc: 'Profundo' }
              ].map(ritmo => (
                <button
                  key={ritmo.id}
                  onClick={() => onUpdateSettings({ ...settings, meditationRitmo: ritmo.id })}
                  style={{
                    flex: 1, padding: '10px 5px', borderRadius: '8px', border: 'none',
                    background: settings.meditationRitmo === ritmo.id ? '#D4AF37' : 'transparent',
                    color: settings.meditationRitmo === ritmo.id ? '#000' : '#888',
                    cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem', fontWeight: 'bold',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
                  }}
                >
                  <span>{ritmo.label}</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{ritmo.desc}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {onCheckForUpdate && (
          <button
            type="button"
            onClick={onCheckForUpdate}
            style={{
              width: '100%', marginTop: '20px', padding: '14px',
              background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: '12px', color: '#D4AF37', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: 'bold'
            }}
          >
            🔄 Buscar actualización
          </button>
        )}

        <div style={{ marginTop: '24px', borderTop: '1px solid #222', paddingTop: '16px', textAlign: 'center' }}>
          <div style={{ color: '#444', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Rosario Cards {appVersion ? `v${appVersion}` : ''}
          </div>
          <div style={{ color: '#333', fontSize: '0.65rem', marginTop: '6px' }}>
            Si no ves cambios: Ajustes → Buscar actualización.
            Oirás un trino cuando haya parche listo.
          </div>
        </div>

      </div>

      <style>{`
        @keyframes settings-entry {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #222;
          transition: .4s;
          border: 1px solid #333;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px; width: 16px;
          left: 4px; bottom: 3px;
          background-color: #666;
          transition: .4s;
        }
        input:checked + .slider { background-color: #D4AF37; border-color: #D4AF37; }
        input:checked + .slider:before { transform: translateX(26px); background-color: #000; }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }
      `}</style>

    </div>
  );
}
