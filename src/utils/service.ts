import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export const handleResponseThrowError = (
  errorDefaultMessage?: string,
  showToast: boolean = true
) => {
  return (error: AxiosError<any>) => {
    console.log('AQUIo', error);
    const errorMessage = errorDefaultMessage || error.response?.data.message;

    if (showToast) {
      if (Array.isArray(errorMessage)) {
        errorMessage.map((message) => toast.error(message));
      }

      toast.error(errorMessage);
    }

    throw error;
  };
};

export const handleResponseSuccess = <T>(
  response: T,
  successMessage: string
) => {
  return () => {
    if (successMessage) {
      toast.success(successMessage);
    }
    return response;
  };
};
