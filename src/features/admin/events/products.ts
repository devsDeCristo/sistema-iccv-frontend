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

/** Um item dentro de uma compra */
export interface ItemDoPedido {
  id: string;
  /** id do produto: é por ele que a tabela acha a foto já carregada do evento */
  produtoId: string;
  produto: string;
  opcao: string;
  quantidade: number;
}

/** Uma linha da aba Produtos: uma compra, com tudo o que veio nela */
export interface PedidoDeProduto {
  /** id do pagamento — a compra é a linha, e cada compra é um pagamento */
  id: string;
  userId: string;
  fullName: string;
  cpf: string;
  email: string;
  profilePhotoUrl?: string;
  itens: ItemDoPedido[];
  /** unidades somadas de todos os itens da compra */
  unidades: number;
  status: PaymentResponse['status'];
  /** comprado fora da inscrição, em pagamento próprio */
  avulsa: boolean;
  /** quando os produtos foram entregues; null é "ainda não" */
  entregueEm: string | null;
}

/** "Camisa (M) ×2" — a mesma frase de `descreverItem`, para o item já agrupado */
export const descreverItemDoPedido = (item: ItemDoPedido) =>
  `${item.produto} (${item.opcao}) ×${item.quantidade}`;

/**
 * As compras de produto do evento, uma por pagamento.
 *
 * Agrupado por compra, e não por item: quem leva duas camisas paga uma vez só,
 * e duas linhas separadas diriam que são dois pedidos com dois status — sendo
 * que o status é um, do pagamento que as carrega.
 *
 * O ingresso não entra e o valor também não: aqui a pergunta é quem comprou o
 * quê, e dinheiro é assunto da aba de pagamentos. Pagamento sem produto nenhum
 * fica de fora da lista.
 */
export function pedidosDeProdutos(
  pagamentos?: PaymentResponse[] | null
): PedidoDeProduto[] {
  if (!Array.isArray(pagamentos)) return [];

  return pagamentos
    .filter((pagamento) => pagamento.productItems?.length)
    .map((pagamento) => {
      const itens = (pagamento.productItems ?? [])
        .map((item) => ({
          id: item.id,
          produtoId: item.variant.product.id,
          produto: item.variant.product.name,
          opcao: item.variant.name,
          quantidade: item.quantity,
        }))
        // dentro da compra, produto e depois opção: é a ordem de quem separa
        .sort(
          (a, b) =>
            a.produto.localeCompare(b.produto, 'pt-BR') ||
            a.opcao.localeCompare(b.opcao, 'pt-BR')
        );

      return {
        id: pagamento.id,
        userId: pagamento.userId,
        fullName: pagamento.fullName,
        cpf: pagamento.cpf,
        email: pagamento.email,
        profilePhotoUrl: pagamento.profilePhotoUrl,
        itens,
        unidades: itens.reduce((soma, item) => soma + item.quantidade, 0),
        status: pagamento.status,
        avulsa: pagamento.purchaseType === 'PRODUCTS',
        entregueEm: pagamento.productsDeliveredAt ?? null,
      };
    })
    .sort((a, b) =>
      (a.fullName ?? '').localeCompare(b.fullName ?? '', 'pt-BR')
    );
}
