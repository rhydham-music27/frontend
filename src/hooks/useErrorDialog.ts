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
    if (lowerError.includes('validation') || lowerError.includes('invalid')) {
      return errorMessage; // Keep validation messages as they're usually user-friendly
    }
    
    // If it's already a user-friendly message (no technical jargon), keep it
    if (!lowerError.includes('error') && !lowerError.includes('failed') && errorMessage.length < 100) {
      return errorMessage;
    }
    
    // Default fallback for unknown errors
    return 'We encountered an unexpected issue. Please try again.';
  };

  const handleError = useCallback((err: any) => {
    let errorMessage = 
      err?.response?.data?.message || 
      err?.response?.data?.error ||
      err?.message || 
      'An unexpected error occurred';
    
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
