import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export const handleResponseThrowError = (
  errorDefaultMessage?: string,
  showToast: boolean = true
) => {
  return (error: AxiosError<any>) => {
    console.log({ error });
    const errorMessage = errorDefaultMessage || error.message;

    if (showToast) {
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
