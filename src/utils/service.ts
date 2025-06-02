import { AxiosError } from 'axios';
import { redirect } from 'react-router-dom';
import { toast } from 'react-toastify';

export const handleResponseThrowError = (
  errorDefaultMessage?: string,
  showToast: boolean = true
) => {
  return (error: AxiosError<any>) => {
    const errorMessage = errorDefaultMessage || error.response?.data.message;

    if (error.response?.status === 401) {
      localStorage.clear();
      redirect('/login');
    }

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
  successMessage?: string,
  reactToastify: boolean = true
) => {
  return () => {
    if (successMessage && reactToastify) {
      toast.success(successMessage);
    }

    return response;
  };
};
