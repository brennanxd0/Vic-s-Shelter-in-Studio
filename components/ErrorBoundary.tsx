import React, { useState, useEffect, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      setHasError(true);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const handleReset = () => {
    setHasError(false);
    setError(null);
    window.location.href = '/';
  };

  if (hasError) {
    let errorMessage = "An unexpected error occurred. Please try again later.";
    let isFirestoreError = false;

    try {
      if (error?.message) {
        const parsed = JSON.parse(error.message);
        if (parsed.error && parsed.operationType) {
          isFirestoreError = true;
          errorMessage = `Security Access Denied: You don't have permission to ${parsed.operationType} this resource (${parsed.path}).`;
        }
      }
    } catch (e) {
      if (error?.message) {
        errorMessage = error.message;
      }
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-purple-100 border border-slate-100 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertTriangle className="w-10 h-10 text-rose-500" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 mb-4 italic">
            {isFirestoreError ? 'Access Denied' : 'Something went wrong'}
          </h2>
          
          <p className="text-slate-500 mb-8 leading-relaxed">
            {errorMessage}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            
            <button
              onClick={handleReset}
              className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Go to Homepage
            </button>
          </div>
          
          {isFirestoreError && (
            <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Error Code: FS_AUTH_INSUFFICIENT
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ErrorBoundary;
