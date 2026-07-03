import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NIVELES } from '../../data/LevelConfig';
import { useAveMariaStats } from '../../hooks/useAveMariaStats';
import { getPathForView } from '../../navigation/routes';
import NunSilhouette from './NunSilhouette';
import './NunPlanView.css';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function NunPlanView() {
  const navigate = useNavigate();
  const {
    nivelActual,
    cambiarNivel,
    dailyAveMarias,
    objetivoMacetonesHoy,
    totalAveMarias,
  } = useAveMariaStats();

  const hoy = new Date().getDay();
  const rosariosHoy = Math.floor(dailyAveMarias / 50);
  const pct = objetivoMacetonesHoy
    ? Math.min(100, Math.round((rosariosHoy / objetivoMacetonesHoy) * 100))
    : 0;

  return (
    <div className="nun-plan">
      <header className="nun-plan__header">
        <h1 className="nun-plan__title">Plan de la Hermana</h1>
        <p className="nun-plan__subtitle">
          Elige tu ritmo — de una semilla de oración hasta la entrega de Padre Pío
        </p>
      </header>

      <section className="nun-plan__today">
        <div className="nun-plan__today-row">
          <span>Hoy ({DAY_NAMES[hoy]})</span>
          <strong>{rosariosHoy} / {objetivoMacetonesHoy} rosarios</strong>
        </div>
        <div className="nun-plan__track" aria-hidden="true">
          <div className="nun-plan__fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="nun-plan__meta">{dailyAveMarias} Ave Marías · {totalAveMarias} total</p>
      </section>

      <div className="nun-plan__grid">
        {NIVELES.map((n) => {
          const selected = nivelActual.id === n.id;
          const todayGoal = n.rutinaDiaria[hoy] || 0;
          return (
            <button
              key={n.id}
              type="button"
              className={`nun-plan__card${selected ? ' nun-plan__card--active' : ''}`}
              onClick={() => cambiarNivel(n.id)}
            >
              <NunSilhouette levelId={n.id} selected={selected} size={72} />
              <span className="nun-plan__level-name">{n.name}</span>
              <span className="nun-plan__level-goal">
                {todayGoal === 0 ? 'descanso' : `${todayGoal} rosario${todayGoal > 1 ? 's' : ''} hoy`}
              </span>
            </button>
          );
        })}
      </div>

      <div className="nun-plan__actions">
        <button
          type="button"
          className="nun-plan__btn nun-plan__btn--gold"
          onClick={() => navigate(getPathForView('macetones'))}
        >
          🌹 Rosedal diario
        </button>
        <button
          type="button"
          className="nun-plan__btn"
          onClick={() => navigate(getPathForView('rose'))}
        >
          Rezar en Rosa
        </button>
        <button
          type="button"
          className="nun-plan__btn"
          onClick={() => navigate(getPathForView('rosary'))}
        >
          Rosario virtual
        </button>
      </div>
    </div>
  );
}
