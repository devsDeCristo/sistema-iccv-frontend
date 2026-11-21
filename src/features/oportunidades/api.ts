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
  EtapaDaCandidatura,
  DetalheDaOportunidade,
  OportunidadeDaIgreja,
  OportunidadeDoMembro,
} from './types';

const GET_ABERTAS = 'GET_OPORTUNIDADES_ABERTAS';
const GET_DETALHE = 'GET_OPORTUNIDADE';
const GET_DA_IGREJA = 'GET_OPORTUNIDADES_DA_IGREJA';
const GET_PROPOSTAS = 'GET_MINHAS_PROPOSTAS';

const atualizarMembro = () =>
  Promise.all([
    queryClient.invalidateQueries(GET_ABERTAS),
    queryClient.invalidateQueries(GET_DETALHE),
  ]);
const atualizarPainel = () => queryClient.invalidateQueries(GET_DA_IGREJA);
const atualizarPropostas = () => queryClient.invalidateQueries(GET_PROPOSTAS);

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

/** O caminho de uma vaga na API: pelo painel ou como proposta do membro */
export const caminhoNoPainel = (churchId: string, id: string) =>
  `/churches/${churchId}/oportunidades/${id}`;
export const caminhoDaProposta = (id: string) =>
  `/oportunidades/propostas/${id}`;

/**
 * `File` troca a imagem (com a cor dominante dela, para o crachá); `null`
 * remove. `caminho` é o da vaga (`caminhoNoPainel` ou `caminhoDaProposta`).
 */
export const useImagemDaOportunidade = () =>
  useMutation({
    mutationFn: async ({
      caminho,
      imagem,
    }: {
      caminho: string;
      imagem: File | null;
    }) => {
      const url = `${caminho}/imagem`;
      if (!imagem) return apiClient.delete(url).then((r) => r.data);
      const corpo = new FormData();
      corpo.append('imagem', imagem);
      const cor = await corDaImagem(imagem);
      if (cor) corpo.append('cor', cor);
      return apiClient.put(url, corpo).then((r) => r.data);
    },
    onSuccess: () => Promise.all([atualizarPainel(), atualizarPropostas()]),
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

/** O currículo como arquivo (vem pela API: não há link público) */
export const buscarCurriculo = (caminho: string, userId: string) =>
  apiClient
    .get<Blob>(`${caminho}/interessados/${userId}/curriculo`, {
      responseType: 'blob',
    })
    .then((r) => r.data);

/** A etapa e a anotação de um candidato (o candidato não vê) */
export const useAcompanharCandidatura = () =>
  useMutation({
    mutationFn: ({
      caminho,
      userId,
      etapa,
      nota,
    }: {
      caminho: string;
      userId: string;
      etapa?: EtapaDaCandidatura;
      nota?: string;
    }) =>
      apiClient
        .patch(`${caminho}/interessados/${userId}`, { etapa, nota })
        .then((response) =>
          handleResponseSuccess(
            response.data,
            etapa ? 'Etapa atualizada' : 'Anotação salva'
          )()
        )
        .catch(handleResponseThrowError()),
    onSuccess: () => Promise.all([atualizarPainel(), atualizarPropostas()]),
  });

/**
 * O currículo vem pela API (não há link público): baixa como arquivo.
 * `caminho` é o da vaga (painel ou proposta, para quem propôs).
 */
export const baixarCurriculo = async (
  caminho: string,
  userId: string,
  nome: string
) => {
  FileSaver.saveAs(await buscarCurriculo(caminho, userId), nome);
};

/** O admin aprova ou recusa (com motivo opcional) a proposta de um membro */
export const useDecidirProposta = () =>
  useMutation({
    mutationFn: ({
      churchId,
      id,
      decisao,
      motivo,
    }: {
      churchId: string;
      id: string;
      decisao: 'aprovar' | 'recusar';
      motivo?: string;
    }) =>
      apiClient
        .post<OportunidadeDaIgreja>(
          `${caminhoNoPainel(churchId, id)}/${decisao}`,
          decisao === 'recusar' ? { motivo } : {}
        )
        .then((response) =>
          handleResponseSuccess(
            response.data,
            decisao === 'aprovar'
              ? 'Proposta aprovada: a vaga está no ar'
              : 'Proposta recusada'
          )()
        )
        .catch(handleResponseThrowError()),
    onSuccess: atualizarPainel,
  });

// ---- propostas do membro -----------------------------------------------------

/** As propostas da pessoa na igreja dela (a aprovada vem com os candidatos) */
export const useMinhasPropostas = (enabled: boolean) =>
  useQuery(
    GET_PROPOSTAS,
    () =>
      apiClient
        .get<OportunidadeDaIgreja[]>('/oportunidades/propostas')
        .then((response) => response.data),
    { enabled }
  );

/** Sem `id` propõe; com `id` edita a proposta pendente */
export const useSalvarProposta = () =>
  useMutation({
    mutationFn: ({ id, dados }: { id?: string; dados: DadosDaOportunidade }) =>
      (id
        ? apiClient.put<OportunidadeDaIgreja>(caminhoDaProposta(id), dados)
        : apiClient.post<OportunidadeDaIgreja>(
            '/oportunidades/propostas',
            dados
          )
      )
        .then((response) =>
          handleResponseSuccess(
            response.data,
            id ? 'Proposta salva' : 'Proposta enviada ao admin da igreja'
          )()
        )
        .catch(handleResponseThrowError()),
    onSuccess: atualizarPropostas,
  });

export const useRetirarProposta = () =>
  useMutation({
    mutationFn: (id: string) =>
      apiClient
        .delete(caminhoDaProposta(id))
        .then((response) =>
          handleResponseSuccess(response.data, 'Proposta retirada')()
        )
        .catch(handleResponseThrowError()),
    onSuccess: atualizarPropostas,
  });
