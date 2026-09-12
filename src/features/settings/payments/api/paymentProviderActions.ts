import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { GET_PAYMENT_PROVIDERS, PROVIDER_SLUG } from '../constants';
import {
  GatewayHealth,
  PaymentProviderKey,
  SavePaymentProviderPayload,
} from '../types';

const invalidar = () => queryClient.invalidateQueries(GET_PAYMENT_PROVIDERS);

const rota = (churchId: string, provider: PaymentProviderKey) =>
  `/churches/${churchId}/payment-providers/${PROVIDER_SLUG[provider]}`;

interface AcaoBase {
  churchId: string;
  provider: PaymentProviderKey;
}

// ---------------------------------------------------------------- salvar

type SalvarArgs = AcaoBase & SavePaymentProviderPayload;

const savePaymentProvider = ({ churchId, provider, ...payload }: SalvarArgs) =>
  apiClient
    .put(rota(churchId, provider), payload)
    .then((response) => {
      handleResponseSuccess(response.data, 'Integração salva')();
      return response.data;
    })
    .catch(handleResponseThrowError());

export const useSavePaymentProvider = ({
  onSuccess,
  ...options
}: MutationOptions<unknown, unknown, SalvarArgs> = {}) =>
  useMutation({
    mutationFn: savePaymentProvider,
    onSuccess: (...args) => {
      invalidar();
      onSuccess?.(...args);
    },
    ...options,
  });

// --------------------------------------------------------------- padrão

const setDefaultProvider = ({ churchId, provider }: AcaoBase) =>
  apiClient
    .patch(`${rota(churchId, provider)}/default`)
    .then((response) => {
      handleResponseSuccess(
        response.data,
        'Esta passou a ser a forma de pagamento da igreja'
      )();
      return response.data;
    })
    .catch(handleResponseThrowError());

export const useSetDefaultProvider = ({
  onSuccess,
  ...options
}: MutationOptions<unknown, unknown, AcaoBase> = {}) =>
  useMutation({
    mutationFn: setDefaultProvider,
    onSuccess: (...args) => {
      invalidar();
      onSuccess?.(...args);
    },
    ...options,
  });

// --------------------------------------------------------------- testar

/**
 * Sem toast de sucesso: quem testa quer ler o resultado, e ele aparece no
 * próprio card — inclusive quando o teste diz que a credencial não presta,
 * que é uma resposta bem-sucedida da rota.
 */
const testProvider = ({ churchId, provider }: AcaoBase) =>
  apiClient
    .post<GatewayHealth>(`${rota(churchId, provider)}/test`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());

export const useTestProvider = (
  options: MutationOptions<GatewayHealth, unknown, AcaoBase> = {}
) => useMutation({ mutationFn: testProvider, ...options });

// ------------------------------------------------------- girar o segredo

const rotateWebhookSecret = ({ churchId, provider }: AcaoBase) =>
  apiClient
    .post(`${rota(churchId, provider)}/webhook-secret`)
    .then((response) => {
      handleResponseSuccess(
        response.data,
        'Novo endereço gerado. Cadastre-o no painel do provedor.'
      )();
      return response.data;
    })
    .catch(handleResponseThrowError());

export const useRotateWebhookSecret = ({
  onSuccess,
  ...options
}: MutationOptions<unknown, unknown, AcaoBase> = {}) =>
  useMutation({
    mutationFn: rotateWebhookSecret,
    onSuccess: (...args) => {
      invalidar();
      onSuccess?.(...args);
    },
    ...options,
  });

// -------------------------------------------------------------- remover

const removeProvider = ({ churchId, provider }: AcaoBase) =>
  apiClient
    .delete(rota(churchId, provider))
    .then((response) => {
      handleResponseSuccess(response.data, 'Integração removida')();
      return response.data;
    })
    .catch(handleResponseThrowError());

export const useRemoveProvider = ({
  onSuccess,
  ...options
}: MutationOptions<unknown, unknown, AcaoBase> = {}) =>
  useMutation({
    mutationFn: removeProvider,
    onSuccess: (...args) => {
      invalidar();
      onSuccess?.(...args);
    },
    ...options,
  });
