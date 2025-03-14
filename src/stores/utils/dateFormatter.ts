import { format } from 'date-fns';

export const formatAsDate = (date: string) => {
  if (!date) return 'No date';

  const dateObject = new Date(date);
  return format(dateObject, 'yyyy-MM-dd');
};

export const formatAsDateWithTime = (date: string) => {
  if (!date) return 'No date';

  const dateObject = new Date(date);
  return format(dateObject, 'MM/dd/yyyy HH:mm a');
};

export const formatAsTimeMinutes = (date: string) => {
  if (!date) return 'No date';

  const dateObject = new Date(date);
  return format(dateObject, 'HH:mm a');
};

export const formatAsTimeSeconds = (date: string) => {
  if (!date) return 'No date';

  const dateObject = new Date(date);
  return format(dateObject, 'HH:mm:ss a');
};