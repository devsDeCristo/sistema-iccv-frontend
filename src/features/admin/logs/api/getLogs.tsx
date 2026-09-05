import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { handleResponseThrowError } from '../../../../utils/service';
import { GET_LOGS } from '../constants';

export type LogChange = {
  field: string;
  label: string;
  before: string;
  after: string;
};

export type LogPerson = {
  id: string;
  name: string;
  photoUrl: string | null;
};

/** Uma escrita: a ação toca em várias tabelas e cada uma vira uma destas */
export type LogEntry = {
  id: string;
  createdAt: string;
  /** nome de quem executou, ou "Sistema" nas rotas públicas */
  actorName: string;
  actorPhotoUrl: string | null;
  /** quem recebeu a ação; vazio quando o registro não é sobre pessoas */
  targets: LogPerson[];
  action: string;
  actionLabel: string;
  model: string;
  modelLabel: string;
  changes: LogChange[];
  /** save que não mexeu em nada: a ação vem rotulada como "Salvou sem alterar" */
  noChanges: boolean;
};

/**
 * Uma ação do painel, com as escritas que ela gerou. Inscrever alguém mexe em
 * inscrição, tipo de inscrição e pagamento — na tela isso é uma linha só.
 */
export type LogAction = LogEntry & {
  /** quantas tabelas diferentes a ação tocou */
  tablesCount: number;
  /** quantas escritas ao todo, contando repetições na mesma tabela */
  entriesCount: number;
  entries: LogEntry[];
};

export type LogsPage = {
  items: LogAction[];
  total: number;
  page: number;
  limit: number;
  /** contagem por família de ação, no mesmo filtro da listagem */
  summary: { created: number; updated: number; deleted: number };
};

export type GetLogsParams = {
  /** início da janela, ISO. Ausente, a API usa as últimas 24 horas */
  from?: string;
  to?: string;
  /** envolvido: traz o que a pessoa fez e o que fizeram com ela */
  userId?: string;
  model?: string;
  action?: string;
  page?: number;
  limit?: number;
};

const getLogs = (params: GetLogsParams) => {
  return apiClient
    .get<LogsPage>('/logs', { params })
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

type GetLogsData = Awaited<ReturnType<typeof getLogs>>;

export const useGetLogs = (
  params: GetLogsParams,
  options: Omit<
    UseQueryOptions<GetLogsData, unknown, GetLogsData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery<GetLogsData>(
    [GET_LOGS, params],
    () => getLogs(params),
    // a paginação é do servidor: sem isto a tabela pisca a cada página
    { keepPreviousData: true, ...options }
  );
};
