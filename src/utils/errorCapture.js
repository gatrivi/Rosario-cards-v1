/**
 * Ring buffer of recent console/runtime errors for easy paste back to agents.
 * Mobile DevTools copy is painful — Ajustes → Copiar errores.
 */

const MAX = 40;
const buf = [];
let installed = false;

function push(line) {
  const stamp = new Date().toISOString().slice(11, 19);
  buf.push(`${stamp} ${line}`);
  if (buf.length > MAX) buf.shift();
}

function stringifyArg(a) {
  if (a == null) return String(a);
  if (a instanceof Error) return a.stack || a.message || String(a);
  if (typeof a === 'string') return a;
  try {
    return JSON.stringify(a);
  } catch (_) {
    return String(a);
  }
}

export function installErrorCapture() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const origErr = console.error;
  console.error = (...args) => {
    try {
      push(args.map(stringifyArg).join(' '));
    } catch (_) {
      /* ignore */
    }
    origErr.apply(console, args);
  };

  window.addEventListener('error', (e) => {
    push(`error: ${e.message || 'unknown'} @ ${e.filename || '?'}:${e.lineno || '?'}`);
  });
  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason;
    push(`rejection: ${r instanceof Error ? r.message : stringifyArg(r)}`);
  });
}

export function getCapturedErrorsText() {
  if (!buf.length) return '(sin errores capturados aún)';
  return buf.join('\n');
}

export async function copyCapturedErrors() {
  const text = getCapturedErrorsText();
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return { ok: true, text };
  }
  return { ok: false, text };
}
