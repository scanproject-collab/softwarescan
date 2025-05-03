/**
 * Interface para notificação
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  type: NotificationType;
  metadata?: Record<string, any>;
}

/**
 * Enum para tipos de notificação
 */
export enum NotificationType {
  SYSTEM = 'SYSTEM',
  INTERACTION = 'INTERACTION',
  OPERATOR = 'OPERATOR',
  TAG = 'TAG',
  INSTITUTION = 'INSTITUTION',
}

/**
 * Interface para criação de notificação
 */
export interface CreateNotificationDto {
  title: string;
  message: string;
  userId: string;
  type: NotificationType;
  metadata?: Record<string, any>;
} 