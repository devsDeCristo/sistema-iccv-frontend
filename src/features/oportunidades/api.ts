import { useMutation, useQuery } from 'react-query';
import { apiClient } from '../../config/lib/axios/api-client';
import { queryClient } from '../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../utils/service';
import {
  DadosDaOportunidade,
  OportunidadeDaIgreja,
  OportunidadeDoMembro,
} from './types';

const GET_ABERTAS = 'GET_OPORTUNIDADES_ABERTAS';
const GET_DA_IGREJA = 'GET_OPORTUNIDADES_DA_IGREJA';

/** As vagas da igreja de que a pessoa é membro: a API decide qual */
export const useOportunidadesAbertas = (enabled: boolean) =>
  useQuery(
    GET_ABERTAS,
    () =>
      apiClient
        .get<OportunidadeDoMembro[]>('/oportunidades')
        .then((response) => response.data),
    { enabled }
  );

export const useInteresse = () =>
  useMutation({
    mutationFn: ({ id, quer }: { id: string; quer: boolean }) =>
      apiClient[quer ? 'post' : 'delete'](`/oportunidades/${id}/interesse`)
        .then((response) =>
          handleResponseSuccess(
            response.data,
            quer ? 'Interesse registrado' : 'Interesse retirado'
          )()
        )
        .catch(handleResponseThrowError()),
    onSuccess: () => queryClient.invalidateQueries(GET_ABERTAS),
  });

export const useOportunidadesDaIgreja = (churchId: string | null) =>
  useQuery(
    [GET_DA_IGREJA, churchId ?? ''],
    () =>
      apiClient
        .get<OportunidadeDaIgreja[]>(`/churches/${churchId}/oportunidades`)
        .then((response) => response.data),
    { enabled: !!churchId, keepPreviousData: true }
  );

/** Sem `id` publica; com `id` edita, encerra ou reabre */
export const useSalvarOportunidade = () =>
  useMutation({
    mutationFn: ({
      churchId,
      id,
      dados,
      aviso,
    }: {
      churchId: string;
      id?: string;
      dados: Partial<DadosDaOportunidade>;
      aviso: string;
    }) =>
      (id
        ? apiClient.put(`/churches/${churchId}/oportunidades/${id}`, dados)
        : apiClient.post(`/churches/${churchId}/oportunidades`, dados)
      )
        .then((response) => handleResponseSuccess(response.data, aviso)())
        .catch(handleResponseThrowError()),
    onSuccess: () => queryClient.invalidateQueries(GET_DA_IGREJA),
  });

export const useExcluirOportunidade = () =>
  useMutation({
    mutationFn: ({ churchId, id }: { churchId: string; id: string }) =>
      apiClient
        .delete(`/churches/${churchId}/oportunidades/${id}`)
        .then((response) =>
          handleResponseSuccess(response.data, 'Oportunidade excluída')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: () => queryClient.invalidateQueries(GET_DA_IGREJA),
  });
