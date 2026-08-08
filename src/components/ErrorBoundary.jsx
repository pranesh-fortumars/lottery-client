import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log error to console for devs
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white rounded-2xl border border-red-100 shadow-lg">
          <h3 className="text-red-600 font-black uppercase tracking-widest mb-2">Admin Page Error</h3>
          <p className="text-sm text-gray-700 mb-4">An error occurred while rendering this admin page. Check the browser console for details.</p>
          <pre className="text-xs text-gray-500 break-words">{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
