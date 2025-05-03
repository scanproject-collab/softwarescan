import toast from 'react-hot-toast';

/**
 * Interface para opções do toast
 */
interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

/**
 * Hook para exibir notificações toast
 */
export const useToast = () => {
  const defaultOptions: ToastOptions = {
    duration: 5000,
    position: 'top-right',
  };

  /**
   * Exibe um toast de sucesso
   * @param message Mensagem a ser exibida
   * @param options Opções do toast
   */
  const success = (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options });
  };

  /**
   * Exibe um toast de erro
   * @param message Mensagem a ser exibida
   * @param options Opções do toast
   */
  const error = (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, ...options });
  };

  /**
   * Exibe um toast de informação
   * @param message Mensagem a ser exibida
   * @param options Opções do toast
   */
  const info = (message: string, options?: ToastOptions) => {
    toast(message, { ...defaultOptions, ...options });
  };

  /**
   * Exibe um toast de carregamento
   * @param message Mensagem a ser exibida
   * @param options Opções do toast
   * @returns ID do toast para posterior atualização
   */
  const loading = (message: string, options?: ToastOptions) => {
    return toast.loading(message, { ...defaultOptions, ...options });
  };

  /**
   * Atualiza um toast existente
   * @param id ID do toast a ser atualizado
   * @param message Nova mensagem
   * @param type Tipo do toast
   */
  const update = (id: string, message: string, type: 'success' | 'error' | 'loading' | 'info') => {
    toast.dismiss(id);

    switch (type) {
      case 'success':
        success(message);
        break;
      case 'error':
        error(message);
        break;
      case 'loading':
        loading(message);
        break;
      case 'info':
        info(message);
        break;
    }
  };

  /**
   * Remove um toast específico
   * @param id ID do toast a ser removido
   */
  const dismiss = (id: string) => {
    toast.dismiss(id);
  };

  /**
   * Remove todos os toasts
   */
  const dismissAll = () => {
    toast.dismiss();
  };

  return {
    success,
    error,
    info,
    loading,
    update,
    dismiss,
    dismissAll,
  };
}; 