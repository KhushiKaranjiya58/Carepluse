/**
 * Error Boundary
 * Catches render errors and shows a friendly message instead of a white screen
 */

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
          <div className="card max-w-md text-center">
            <h2 className="text-xl font-bold text-slate-100 mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-4">
              The app hit an unexpected error. Try clearing your session and reloading.
            </p>
            <button onClick={this.handleReset} className="btn-primary">
              Reset and Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
