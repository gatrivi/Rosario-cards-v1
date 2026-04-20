import React, { useState } from 'react';
import { useCloudSync } from '../../hooks/useCloudSync';

export default function SyncManager({ onClose }) {
  const { syncId, syncStatus, initializeNewSync, forceSetSyncId } = useCloudSync();
  const [inputKey, setInputKey] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Generate Magic Link
  const currentUrl = window.location.origin + window.location.pathname;
  const magicLink = syncId ? `${currentUrl}?sync=${syncId}` : '';

  const handleCreate = async () => {
    // Collect local data to seed the cloud
    const localData = {
      totalAveMarias: parseInt(localStorage.getItem('total_ave_marias') || '0', 10),
      nivelActualId: parseInt(localStorage.getItem('nivel_usuario') || '7', 10),
      todayDate: new Date().toDateString()
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('¡Copiado con éxito!');
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(`¡Hola! Únete a mi peregrinación en Rosario Cards para que podamos rezar juntos o seguir mi progreso aquí: ${magicLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(145deg, #111, #1a1510)', border: '1px solid #D4AF37',
        borderRadius: '20px', padding: '30px', maxWidth: '400px', width: '100%',
        textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px', background: 'transparent',
          border: 'none', color: '#666', fontSize: '1.2rem', cursor: 'pointer'
        }}>✕</button>

        <h2 style={{ color: '#D4AF37', margin: '0 0 10px', fontSize: '1.5rem' }}>
          ☁️ Sincronización
        </h2>
        <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '25px' }}>
          Lleva tus rosas a cualquier dispositivo sin necesidad de cuentas.
        </p>

        {!syncId ? (
          <div style={{ padding: '20px 0' }}>
            <p style={{ color: '#eee', marginBottom: '20px', fontSize: '0.9rem' }}>
              Aún no has activado tu Nube personal.
            </p>
            <button 
              onClick={handleCreate}
              style={{
                width: '100%', padding: '12px', background: '#D4AF37', color: '#000',
                border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(212,175,55,0.3)'
              }}
            >
              Activar Mi Nube
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* QR CODE */}
            <div style={{ 
              background: '#fff', padding: '10px', borderRadius: '10px', 
              width: '150px', height: '150px', margin: '0 auto' 
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(magicLink)}`}
                alt="Sync QR"
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Llave de Peregrino
              </label>
              <div style={{ 
                display: 'flex', gap: '10px', marginTop: '5px',
                background: '#0a0a0a', padding: '10px', borderRadius: '8px', border: '1px solid #333'
              }}>
                <code style={{ flex: 1, color: '#D4AF37', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {syncId}
                </code>
                <button onClick={() => copyToClipboard(syncId)} style={{ background: 'transparent', border: 'none', color: '#D4AF37', cursor: 'pointer' }}>
                  📋
                </button>
              </div>
            </div>

            <button 
              onClick={shareViaWhatsApp}
              style={{
                padding: '10px', background: '#25D366', color: '#fff',
                border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              WhatsApp a mi Abuela / Celu
            </button>
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #222', margin: '25px 0' }} />

        {/* IMPORT SECTION */}
        <div style={{ textAlign: 'left' }}>
          <label style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Importar otra Llave
          </label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <input 
              type="text"
              placeholder="Pega aquí la llave..."
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              style={{
                flex: 1, background: '#0a0a0a', border: '1px solid #333',
                color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '0.8rem'
              }}
            />
            <button 
              onClick={handleImportRequest}
              style={{
                padding: '10px 15px', background: '#333', color: '#fff',
                border: 'none', borderRadius: '8px', cursor: 'pointer'
              }}
            >
              Vincular
            </button>
          </div>
        </div>

        {showConfirm && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)', borderRadius: '20px', zIndex: 10,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '30px'
          }}>
            <h3 style={{ color: '#D4AF37' }}>⚠️ ¿Seguro?</h3>
            <p style={{ color: '#ccc', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Al importar esta llave, tu progreso actual en este dispositivo será sobreescrito por el de la llave nueva.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={confirmImport}
                style={{ flex: 1, padding: '10px', background: '#8C2832', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }}
              >
                Sí, Vincular
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: '10px', background: '#333', border: 'none', borderRadius: '8px', color: '#fff' }}
              >
                No
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', fontSize: '0.7rem', color: syncStatus === 'synced' ? '#4CAF50' : '#888' }}>
          ● {syncStatus === 'synced' ? 'Conectado a la Nube' : syncStatus === 'loading' ? 'Sincronizando...' : 'Modo Offline'}
        </div>
      </div>
    </div>
  );
}
