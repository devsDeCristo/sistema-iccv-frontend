import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export const handleResponseThrowError = (
  errorDefaultMessage?: string,
  showToast: boolean = true
) => {
  return (error: AxiosError<any>) => {
    const errorMessage = errorDefaultMessage || error.response?.data.message;

    // 401 não é tratado aqui: quem encerra a sessão é o interceptor de resposta
    // do `apiClient` (src/config/lib/axios/api-client.ts), que age uma única
    // vez mesmo quando várias chamadas da tela falham juntas

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
