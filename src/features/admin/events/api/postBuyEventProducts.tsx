import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { handleResponseThrowError } from '../../../../utils/service';

type PostBuyEventProductsProps = {
  eventId: string;
  userId: string;
  items: { variantId: string; quantity: number }[];
  /**
   * Na oferta logo depois da inscrição: os itens entram no pagamento do
   * ingresso, se ele ainda estiver em aberto. Sem isto, é compra separada.
   */
  attachToRegistration?: boolean;
};

type PostBuyEventProductsResponse = {
  paymentId: string;
  roleRegistrationId: string | null;
  /** virou um pagamento próprio, sem ingresso */
  separatePayment: boolean;
  productsTotal: number;
  amount: number;
};

/**
 * Compra produtos do evento — só para quem tem inscrição confirmada. Vem antes
 * do checkout: é ele que leva os produtos para o link de pagamento, pelo
 * `paymentId` devolvido aqui.
 */
const postBuyEventProducts = ({
  eventId,
  userId,
  items,
  attachToRegistration,
}: PostBuyEventProductsProps) =>
  apiClient
    .post<PostBuyEventProductsResponse>(
      `/events/${eventId}/users/${userId}/products`,
      { items, attachToRegistration }
    )
    .then((response) => response.data)
    .catch(handleResponseThrowError());

type PostBuyEventProductsData = Awaited<
  ReturnType<typeof postBuyEventProducts>
>;

export const usePostBuyEventProducts = (
  options: MutationOptions<
    PostBuyEventProductsData,
    unknown,
    PostBuyEventProductsProps
  > = {}
) => useMutation({ mutationFn: postBuyEventProducts, ...options });
