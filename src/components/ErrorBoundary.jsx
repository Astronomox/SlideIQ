import { Component } from 'react';

/**
 * Global Error Boundary - catches unhandled React errors
 * Prevents entire app from crashing
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    // Store error details
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    // Reset error state and allow retry
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.title}>Something went wrong</h1>
            
            <p style={styles.message}>
              We&apos;re sorry, but something unexpected happened. Our team has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={styles.details}>
                <summary style={styles.summary}>Error Details (Development Only)</summary>
                <pre style={styles.errorText}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <button onClick={this.handleRetry} style={styles.button}>
              Try Again
            </button>

            <button
              onClick={() => (window.location.href = '/')}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0f1419',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
  },
  card: {
    backgroundColor: '#1a1f2e',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    border: '1px solid #2a2f3e',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 0,
    marginBottom: '16px',
  },
  message: {
    fontSize: '14px',
    color: '#b0b8c1',
    marginBottom: '24px',
    lineHeight: '1.6',
  },
  details: {
    marginBottom: '24px',
    padding: '12px',
    backgroundColor: '#0f1419',
    borderRadius: '8px',
    border: '1px solid #2a2f3e',
  },
  summary: {
    cursor: 'pointer',
    fontSize: '12px',
    color: '#7c8292',
    fontWeight: '500',
    userSelect: 'none',
  },
  errorText: {
    fontSize: '11px',
    color: '#ff6b6b',
    overflow: 'auto',
    padding: '12px',
    margin: '8px 0 0 0',
    backgroundColor: '#0a0d12',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  button: {
    display: 'inline-block',
    marginRight: '12px',
    marginBottom: '12px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: '#0084ff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    backgroundColor: '#2a2f3e',
    color: '#b0b8c1',
  },
};

export default ErrorBoundary;
