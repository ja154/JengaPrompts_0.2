import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const isApiKeyError = this.state.error?.message.includes("API key is not set");
      
      return (
        <div className="w-full h-screen flex items-center justify-center p-4">
            <div className="glass rounded-2xl max-w-lg w-full p-8 text-center">
                <i className="fas fa-exclamation-triangle text-5xl text-red-500 mb-6"></i>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Application Error</h1>
                <p className="text-slate-600 dark:text-gray-300 mb-6">
                    Sorry, the application encountered a problem and couldn't load.
                </p>

                {isApiKeyError && (
                    <div className="bg-orange-100 dark:bg-orange-800/50 border-l-4 border-orange-500 text-orange-700 dark:text-orange-200 p-4 text-left text-sm" role="alert">
                        <p className="font-bold">Configuration Issue Detected</p>
                        <p>The error suggests that the <strong>API_KEY</strong> is missing. If you are deploying this application, please ensure you have set the <code>API_KEY</code> environment variable in your project settings.</p>
                    </div>
                )}

                <button 
                    onClick={() => window.location.reload()}
                    className="mt-8 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-all"
                >
                    Reload Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;