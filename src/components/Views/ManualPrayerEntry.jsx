import React, { useState } from 'react';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';

export default function ManualPrayerEntry() {
  const { addRosas, storeRoseData } = useAveMariaStats();
  const [amount, setAmount] = useState(1);
  const [message, setMessage] = useState('');
  const record = event => {
    event.preventDefault();
    const timestamp = Date.now();
    storeRoseData(Array.from({ length: amount }, (_, index) => ({
      timestamp: timestamp + index, source: 'manual',
    })));
    addRosas(amount);
    setMessage(`Registradas ${amount} ${amount === 1 ? 'rosa' : 'rosas'} de tu oración fuera de la app.`);
  };
  return (
    <form onSubmit={record} style={{ margin: '16px auto', maxWidth: 360 }}>
      <label htmlFor="manual-prayer" style={{ display: 'block', marginBottom: 8 }}>
        Recé fuera de la app
      </label>
      <select id="manual-prayer" value={amount} onChange={event => setAmount(Number(event.target.value))}
        style={{ padding: 10, background: '#181818', color: '#eee', border: '1px solid #777', borderRadius: 8 }}>
        <option value={1}>Un Ave María · 1 rosa</option>
        <option value={10}>Una decena · 10 rosas</option>
        <option value={50}>Un Rosario · 50 rosas</option>
      </select>
      <button type="submit" style={{ marginLeft: 8, padding: 10, borderRadius: 8, cursor: 'pointer' }}>
        Registrar
      </button>
      <p role="status" style={{ fontSize: '0.85rem', color: '#d4af37' }}>{message}</p>
    </form>
  );
}
