import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log en consola para debugging sin romper la UI
    console.error('[I Ching] Error capturado por ErrorBoundary:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Si hay un callback de reinicio del padre, usarlo
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { fallback } = this.props;
    if (fallback) return fallback;

    return (
      <div className="error-boundary">
        <div className="error-boundary-inner">
          <p className="error-boundary-icon">☯</p>
          <h2 className="error-boundary-title">
            {this.props.title || 'Algo no fue bien'}
          </h2>
          <p className="error-boundary-msg">
            {this.props.message ||
              'El oráculo ha encontrado un obstáculo inesperado. Reinicia tu consulta para continuar.'}
          </p>
          <button className="btn btn-nueva" onClick={this.handleReset}>
            {this.props.resetLabel || 'Reiniciar consulta'}
          </button>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="error-boundary-details">
              <summary>Detalle técnico</summary>
              <pre>{this.state.error.toString()}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
