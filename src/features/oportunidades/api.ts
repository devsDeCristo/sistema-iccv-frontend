import { useMutation, useQuery } from 'react-query';
import FileSaver from 'file-saver';
import { corDaImagem } from './corDaImagem';
import { apiClient } from '../../config/lib/axios/api-client';
import { queryClient } from '../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../utils/service';
import {
  DadosDaOportunidade,
  DetalheDaOportunidade,
  OportunidadeDaIgreja,
  OportunidadeDoMembro,
} from './types';

const GET_ABERTAS = 'GET_OPORTUNIDADES_ABERTAS';
const GET_DETALHE = 'GET_OPORTUNIDADE';
const GET_DA_IGREJA = 'GET_OPORTUNIDADES_DA_IGREJA';

const atualizarMembro = () =>
  Promise.all([
    queryClient.invalidateQueries(GET_ABERTAS),
    queryClient.invalidateQueries(GET_DETALHE),
  ]);
const atualizarPainel = () => queryClient.invalidateQueries(GET_DA_IGREJA);

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

/** Uma vaga com o formulário, para a página de candidatura */
export const useOportunidade = (id?: string) =>
  useQuery(
    [GET_DETALHE, id],
    () =>
      apiClient
        .get<DetalheDaOportunidade>(`/oportunidades/${id}`)
        .then((response) => response.data),
    { enabled: !!id, retry: false }
  );

/** Respostas por id do campo; o currículo vai como arquivo */
export const useCandidatar = () =>
  useMutation({
    mutationFn: ({
      id,
      respostas,
      curriculo,
    }: {
      id: string;
      respostas: Record<string, unknown>;
      curriculo?: File | null;
    }) => {
      const corpo = new FormData();
      corpo.append('respostas', JSON.stringify(respostas));
      if (curriculo) corpo.append('curriculo', curriculo);
      return apiClient
        .post(`/oportunidades/${id}/interesse`, corpo)
        .then((response) =>
          handleResponseSuccess(response.data, 'Candidatura enviada')()
        )
        .catch(handleResponseThrowError());
    },
    onSuccess: atualizarMembro,
  });

export const useRetirarCandidatura = () =>
  useMutation({
    mutationFn: (id: string) =>
      apiClient
        .delete(`/oportunidades/${id}/interesse`)
        .then((response) =>
          handleResponseSuccess(response.data, 'Candidatura retirada')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: atualizarMembro,
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
        ? apiClient.put<OportunidadeDaIgreja>(
            `/churches/${churchId}/oportunidades/${id}`,
            dados
          )
        : apiClient.post<OportunidadeDaIgreja>(
            `/churches/${churchId}/oportunidades`,
            dados
          )
      )
        .then((response) => handleResponseSuccess(response.data, aviso)())
        .catch(handleResponseThrowError()),
    onSuccess: atualizarPainel,
  });

/** `File` troca a imagem (com a cor dominante dela, para o crachá); `null` remove */
export const useImagemDaOportunidade = () =>
  useMutation({
    mutationFn: async ({
      churchId,
      id,
      imagem,
    }: {
      churchId: string;
      id: string;
      imagem: File | null;
    }) => {
      const url = `/churches/${churchId}/oportunidades/${id}/imagem`;
      if (!imagem) return apiClient.delete(url).then((r) => r.data);
      const corpo = new FormData();
      corpo.append('imagem', imagem);
      const cor = await corDaImagem(imagem);
      if (cor) corpo.append('cor', cor);
      return apiClient.put(url, corpo).then((r) => r.data);
    },
    onSuccess: atualizarPainel,
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
    onSuccess: atualizarPainel,
  });

/** O currículo vem pela API (não há link público): baixa como arquivo */
export const baixarCurriculo = async (
  churchId: string,
  id: string,
  userId: string,
  nome: string
) => {
  const { data } = await apiClient.get<Blob>(
    `/churches/${churchId}/oportunidades/${id}/interessados/${userId}/curriculo`,
    { responseType: 'blob' }
  );
  FileSaver.saveAs(data, nome);
};
