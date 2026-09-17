import { PaymentResponse } from '../../../types/user';
import { EventProduct, PaymentProductItem } from './types';

/**
 * Mesmo teto do servidor, em caracteres da data URL. A foto reduzida fica bem
 * abaixo disto; a conferência aqui só evita subir o formulário inteiro para
 * ouvir o erro de volta.
 */
export const TAMANHO_MAXIMO_DA_FOTO = 700_000;

/** Unidades de uma variante num pedido — o servidor recusa acima disso. */
export const QUANTIDADE_MAXIMA_POR_ITEM = 20;

export const produtoVazio = (): EventProduct => ({
  name: '',
  description: '',
  price: null as unknown as number,
  image: null,
  // nasce com uma variante porque a compra aponta para uma: produto sem escolha
  // (uma caneca) fica com essa única
  variants: [{ name: '', stock: null }],
});

/**
 * Produtos do formulário → corpo da API. Tira `sold` e `available`, que são só
 * leitura: o servidor valida com `forbidNonWhitelisted` e recusaria o evento
 * inteiro por causa deles.
 */
export function produtosParaEnvio(produtos: EventProduct[] = []) {
  return produtos.map(({ variants, ...produto }) => ({
    ...(produto.id && { id: produto.id }),
    name: produto.name.trim(),
    description: produto.description?.trim() || null,
    price: produto.price,
    image: produto.image || null,
    variants: variants.map(({ id, name, stock }) => ({
      ...(id && { id }),
      name: name.trim(),
      stock: stock ?? null,
    })),
  }));
}

/** Produtos do evento → valores iniciais do formulário de edição */
export function produtosParaFormulario(produtos: EventProduct[] = []) {
  return produtos.map((produto) => ({
    ...produto,
    description: produto.description ?? '',
    image: produto.image ?? null,
    variants: produto.variants.map((variante) => ({
      id: variante.id,
      name: variante.name,
      stock: variante.stock ?? null,
      sold: variante.sold ?? 0,
      available: variante.available ?? null,
    })),
  }));
}

/** Variante que ainda pode ser comprada */
export const temDisponivel = (available?: number | null) =>
  available === null || available === undefined || available > 0;

/** "Camisa (M) ×2" — o resumo de uma linha de compra */
export const descreverItem = (item: PaymentProductItem) =>
  `${item.variant.product.name} (${item.variant.name}) ×${item.quantity}`;

/** Aba do painel de pagamentos com as compras de produto feitas fora da inscrição */
export const ABA_COMPRAS_DE_PRODUTOS = 'Produtos Avulsos';

/**
 * O que um pagamento comprou, uma linha por item — com o ingresso listado
 * como item também. Assim a inscrição com camisa e a compra avulsa de camisa
 * se leem do mesmo jeito na tabela.
 */
export function itensDoPagamento(pagamento: PaymentResponse): string[] {
  const ingresso =
    pagamento.purchaseType !== 'PRODUCTS' && pagamento.groupName
      ? [
          `Ingresso ${pagamento.groupName}${
            pagamento.roleName ? ` — ${pagamento.roleName}` : ''
          }`,
        ]
      : [];

  return [...ingresso, ...(pagamento.productItems ?? []).map(descreverItem)];
}
