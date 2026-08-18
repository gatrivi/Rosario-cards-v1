import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { bindAppDialogHost } from '../../utils/appDialog';
import './AppDialogHost.css';

export default function AppDialogHost() {
  const [queue, setQueue] = useState([]);
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const current = queue[0] || null;

  useEffect(() => bindAppDialogHost((request) => {
    setQueue((items) => [...items, request]);
  }), []);

  useEffect(() => {
    if (!current) return;
    setValue(String(current.defaultValue ?? ''));
    const timer = window.setTimeout(() => {
      if (current.kind === 'prompt') inputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [current]);

  useEffect(() => {
    if (!current) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        settle(current.kind === 'confirm' ? false : current.kind === 'prompt' ? null : true);
      }
      if (event.key === 'Enter' && current.kind !== 'alert' && (current.kind !== 'prompt' || !event.shiftKey)) {
        event.preventDefault();
        settle(current.kind === 'prompt' ? value : true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  function settle(result) {
    const active = queue[0];
    if (!active) return;
    active.resolve(result);
    setQueue((items) => items.slice(1));
  }

  if (!current || typeof document === 'undefined') return null;

  const title = current.title || (
    current.kind === 'prompt'
      ? 'Ingresar dato'
      : current.kind === 'confirm'
        ? 'Confirmar'
        : 'Aviso'
  );
  const confirmLabel = current.confirmLabel || (current.kind === 'alert' ? 'Aceptar' : 'Confirmar');
  const cancelLabel = current.cancelLabel || 'Cancelar';

  return createPortal(
    <div
      className="app-dialog__backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (current.kind === 'alert') settle(true);
        else settle(current.kind === 'confirm' ? false : null);
      }}
    >
      <section
        className="app-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`app-dialog-title-${current.id}`}
        aria-describedby={`app-dialog-message-${current.id}`}
      >
        <h2 id={`app-dialog-title-${current.id}`} className="app-dialog__title">{title}</h2>
        <p id={`app-dialog-message-${current.id}`} className="app-dialog__message">{current.message}</p>

        {current.kind === 'prompt' ? (
          <input
            ref={inputRef}
            className="app-dialog__input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-label={title}
          />
        ) : null}

        <div className="app-dialog__actions">
          {current.kind !== 'alert' ? (
            <button
              type="button"
              className="app-dialog__button app-dialog__button--secondary"
              onClick={() => settle(current.kind === 'confirm' ? false : null)}
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            autoFocus={current.kind !== 'prompt'}
            className={`app-dialog__button app-dialog__button--primary${current.destructive ? ' app-dialog__button--danger' : ''}`}
            onClick={() => settle(current.kind === 'prompt' ? value : true)}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}
