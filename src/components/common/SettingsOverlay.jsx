import React from 'react';

const SHARE_URL = typeof window !== 'undefined'
  ? `${window.location.origin}${window.location.pathname}`
  : 'https://rosario.gatrivi.com';

const ROSARY_ZOOM_PRESETS = [
  { id: 'S', label: 'Pequeño', zoom: 0.75 },
  { id: 'M', label: 'Normal', zoom: 1.0 },
  { id: 'L', label: 'Grande', zoom: 1.25 },
  { id: 'XL', label: 'Inmenso', zoom: 1.5 },
];

function readRosaryZoom() {
  if (typeof window === 'undefined') return 1.0;
  return parseFloat(localStorage.getItem('rosaryZoom')) || 1.0;
}

function setRosaryZoom(zoom) {
  localStorage.setItem('rosaryZoom', String(zoom));
  window.dispatchEvent(new CustomEvent('rosaryZoomChange', { detail: { zoom } }));
}

async function shareApp() {
  const payload = {
    title: 'Rosario Cards',
    text: 'Reza el Rosario con imágenes, intenciones y tu propia voz.',
    url: SHARE_URL,
  };
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(payload);
      return;
    } catch (_) { /* cancelled or failed */ }
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(SHARE_URL);
    alert('Enlace copiado — compártelo con quien quieras.');
  }
}

