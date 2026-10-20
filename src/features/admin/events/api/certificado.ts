import { useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';

export const GET_CERTIFICADO = 'GET_CERTIFICADO';
export const GET_PRESENCA = 'GET_PRESENCA';

export type AssinaturaDoCertificado = {
  name: string;
  role: string;
  /** imagem em data URI (PNG ou JPEG), ou nula */
  signature: string | null;
};

export type ConfigDoCertificado = {
  enabled: boolean;
  workload: string | null;
  signers: AssinaturaDoCertificado[];
};

/** Um inscrito na lista de presença */
export type LinhaDaPresenca = {
  userId: string;
  nome: string;
  /** o nome que sai no crachá; nulo quando a pessoa não definiu */
  nomeNoCracha: string | null;
  /** a foto de perfil; nula para quem não tem */
  foto: string | null;
  /** o tipo de inscrição ("Lote 1"); com mais de uma, separados por vírgula */
  tipo: string;
  /** o grupo de cada inscrição, na mesma ordem do `tipo` */
  grupo: string;
  /** "05/02 às 08:12", ou nula para quem não fez check-in */
  chegada: string | null;
};

export const useGetPresenca = (eventId: string) =>
  useQuery({
    queryKey: [GET_PRESENCA, eventId],
    queryFn: () =>
      apiClient
        .get<LinhaDaPresenca[]>(`/events/${eventId}/attendance`)
        .then((resposta) => resposta.data),
    enabled: !!eventId,
  });

/** Evento sem certificado configurado: desligado, ninguém assina */
export const SEM_CERTIFICADO: ConfigDoCertificado = {
  enabled: false,
  workload: null,
  signers: [],
};

/**
 * O que o formulário do evento manda: carga e nomes aparados; desligado, quem
 * ficou sem nome sai (a tela nem mostra os campos, e o servidor recusaria).
 */
export const certificadoParaEnvio = (
  c: ConfigDoCertificado
): ConfigDoCertificado => ({
  enabled: c.enabled,
  workload: c.workload?.trim() || null,
  signers: c.signers
    .map((s) => ({ ...s, name: s.name.trim(), role: s.role.trim() }))
    .filter((s) => c.enabled || s.name.length >= 2),
});

export const useGetCertificado = (eventId: string) =>
  useQuery({
    queryKey: [GET_CERTIFICADO, eventId],
    queryFn: () =>
      apiClient
        .get<ConfigDoCertificado>(`/events/${eventId}/certificate`)
        .then((resposta) => resposta.data),
    enabled: !!eventId,
  });
