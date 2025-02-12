import { format } from 'date-fns';

export const formatAsDate = (date: string) => {
  const dateObject = new Date(date);
  return format(dateObject, 'yyyy-MM-dd');
};

export const formatAsDateWithTime = (date: string) => {
  const dateObject = new Date(date);
  return format(dateObject, 'MM/dd/yyyy HH:mm a');
};

export const formatAsTimeMinutes = (date: string) => {
  const dateObject = new Date(date);
  return format(dateObject, 'HH:mm a');
};

export const formatAsTimeSeconds = (date: string) => {
  const dateObject = new Date(date);
  return format(dateObject, 'HH:mm:ss a');
};