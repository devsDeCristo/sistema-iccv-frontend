import { AxiosError } from 'axios';
import { QueryClient } from 'react-query';

const MAX_RETRIES = 3;

/**
 * Erro de permissão, autenticação ou recurso inexistente não muda ao repetir:
 * repetir só multiplica o toast de erro (o aviso é disparado dentro do fetcher,
 * uma vez por tentativa). Falha de rede e erro 5xx continuam com retry.
 */
function shouldRetry(failureCount: number, error: unknown) {
  const status = (error as AxiosError)?.response?.status;

  if (status && status >= 400 && status < 500) return false;

  return failureCount < MAX_RETRIES;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: shouldRetry,
    },
  },
});

export { queryClient };
