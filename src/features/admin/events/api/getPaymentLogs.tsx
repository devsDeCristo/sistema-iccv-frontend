import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { handleResponseThrowError } from '../../../../utils/service';
import { GET_PAYMENT_LOGS } from '../constants';

/** De onde partiu a mudança. Espelha `PaymentLogSource` no backend. */
export type PaymentLogSource = 'PANEL' | 'WEBHOOK' | 'CRON' | 'SYSTEM';

/** Um campo que mudou, no formato cru que a trilha guarda */
export type PaymentLogChange = { before: unknown; after: unknown };

/**
 * Um passo da cobrança. Uma linha por escrita, e não por comando: a
 * reconciliação mexe em várias cobranças de uma vez e cada uma tem a sua.
 */
export type PaymentLog = {
  id: string;
  createdAt: string;
  paymentId: string | null;
  userId: string | null;
  eventId: string | null;
  /** `Payment` ou `PaymentCheckout` — a cobrança ou o link de pagamento */
  model: string;
  action: string;
  entityId: string | null;
  amountBefore: number | null;
  amountAfter: number | null;
  statusBefore: string | null;
  statusAfter: string | null;
  source: PaymentLogSource;
  actorId: string | null;
  operation: string | null;
  requestId: string | null;
  /** o que mudou, campo a campo */
  changes: Record<string, PaymentLogChange> | null;
  /** quem deve */
  userName: string | null;
  /** quem executou; nulo no retorno do gateway e na rotina automática */
  actorName: string | null;
};

export type PaymentLogsPage = {
  items: PaymentLog[];
  total: number;
  page: number;
  limit: number;
};

export type GetPaymentLogsParams = {
  eventId: string;
  /** uma cobrança específica; ausente, traz a do evento inteiro */
  paymentId?: string;
  userId?: string;
  source?: PaymentLogSource;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

const getPaymentLogs = ({ eventId, ...params }: GetPaymentLogsParams) => {
  return apiClient
    .get<PaymentLogsPage>(`/events/${eventId}/payments/logs`, { params })
    .then((response) => response.data)
    .catch(handleResponseThrowError());
};

type GetPaymentLogsData = Awaited<ReturnType<typeof getPaymentLogs>>;

export const useGetPaymentLogs = (
  params: GetPaymentLogsParams,
  options: Omit<
    UseQueryOptions<GetPaymentLogsData, unknown, GetPaymentLogsData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery<GetPaymentLogsData>(
    [GET_PAYMENT_LOGS, params],
    () => getPaymentLogs(params),
    options
  );
};
