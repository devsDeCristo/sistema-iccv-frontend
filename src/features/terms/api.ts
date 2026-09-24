import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../../config/lib/axios/api-client';
import { queryClient } from '../../config/lib/react-query/query-client';

export const GET_TERMS = 'GET_TERMS';
export const GET_TERMS_VERSIONS = 'GET_TERMS_VERSIONS';
export const GET_TERMS_STATUS = 'GET_TERMS_STATUS';

/** O texto vigente, como a página pública mostra */
export interface TermosPublicados {
  version: string;
  /** HTML do editor — passe por `prepararTermos` antes de mostrar */
  content: string;
  summary: string[];
  publishedAt: string;
}

/** Uma versão do histórico, na tela de Configurações */
export interface VersaoDosTermos extends TermosPublicados {
  id: string;
  requiresAcceptance: boolean;
  publishedBy: { id: string; fullName: string } | null;
  acceptances: number;
}

export interface PublicarTermos {
  content: string;
  summary: string[];
  requiresAcceptance: boolean;
}

/** Pública: abre sem login */
export const useGetTerms = () =>
  useQuery([GET_TERMS], () =>
    apiClient.get<TermosPublicados>('/terms').then((resposta) => resposta.data)
  );

export const useGetTermsVersions = () =>
  useQuery([GET_TERMS_VERSIONS], () =>
    apiClient
      .get<VersaoDosTermos[]>('/terms/versions')
      .then((resposta) => resposta.data)
  );

export const usePublishTerms = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) =>
  useMutation({
    mutationFn: (dados: PublicarTermos) =>
      apiClient
        .post<{ version: string }>('/terms/versions', dados)
        .then((resposta) => resposta.data),
    onSuccess: () => {
      queryClient.invalidateQueries(GET_TERMS);
      queryClient.invalidateQueries(GET_TERMS_VERSIONS);
      // mudança relevante vale para quem publicou também: o aviso reaparece
      queryClient.invalidateQueries(GET_TERMS_STATUS);
      onSuccess?.();
    },
  });
