// utils/dateUtils.ts

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Format time
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format for datetime-local input
export const formatForDateTimeLocal = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Check if deadline is overdue
export const isOverdue = (deadline: string, status: string): boolean => {
  if (status === 'completed') return false;
  return new Date(deadline) < new Date();
};

// Format deadline for display
export const formatDateForDisplay = (deadline: string): string => {
  if (!deadline) return '';
  const date = new Date(deadline);
  if (isNaN(date.getTime())) return '';
  return `${formatDate(deadline)} at ${formatTime(deadline)}`;
};
