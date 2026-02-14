import { useEffect } from 'react';

interface UnhandledErrorListenerProps {
  onError: (error: Error) => void;
}

export default function UnhandledErrorListener({ onError }: UnhandledErrorListenerProps) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      onError(event.error || new Error(event.message));
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      onError(error);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [onError]);

  return null;
}
