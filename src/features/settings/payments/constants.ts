export const GET_PAYMENT_PROVIDERS = 'GET_PAYMENT_PROVIDERS';

/**
 * O apelido de cada casa na URL da API. Espelha `src/gateways/core/provider-slug.ts`
 * no backend — é o mesmo apelido que aparece na URL de notificação, e é por
 * isso que ele não segue o valor do enum em minúsculas.
 */
export const PROVIDER_SLUG: Record<string, string> = {
  PAGBANK: 'pagbank',
  MERCADO_PAGO: 'mercadopago',
  INFINITEPAY: 'infinitepay',
  TON: 'ton',
};
