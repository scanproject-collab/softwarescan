import toast from 'react-hot-toast';
import { showSuccess, showError, handleApiError } from '../utils/errorHandler';

/**
 * Hook for standardized toast notifications
 */
export const useToast = () => {
  return {
    /**
     * Show a success toast
     */
    success: (message: string) => {
      showSuccess(message);
    },

    /**
     * Show an error toast
     */
    error: (message: string) => {
      showError(message);
    },

    /**
     * Handle API error and show toast
     */
    handleError: (error: any, defaultMessage?: string) => {
      return handleApiError(error, defaultMessage);
    },

    /**
     * Show a custom toast with options
     */
    custom: (message: string, options?: any) => {
      return toast(message, options);
    },

    /**
     * Show a loading toast
     */
    loading: (message: string = 'Carregando...') => {
      return toast.loading(message);
    },

    /**
     * Dismiss a toast by id
     */
    dismiss: (id: string) => {
      toast.dismiss(id);
    }
  };
}; 