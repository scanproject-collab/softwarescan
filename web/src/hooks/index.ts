/**
 * Re-exporta hooks globais para compatibilidade com código existente
 * 
 * NOTA: Este arquivo serve para fornecer compatibilidade com código existente.
 * Para novos componentes, favor importar diretamente da pasta shared ou da feature específica.
 */

// Re-exportação de hooks de autenticação
export { useAuth } from '../features/auth/hooks/useAuth';

// Re-exportação de hooks de notificações
export { useNotifications } from '../features/notifications/hooks/useNotifications';

// Re-exportação de hooks de operadores
export { usePendingOperators } from '../features/operators/hooks/usePendingOperators';

// Re-exportação de hooks de interações
export { useInteractions } from '../features/interactions/hooks/useInteractions';

// Re-exportação de hooks compartilhados
export { useToast } from '../shared/hooks/useToast'; 