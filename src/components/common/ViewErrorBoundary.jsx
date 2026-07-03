import React from 'react';

/**
 * ViewErrorBoundary — catches render/runtime errors from a single view so the
 * app never white-screens. Shows the error message on screen so it can be
 * reported without devtools.
 */
export default class ViewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, viewId: props.viewId };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ViewErrorBoundary]', this.props.viewId, error, info);
  }

  componentDidUpdate(prevProps) {
    // Reset when the view changes so a broken view doesn't block navigation.
    if (prevProps.viewId !== this.props.viewId && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      const msg = this.state.error.message || String(this.state.error);
      const stack = this.state.error.stack || '';
      return (
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', padding: '24px',
          color: '#E0E0E0', textAlign: 'center', backgroundColor: '#0A0A0A',
        }}>
          <div style={{ fontSize: '2.4rem', marginBottom: '12px' }}>🕯️</div>
          <h2 style={{ color: '#D4AF37', margin: '0 0 8px', fontSize: '1.1rem' }}>
            Algo se rompió en esta vista
          </h2>
          <p style={{ color: '#999', fontSize: '0.8rem', margin: '0 0 16px' }}>
            Vista: <code style={{ color: '#D4AF37' }}>{this.state.viewId}</code>
          </p>
          <pre style={{
            maxWidth: '92%', overflow: 'auto', textAlign: 'left',
            background: 'rgba(255,255,255,0.04)', border: '1px solid #333',
            borderRadius: '8px', padding: '12px', fontSize: '0.7rem',
            color: '#ff9b9b', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>{msg}</pre>
          {stack && (
            <details style={{ marginTop: '10px', maxWidth: '92%' }}>
              <summary style={{ color: '#777', fontSize: '0.7rem', cursor: 'pointer' }}>
                Ver stack
              </summary>
              <pre style={{
                overflow: 'auto', textAlign: 'left', fontSize: '0.6rem',
                color: '#888', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>{stack}</pre>
            </details>
          )}
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: '18px', padding: '10px 20px', background: '#D4AF37',
              color: '#000', border: 'none', borderRadius: '10px',
              fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
