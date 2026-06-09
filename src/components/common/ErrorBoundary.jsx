import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div className="error-boundary">
          <p className="error-boundary__title">Algo falló al mostrar esta pantalla.</p>
          <p className="error-boundary__msg">{error.message || 'Error inesperado'}</p>
          <button
            type="button"
            className="error-boundary__btn"
            onClick={() => this.setState({ error: null })}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
