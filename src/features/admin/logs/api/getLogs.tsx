import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { handleResponseThrowError } from '../../../../utils/service';
import {
  GET_LOGS,
  GET_LOG_OPERATIONS,
  GET_LOGIN_ATTEMPTS,
} from '../constants';

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
  /**
   * A rota que executou a ação, no molde `POST /events/:idEvent/users/:idUser`.
   * Nula no histórico anterior à coluna.
   */
  operation: string | null;
  /**
   * O nome da ação — "Inscrição no evento". A tabela diz o que mudou; isto diz
   * o que a pessoa mandou fazer, e as duas coisas não são a mesma: inscrever,
   * cancelar e chamar da lista de espera mexem nas mesmas tabelas.
   */
  operationLabel: string | null;
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
  /** operação executada, no molde da rota; o catálogo vem de useGetLogOperations */
  operation?: string;
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

/** Uma opção do filtro de operação: a rota e o nome dela */
export type LogOperation = { value: string; label: string };

const getLogOperations = () => {
  return apiClient
    .get<LogOperation[]>('/logs/operations')
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

/**
 * O catálogo de operações vem da API, e não de uma cópia por aqui: a lista
 * muda quando uma rota nasce ou troca de caminho, e duas listas mantidas à mão
 * divergem na primeira vez que alguém esquecer de mexer nas duas.
 */
export const useGetLogOperations = () => {
  return useQuery<LogOperation[]>(
    [GET_LOG_OPERATIONS],
    () => getLogOperations(),
    // não muda enquanto o servidor não for reimplantado
    { staleTime: Infinity }
  );
};

export type LoginAttempt = {
  id: string;
  document: string;
  success: boolean;
  reason: 'USER_NOT_FOUND' | 'WRONG_PASSWORD' | null;
  ip: string | null;
  userAgent: string | null;
  /** o `userAgent` já lido pelo servidor — ver `src/logs/dispositivo.ts` */
  dispositivo?: {
    tipo: 'celular' | 'tablet' | 'computador' | 'desconhecido';
    /** "iPhone · iOS 18.7" — a linha da tabela */
    resumo: string | null;
    aparelho: string | null;
    sistema: string | null;
    /** `null` quando o navegador esconde a versão real */
    versaoDoSistema: string | null;
    navegador: string | null;
    versaoDoNavegador: string | null;
    motor: string | null;
    arquitetura: string | null;
  };
  createdAt: string;
  user: LogPerson | null;
};

export type LoginAttemptsPage = {
  items: LoginAttempt[];
  total: number;
  page: number;
  limit: number;
  summary: { success: number; failure: number };
};

export type GetLoginAttemptsParams = {
  from?: string;
  to?: string;
  userId?: string;
  document?: string;
  success?: boolean;
  page?: number;
  limit?: number;
};

const getLoginAttempts = (params: GetLoginAttemptsParams) =>
  apiClient
    .get<LoginAttemptsPage>('/logs/login-attempts', { params })
    .then((response) => response.data)
    .catch(handleResponseThrowError());

export const useGetLoginAttempts = (
  params: GetLoginAttemptsParams
) =>
  useQuery<Awaited<ReturnType<typeof getLoginAttempts>>>(
    [GET_LOGIN_ATTEMPTS, params],
    () => getLoginAttempts(params),
    { keepPreviousData: true }
  );
