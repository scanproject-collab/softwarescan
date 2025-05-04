import { toast } from 'react-hot-toast';

interface ErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  data?: {
    message?: string;
    error?: string;
  };
}

/**
 * Handles API errors consistently across the application
 * Extracts friendly error messages without exposing sensitive backend details
 */
export const handleApiError = (error: any, defaultMessage = 'Ocorreu um erro. Por favor, tente novamente.'): string => {
  console.error('API Error:', error);

  if (!error) {
    toast.error(defaultMessage);
    return defaultMessage;
  }

  // Extract the error response
  const errorResponse = error.response?.data as ErrorResponse | undefined;

  // Handle different error scenarios
  if (error.message === 'Network Error') {
    const message = 'Erro de conexão. Verifique sua internet e tente novamente.';
    toast.error(message);
    return message;
  }

  // Extract the most user-friendly message
  let errorMessage = errorResponse?.message ||
    errorResponse?.error ||
    errorResponse?.data?.message ||
    error.message ||
    defaultMessage;

  // Filter out sensitive information
  if (errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('stack trace') ||
    errorMessage.includes('SQL syntax') ||
    errorMessage.includes('prisma')) {
    errorMessage = defaultMessage;
  }

  // Handle specific HTTP status codes
  if (error.response?.status === 401) {
    errorMessage = 'Sessão expirada ou não autorizada. Faça login novamente.';
  } else if (error.response?.status === 403) {
    errorMessage = 'Você não tem permissão para realizar esta ação.';
  } else if (error.response?.status === 404) {
    errorMessage = 'O recurso solicitado não foi encontrado.';
  } else if (error.response?.status === 500) {
    errorMessage = 'Erro no servidor. Por favor, tente novamente mais tarde.';
  }

  toast.error(errorMessage);
  return errorMessage;
};

/**
 * Shows a success toast message
 */
export const showSuccess = (message: string): void => {
  toast.success(message);
};

/**
 * Shows an error toast message
 */
export const showError = (message: string): void => {
  toast.error(message);
}; 