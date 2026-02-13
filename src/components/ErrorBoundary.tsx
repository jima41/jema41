import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ccc',
          borderRadius: '5px',
          margin: '20px',
          fontFamily: 'monospace'
        }}>
          <h2 style={{ color: '#d32f2f' }}>🚨 ERREUR CAPTURÉE 🚨</h2>
          <p><strong>Composant qui a crashé :</strong> {this.state.error?.name}</p>
          <p><strong>Message :</strong> {this.state.error?.message}</p>
          <details style={{ marginTop: '10px' }}>
            <summary>Stack Trace (cliquez pour voir)</summary>
            <pre style={{
              backgroundColor: '#fff',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;