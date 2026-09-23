import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_PAYMENTS_EVENT } from '../constants';

type PatchProductsDeliveryProps = {
  paymentId: string;
  /** true registra a entrega; false desfaz o registro */
  delivered: boolean;
};

const patchProductsDelivery = ({
  paymentId,
  delivered,
}: PatchProductsDeliveryProps) =>
  apiClient
    .patch(`/payments/${paymentId}/products-delivery`, { delivered })
    .then((response) => {
      handleResponseSuccess(
        response.data,
        delivered ? 'Entrega registrada!' : 'Registro de entrega desfeito.'
      )();
      return response.data;
    })
    .catch(handleResponseThrowError());

type PatchProductsDeliveryData = Awaited<
  ReturnType<typeof patchProductsDelivery>
>;

export const usePatchProductsDelivery = ({
  onSuccess,
  ...options
}: MutationOptions<
  PatchProductsDeliveryData,
  unknown,
  PatchProductsDeliveryProps
> = {}) => {
  return useMutation({
    mutationFn: patchProductsDelivery,
    onSuccess: (...args) => {
      // a lista de pagamentos é a mesma fonte da aba Produtos
      queryClient.invalidateQueries(GET_PAYMENTS_EVENT);
      onSuccess?.(...args);
    },
    ...options,
  });
};
