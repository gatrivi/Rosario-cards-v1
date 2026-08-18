import React, { useMemo, useState } from 'react';

const FEEDBACK_ENDPOINT = process.env.REACT_APP_FEEDBACK_URL || '';

function formatFeedbackReport(payload) {
  const technical = Object.entries(payload)
    .filter(([key]) => key !== 'message')
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join('\n');
  return `Rosario Cards — feedback\n\n${payload.message}\n\n---\n${technical}`;
}

export default function FeedbackOverlay({ telemetry, onClose }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle'); // idle, sending, success, copied, error
  const [statusMessage, setStatusMessage] = useState('');

  const canSend = useMemo(() => text.trim().length > 0 && status !== 'sending', [text, status]);

  const handleSend = async () => {
    const message = text.trim();
    if (!message) return;

    setStatus('sending');
    setStatusMessage('');
    const feedbackPayload = {
      ...telemetry,
      message,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    try {
      if (FEEDBACK_ENDPOINT) {
        const response = await fetch(FEEDBACK_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackPayload),
        });
        if (!response.ok) throw new Error(`feedback endpoint ${response.status}`);
        setStatus('success');
        setStatusMessage('Mensaje enviado. Gracias.');
        return;
      }

      const report = formatFeedbackReport(feedbackPayload);
      if (navigator.share) {
        await navigator.share({ title: 'Rosario Cards — feedback', text: report });
        setStatus('success');
        setStatusMessage('Reporte compartido. Gracias.');
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(report);
        setStatus('copied');
        setStatusMessage('Reporte copiado. Pegalo en el canal por el que quieras enviarlo.');
        return;
      }

      throw new Error('No feedback transport available');
    } catch (error) {
      if (error?.name === 'AbortError') {
        setStatus('idle');
        return;
      }
      console.warn('Feedback failed:', error);
      setStatus('error');
      setStatusMessage('No se pudo compartir el reporte. Copiá el texto y reintentá.');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.9)', zIndex: 20000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        style={{
          background: '#1a1a1a', border: '2px solid #D4AF37', borderRadius: '24px',
          padding: '25px', width: '100%', maxWidth: '400px',
          boxShadow: '0 0 50px rgba(212,175,55,0.2)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 id="feedback-title" style={{ color: '#D4AF37', marginTop: 0, fontSize: '1.2rem', textAlign: 'center' }}>
          {telemetry.simpleMode ? '¿Necesitás ayuda?' : 'Ayudanos a mejorar'}
        </h2>

        <p style={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center', marginBottom: '20px' }}>
          Contanos qué falla o qué cambiarías. El reporte incluye versión, vista y datos técnicos básicos; no incluye intenciones de oración ni grabaciones.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribí acá..."
          style={{
            boxSizing: 'border-box', width: '100%', height: '120px', borderRadius: '12px',
            background: '#111', color: '#fff', border: '1px solid #333',
            padding: '12px', fontSize: telemetry.simpleMode ? '1.1rem' : '0.9rem',
            outline: 'none', resize: 'none', marginBottom: '15px'
          }}
        />

        {statusMessage ? (
          <p role="status" style={{
            margin: '0 0 12px',
            color: status === 'error' ? '#ff8a8a' : '#8fd39b',
            fontSize: '0.82rem',
            lineHeight: 1.4,
          }}>
            {statusMessage}
          </p>
        ) : null}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #444',
              background: '#222', color: '#ddd', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            style={{
              flex: 1, padding: '15px', borderRadius: '12px', border: 'none',
              background: '#D4AF37', color: '#000', cursor: canSend ? 'pointer' : 'default', fontWeight: 'bold',
              opacity: canSend ? 1 : 0.55,
            }}
          >
            {status === 'sending' ? 'Procesando…' : FEEDBACK_ENDPOINT ? 'Enviar' : 'Compartir'}
          </button>
        </div>
      </div>
    </div>
  );
}