export default function SettingsOverlay({
  settings,
  onUpdateSettings,
  onClose,
  appVersion = '',
  onCheckForUpdate,
  onStartAmbientAudio,
  onOpenAssetStudio,
  onOpenReleaseNotes,
  onOpenSync,
  onOpenFeedback,
  syncStatus,
}) {
  const [rosaryZoom, setRosaryZoomState] = React.useState(readRosaryZoom);
  const activeZoomPreset = ROSARY_ZOOM_PRESETS.find((p) => p.zoom === rosaryZoom)?.id
    ?? ROSARY_ZOOM_PRESETS.reduce((best, p) =>
      Math.abs(p.zoom - rosaryZoom) < Math.abs(best.zoom - rosaryZoom) ? p : best
    ).id;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
      padding: '16px', overflowY: 'auto', WebkitOverflowScrolling: 'touch',
    }} onClick={onClose}>
      
      <div 
        style={{
          background: '#111', border: '1px solid #333', borderRadius: '20px',
          padding: '24px', width: '100%', maxWidth: '350px',
          margin: '12px 0 32px',
          maxHeight: 'none',
          boxShadow: '0 20px 60px black', animation: 'settings-entry 0.3s ease-out',
        }} 
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '16px', position: 'sticky', top: 0, background: '#111',
          zIndex: 1, paddingBottom: '8px',
        }}>
          <h2 style={{ color: '#D4AF37', margin: 0, fontSize: '1.4rem' }}>Ajustes</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }} aria-label="Cerrar">×</button>
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

          {/* Voice sources: Tier S vs Tier 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ color: '#fff', fontSize: '1rem' }}>Voces al rezar</div>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ccc', fontSize: '0.9rem' }}>
              <span>Tu voz (Tier S)</span>
              <input
                type="checkbox"
                checked={settings.useUserVoice !== false}
                onChange={(e) => onUpdateSettings({ ...settings, useUserVoice: e.target.checked })}
              />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ccc', fontSize: '0.9rem' }}>
              <span>Guía T3 (EN)</span>
              <input
                type="checkbox"
                checked={settings.useBundledVoice !== false}
                onChange={(e) => onUpdateSettings({ ...settings, useBundledVoice: e.target.checked })}
              />
            </label>
            <div style={{ color: '#666', fontSize: '0.7rem' }}>
              Liber ▶: una vez = oración · otra = auto ≫. Tier 3 / TTS EN en Estudio (/voz).
            </div>
          </div>

          {/* Divine Mercy optional opening */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', fontSize: '1rem' }}>Apertura Divina Misericordia</div>
              <div style={{ color: '#666', fontSize: '0.75rem' }} title="Oraciones de Sangre y Agua al inicio del rosario de la Misericordia. Solo afecta Libro.">
                Sangre y Agua al inicio (Libro)
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.mercyOptionalOpening !== false}
                onChange={(e) => onUpdateSettings({ ...settings, mercyOptionalOpening: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Litany of Loreto entrance */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', fontSize: '1rem' }}>Entrada Letanía de Loreto</div>
              <div style={{ color: '#666', fontSize: '0.75rem' }}>
                Animación al llegar a la letanía (Libro)
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.litanyEntranceEnabled !== false}
                onChange={(e) => onUpdateSettings({ ...settings, litanyEntranceEnabled: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Per-verse images for Padre Nuestro / Ave María */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', fontSize: '1rem' }}>Imagen por verso</div>
              <div style={{ color: '#666', fontSize: '0.75rem' }}>
                Padre Nuestro y Ave María — un vitral por verso
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.perVersePrayerImages === true}
                onChange={(e) => onUpdateSettings({ ...settings, perVersePrayerImages: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Accesibilidad */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.04)',
            padding: '14px',
            borderRadius: '14px',
            border: '1px solid rgba(212, 175, 55, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <div style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Accesibilidad
            </div>

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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#fff', fontSize: '1rem' }}>Modo una mano</div>
                <div style={{ color: '#666', fontSize: '0.75rem' }}>Mueve los controles superiores hacia abajo</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.oneHandMode === true}
                  onChange={(e) => onUpdateSettings({ ...settings, oneHandMode: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#fff', fontSize: '1rem' }}>Botón rápido una mano</div>
                <div style={{ color: '#666', fontSize: '0.75rem' }}>Muestra un botón discreto para subir/bajar controles</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.oneHandQuickToggleEnabled !== false}
                  onChange={(e) => onUpdateSettings({ ...settings, oneHandQuickToggleEnabled: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#fff', fontSize: '1rem' }}>Flechas móviles</div>
                <div style={{ color: '#666', fontSize: '0.75rem' }}>Permite saltar entre elementos tocables en pantallas chicas</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.mobileElementArrowsEnabled !== false}
                  onChange={(e) => onUpdateSettings({ ...settings, mobileElementArrowsEnabled: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(212, 175, 55, 0.08)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
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
          </div>

          {settings.soundEnabled && onStartAmbientAudio && (
            <div>
              <div style={{ color: '#fff', fontSize: '1rem', marginBottom: '4px' }}>Sonido ambiente</div>
              <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '10px' }}>
                Si el navegador bloqueó el audio, tócalo para activarlo
              </div>
              <button
                type="button"
                onClick={onStartAmbientAudio}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(212,175,55,0.35)',
                  background: 'rgba(212,175,55,0.1)',
                  color: '#D4AF37',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                }}
              >
                Iniciar sonido ambiente
              </button>
            </div>
          )}

          {/* Rosary size */}
          <div>
            <div style={{ color: '#fff', fontSize: '1rem', marginBottom: '4px' }}>Tamaño del Rosario</div>
            <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '10px' }}>
              Puede quedar fuera de pantalla — arrástralo para encontrarlo
            </div>
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '12px' }}>
              {ROSARY_ZOOM_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setRosaryZoom(preset.zoom);
                    setRosaryZoomState(preset.zoom);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 4px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeZoomPreset === preset.id ? '#D4AF37' : 'transparent',
                    color: activeZoomPreset === preset.id ? '#000' : '#888',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                  }}
                >
                  {preset.id}
                </button>
              ))}
            </div>
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

        {/* Actions first so update / studio stay reachable on short screens */}
        {onOpenSync && (
          <button
            type="button"
            onClick={onOpenSync}
            style={{
              width: '100%', marginTop: '16px', padding: '14px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px', color: '#ccc', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: 'bold', textAlign: 'left',
            }}
          >
            ☁️ Sincronizar / refrescar
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#666', fontWeight: 'normal', marginTop: '4px' }}>
              {syncStatus ? `Estado: ${syncStatus}` : 'Nube y llave de peregrinación'}
            </span>
          </button>
        )}

        {onOpenFeedback && (
          <button
            type="button"
            onClick={onOpenFeedback}
            style={{
              width: '100%', marginTop: '10px', padding: '14px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px', color: '#ccc', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: 'bold', textAlign: 'left',
            }}
          >
            💬 Mensaje / reporte
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#666', fontWeight: 'normal', marginTop: '4px' }}>
              Enviar un problema o sugerencia
            </span>
          </button>
        )}

        {onCheckForUpdate && (
          <button
            type="button"
            onClick={onCheckForUpdate}
            style={{
              width: '100%', marginTop: onOpenSync || onOpenFeedback ? '10px' : '16px', padding: '14px',
              background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: '12px', color: '#D4AF37', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: 'bold'
            }}
          >
            🔄 Buscar actualización
          </button>
        )}

        {onOpenAssetStudio && (
          <button
            type="button"
            onClick={() => {
              onClose?.();
              onOpenAssetStudio();
            }}
            style={{
              width: '100%', marginTop: '10px', padding: '14px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px', color: '#ccc', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: 'bold', textAlign: 'left',
            }}
          >
            🖼️ Estudio de imágenes
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#666', fontWeight: 'normal', marginTop: '4px' }}>
              Renombrar, etiquetar y asignar versos
            </span>
          </button>
        )}

        {onOpenReleaseNotes && (
          <button
            type="button"
            onClick={() => onOpenReleaseNotes()}
            style={{
              width: '100%', marginTop: '10px', padding: '14px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px', color: '#ccc', cursor: 'pointer',
              fontSize: '0.95rem', fontWeight: 'bold', textAlign: 'left',
            }}
          >
            ✨ Novedades
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#666', fontWeight: 'normal', marginTop: '4px' }}>
              Qué hay en esta versión y qué viene
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={shareApp}
          style={{
            width: '100%', marginTop: '10px', padding: '14px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px', color: '#ccc', cursor: 'pointer',
            fontSize: '0.95rem', fontWeight: 'bold'
          }}
        >
          📤 Compartir la app
        </button>

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
