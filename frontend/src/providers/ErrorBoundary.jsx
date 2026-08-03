import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stitch-surface p-4">
          <div className="max-w-md w-full glass-card p-8 rounded-2xl text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600 mb-2">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-stitch-text">Something went wrong</h2>
            <p className="text-sm text-stitch-muted">
              {this.state.error?.message || 'An unexpected runtime error occurred.'}
            </p>
            <Button onClick={this.handleReset} variant="stitch" className="w-full">
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
