import { useState, useCallback } from 'react';

interface UseErrorDialogReturn {
  error: string | null;
  showError: boolean;
  setError: (error: string | null) => void;
  clearError: () => void;
  handleError: (error: any) => void;
}

/**
 * Custom hook for managing error dialogs
 * Automatically shows error dialog when error is set and converts technical errors to user-friendly messages
 */
export const useErrorDialog = (): UseErrorDialogReturn => {
  const [error, setErrorState] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const setError = useCallback((err: string | null) => {
    setErrorState(err);
    if (err) {
      setShowError(true);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
    setShowError(false);
  }, []);

  const getUserFriendlyMessage = (errorMessage: string): string => {
    const lowerError = errorMessage.toLowerCase();
    
    // Map technical errors to user-friendly messages
    if (lowerError.includes('network') || lowerError.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    if (lowerError.includes('unauthorized') || lowerError.includes('401')) {
      return 'Your session has expired. Please log in again.';
    }
    if (lowerError.includes('forbidden') || lowerError.includes('403')) {
      return 'You don\'t have permission to perform this action.';
    }
    if (lowerError.includes('not found') || lowerError.includes('404')) {
      return 'The requested information could not be found.';
    }
    if (lowerError.includes('timeout')) {
      return 'The request took too long. Please try again.';
    }
    if (lowerError.includes('server error') || lowerError.includes('500')) {
      return 'We\'re experiencing technical difficulties. Please try again later.';
    }
    if (lowerError.includes('validation') || lowerError.includes('invalid') || lowerError.includes('scheduled time') || lowerError.includes('demo')) {
      return errorMessage; // Keep validation and demo messages as they're usually user-friendly
    }
    
    // If it's already a user-friendly message (no technical jargon), keep it
    if (!lowerError.includes('failed') && errorMessage.length < 150) {
      // Allow "An error occurred" only if it's the only message. 
      // But if it contains "error", we usually check if it looks technical.
      if (lowerError === 'an error occurred') return 'We encountered an unexpected issue. Please try again.';
      
      return errorMessage;
    }
    
    // Default fallback for unknown errors
    return 'We encountered an unexpected issue. Please try again.';
  };

  const handleError = useCallback((err: any) => {
    const data = err?.response?.data;
    
    // Prioritize specific error detail over generic message
    let errorMessage = 'An unexpected error occurred';
    
    if (data?.error && data?.error !== 'An error occurred') {
      errorMessage = data.error;
    } else if (data?.message && data?.message !== 'An error occurred') {
      errorMessage = data.message;
    } else if (data?.error) {
      errorMessage = data.error;
    } else if (data?.message) {
      errorMessage = data.message;
    } else if (err?.message) {
      errorMessage = err.message;
    }
    
    // Convert to user-friendly message
    const friendlyMessage = getUserFriendlyMessage(errorMessage);
    setError(friendlyMessage);
  }, [setError]);

  return {
    error,
    showError,
    setError,
    clearError,
    handleError,
  };
};

export default useErrorDialog;
