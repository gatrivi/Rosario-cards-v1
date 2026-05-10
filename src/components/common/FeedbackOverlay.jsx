import React, { useState, useRef } from 'react';

const FEEDBACK_API = 'https://jsonblob.com/api/jsonBlob';
// A dedicated public-ish bucket for feedback (In production, use a proper backend)
const FEEDBACK_BUCKET_ID = '1370162590204731392'; 

export default function FeedbackOverlay({ telemetry, onClose }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleSend = async () => {
    if (!text && audioChunksRef.current.length === 0) return;
    
    setStatus('sending');
    const feedbackPayload = {
      ...telemetry,
      message: text,
      timestamp: new Date().toISOString(),
      type: audioChunksRef.current.length > 0 ? 'audio+text' : 'text'
    };

    try {
      // 1. Get existing feedback (simplistic append logic for jsonblob)
      const getRes = await fetch(`${FEEDBACK_API}/${FEEDBACK_BUCKET_ID}`);
      const existing = await getRes.json();
      const updated = Array.isArray(existing) ? [...existing, feedbackPayload] : [feedbackPayload];

      // 2. Put back
      await fetch(`${FEEDBACK_API}/${FEEDBACK_BUCKET_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated.slice(-100)) // Keep last 100 entries to avoid bloat
      });

      setStatus('success');
      setTimeout(onClose, 2000);
    } catch (e) {
      console.error('Feedback failed:', e);
      setStatus('error');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        // In a real app, we'd upload this to S3/Cloudinary
        // For now, we just notify the user it's "noted"
        setText(prev => prev + "\n[Nota de voz grabada]");
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("No se pudo acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.9)', zIndex: 20000,
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    }} onClick={onClose}>
      
      <div 
        style={{
          background: '#1a1a1a', border: '2px solid #D4AF37', borderRadius: '24px',
          padding: '25px', width: '100%', maxWidth: '400px',
          boxShadow: '0 0 50px rgba(212,175,55,0.2)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ color: '#D4AF37', marginTop: 0, fontSize: '1.2rem', textAlign: 'center' }}>
          {telemetry.simpleMode ? '👵 ¿Necesitas Ayuda?' : 'Ayúdanos a Mejorar'}
        </h2>
        
        <p style={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center', marginBottom: '20px' }}>
          Dinos qué falla o qué te gustaría cambiar. Enviamos automáticamente los detalles técnicos.
        </p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', color: '#4CAF50', padding: '40px 0' }}>
            <div style={{ fontSize: '3rem' }}>🙏</div>
            <div style={{ fontWeight: 'bold' }}>¡Mensaje recibido!</div>
            <div style={{ fontSize: '0.8rem', marginTop: '10px' }}>Gracias por tu ayuda.</div>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe aquí..."
              style={{
                width: '100%', height: '120px', borderRadius: '12px',
                background: '#111', color: '#fff', border: '1px solid #333',
                padding: '12px', fontSize: telemetry.simpleMode ? '1.1rem' : '0.9rem',
                outline: 'none', resize: 'none', marginBottom: '15px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onPointerDown={startRecording}
                onPointerUp={stopRecording}
                style={{
                  flex: 1, padding: '15px', borderRadius: '12px', border: 'none',
                  background: isRecording ? '#ff4444' : '#333',
                  color: '#fff', cursor: 'pointer', fontWeight: 'bold',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {isRecording ? '⏺ Grabando...' : '🎤 Nota de Voz'}
              </button>

              <button
                onClick={handleSend}
                disabled={status === 'sending'}
                style={{
                  flex: 1, padding: '15px', borderRadius: '12px', border: 'none',
                  background: '#D4AF37', color: '#000', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                {status === 'sending' ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
            
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
               <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', cursor: 'pointer' }}>
                 Cancelar
               </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
