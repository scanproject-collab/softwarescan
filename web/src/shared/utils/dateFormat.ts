import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Format a date string into a readable format
 * @param dateString - The date string to format
 * @param formatString - The format string to use (defaults to 'dd/MM/yyyy')
 * @returns The formatted date string
 */
export function formatDate(dateString: string, formatString: string = 'dd/MM/yyyy'): string {
  try {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatString, { locale: ptBR });
  } catch (error) {
    console.error(`Error formatting date: ${dateString}`, error);
    return dateString;
  }
}

/**
 * Format a date string into a readable format with time
 * @param dateString - The date string to format
 * @returns The formatted date string with time
 */
export function formatDateTime(dateString: string): string {
  return formatDate(dateString, 'dd/MM/yyyy HH:mm');
}

/**
 * Format a date string into a readable format with relative time
 * @param dateString - The date string to format
 * @returns The formatted date string with relative time
 */
export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString);
  const now = new Date();

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Agora mesmo';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'} atrás`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'} atrás`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'} atrás`;
  }

  return formatDate(dateString);
} 