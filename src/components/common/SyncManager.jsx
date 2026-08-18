import React, { useState } from 'react';
import { useCloudSync } from '../../hooks/useCloudSync';

export default function SyncManager({ onClose }) {
  const { syncId, syncStatus, initializeNewSync, forceSetSyncId } = useCloudSync();
  const [inputKey, setInputKey] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  // Generate Magic Link
  const currentUrl = window.location.origin + window.location.pathname;
  const magicLink = syncId ? `${currentUrl}?sync=${syncId}` : '';

  const handleCreate = async () => {
    // Collect local data to seed the cloud
    const localData = {
      totalAveMarias: parseInt(localStorage.getItem('total_ave_marias') || '0', 10),
      nivelActualId: parseInt(localStorage.getItem('nivel_usuario') || '7', 10),
      bookletIndex: parseInt(localStorage.getItem('rosario_booklet_index') || '0', 10),
      bookletMystery: localStorage.getItem('rosario_booklet_mystery') || 'dolorosos',
      todayDate: new Date().toDateString(),
    };
    await initializeNewSync(localData);
  };

  const handleImportRequest = () => {
    if (!inputKey.trim()) return;
    setShowConfirm(true);
  };

  const confirmImport = () => {
    forceSetSyncId(inputKey.trim());
    window.location.reload(); // Hard reload to ensure all hooks reset
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('Llave copiada.');
      window.setTimeout(() => setCopyStatus(''), 1800);
    } catch (_) {
      setCopyStatus('No se pudo copiar. Seleccioná la llave manualmente.');
    }
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`¡Hola! Únete a mi peregrinación en Rosario Cards para que podamos rezar juntos o seguir mi progreso aquí: ${magicLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }} onClick={onClose}>
      <div className="modal-content" style={{
        background: 'linear-gradient(145deg, #111, #1a1510)', border: '1px solid #D4AF37',
        borderRadius: '24px', padding: '40px 30px', maxWidth: '400px', width: '100%',
        textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
        position: 'relative', backdropFilter: 'blur(20px)'
      }} onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px', background: 'transparent',
          border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer', transition: 'color 0.2s', padding: '5px'
        }}>✕</button>

        <h2 style={{ color: '#D4AF37', margin: '0 0 10px', fontSize: '1.8rem', fontWeight: 'bold' }}>
          ☁️ Mi Nube
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '30px', lineHeight: '1.5' }}>
          Lleva tus rosas a cualquier dispositivo sincronizando tu progreso.
        </p>

        {!syncId ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px', 
              border: '1px solid rgba(212,175,55,0.1)', marginBottom: '25px'
            }}>
              <p style={{ color: '#eee', margin: 0, fontSize: '0.95rem' }}>
                Tu progreso actual es <strong>local</strong>.
              </p>
            </div>
            <button 
              onClick={handleCreate}
              style={{
                width: '100%', padding: '16px', background: 'linear-gradient(90deg, #D4AF37, #C5A028)', color: '#000',
                border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(212,175,55,0.2)', transition: 'transform 0.2s'
              }}
            >
              Activar Sincronización
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {/* QR CODE */}
            <div style={{ 
              background: '#fff', padding: '12px', borderRadius: '16px', 
              width: '180px', height: '180px', margin: '0 auto',
              boxShadow: '0 0 30px rgba(255,255,255,0.1)'
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(magicLink)}`}
                alt="Sync QR"
                style={{ width: '100%', height: '100%', borderRadius: '8px' }}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>
                Llave de Peregrino
              </label>
              <div style={{ 
                display: 'flex', gap: '12px', alignItems: 'center',
                background: 'rgba(255,255,255,0.03)', padding: '12px 15px', borderRadius: '12px', border: '1px solid #333'
              }}>
                <code style={{ flex: 1, color: '#D4AF37', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', wordBreak: 'break-all' }}>
                  {syncId}
                </code>
                <button onClick={() => copyToClipboard(syncId)} style={{ background: 'rgba(212,175,55,0.1)', border: 'none', color: '#D4AF37', cursor: 'pointer', padding: '8px', borderRadius: '8px', fontSize: '1.1rem' }}>
                  📋
                </button>
              </div>
              {copyStatus ? (
                <div role="status" style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '8px' }}>
                  {copyStatus}
                </div>
              ) : null}
            </div>

            <button 
              onClick={shareViaWhatsApp}
              style={{
                padding: '14px', background: '#25D366', color: '#fff',
                border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 5px 15px rgba(37,211,102,0.2)'
              }}
            >
              <span>Enviar a mi Celular</span>
              <span style={{ fontSize: '1.2rem' }}>📱</span>
            </button>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '30px 0' }} />

        {/* IMPORT SECTION */}
        <div style={{ textAlign: 'left' }}>
          <label style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>
            Vincular Dispositivo
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text"
              placeholder="Pega aquí otra llave..."
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              style={{
                flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid #333',
                color: '#fff', padding: '14px', borderRadius: '12px', fontSize: '0.9rem',
                outline: 'none', transition: 'border-color 0.2s'
              }}
            />
            <button 
              onClick={handleImportRequest}
              style={{
                padding: '0 20px', background: 'rgba(255,255,255,0.05)', color: '#fff',
                border: '1px solid #444', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              OK
            </button>
          </div>
        </div>

        {showConfirm && (
          <div className="modal-overlay" style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.98)', borderRadius: '24px', zIndex: 100,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '30px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
            <h3 style={{ color: '#D4AF37', fontSize: '1.4rem', marginBottom: '15px' }}>¿Confirmar Cambio?</h3>
            <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '25px' }}>
              Tu progreso actual en este dispositivo será reemplazado permanentemente.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={confirmImport}
                style={{ flex: 1.2, padding: '14px', background: '#8C2832', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Vincular Ahora
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: '14px', background: '#333', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: '25px', fontSize: '0.75rem', color: syncStatus === 'synced' ? '#4CAF50' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', background: syncStatus === 'synced' ? '#4CAF50' : '#888', borderRadius: '50%' }}></span>
          {syncStatus === 'synced' ? 'Sincronizado con la Nube' : syncStatus === 'loading' ? 'Conectando...' : 'Modo Offline'}
        </div>
      </div>
    </div>
  );
}
