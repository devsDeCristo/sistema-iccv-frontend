import { PaymentResponse } from '../../../types/user';
import { EventProduct, PaymentProductItem } from './types';

/**
 * Mesmo teto do servidor, em caracteres da data URL. A foto reduzida fica bem
 * abaixo disto; a conferência aqui só evita subir o formulário inteiro para
 * ouvir o erro de volta.
 */
export const TAMANHO_MAXIMO_DA_FOTO = 700_000;

/** Fotos por produto, como no servidor; a primeira é a capa */
export const MAXIMO_DE_FOTOS = 5;

/** A capa do produto: a primeira foto, ou nenhuma */
export const capaDoProduto = (produto: { images?: string[] | null }) =>
  produto.images?.[0] ?? null;

/** Unidades de uma variante num pedido — o servidor recusa acima disso. */
export const QUANTIDADE_MAXIMA_POR_ITEM = 20;

export const produtoVazio = (): EventProduct => ({
  name: '',
  description: '',
  price: null as unknown as number,
  images: [],
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
    images: produto.images ?? [],
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
    images: produto.images ?? [],
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

/** Uma variante e quantas peças dela foram vendidas */
export interface ResumoDeVariante {
  opcao: string;
  unidades: number;
}

/**
 * Um produto na régua de métricas.
 *
 * As três contagens são em **peças**, e não em compras: a pergunta desta aba é
 * quantas unidades separar e quantas ainda faltam entregar. Elas somam
 * `unidades` — todo item cai em exatamente uma delas.
 */
export interface ResumoDeProduto {
  produtoId: string;
  produto: string;
  unidades: number;
  entregues: number;
  /** pagas e ainda não entregues — o que há para separar hoje */
  aEntregar: number;
  /** pagamento ainda não confirmado; não se entrega antes disso */
  pendentes: number;
  variantes: ResumoDeVariante[];
}

/** O que as métricas da aba Produtos mostram */
export interface ResumoDeProdutos {
  /** compras, não peças: uma compra com três camisas conta uma vez */
  pedidos: number;
  unidades: number;
  /** compras com pagamento ainda não confirmado */
  pagamentosPendentes: number;
  /** compras pagas e ainda não entregues */
  aEntregar: number;
  entregues: number;
  porProduto: ResumoDeProduto[];
}

/**
 * As contagens da aba Produtos, a partir das mesmas compras que a tabela lista.
 *
 * Sem filtro de propósito: buscar ou filtrar não muda quantas camisas o evento
 * vendeu, e um resumo que dança conforme a busca seria lido como se o total
 * tivesse mudado — a mesma escolha da régua de dinheiro na aba de pagamentos.
 *
 * Os produtos saem ordenados do mais vendido para o menos: numa lista longa, o
 * que ocupa a primeira tela passa a ser o que mais pesa na separação.
 */
export function resumoDeProdutos(pedidos: PedidoDeProduto[]): ResumoDeProdutos {
  const porProduto = new Map<string, ResumoDeProduto>();
  const variantesPorProduto = new Map<string, Map<string, number>>();

  for (const pedido of pedidos) {
    const pago = pedido.status === 'PAID';
    const entregue = !!pedido.entregueEm;

    for (const item of pedido.itens) {
      const atual = porProduto.get(item.produtoId) ?? {
        produtoId: item.produtoId,
        produto: item.produto,
        unidades: 0,
        entregues: 0,
        aEntregar: 0,
        pendentes: 0,
        variantes: [],
      };

      atual.unidades += item.quantidade;

      if (entregue) atual.entregues += item.quantidade;
      else if (pago) atual.aEntregar += item.quantidade;
      else atual.pendentes += item.quantidade;

      porProduto.set(item.produtoId, atual);

      const variantes =
        variantesPorProduto.get(item.produtoId) ?? new Map<string, number>();
      variantes.set(
        item.opcao,
        (variantes.get(item.opcao) ?? 0) + item.quantidade
      );
      variantesPorProduto.set(item.produtoId, variantes);
    }
  }

  for (const [produtoId, resumo] of porProduto) {
    resumo.variantes = [...(variantesPorProduto.get(produtoId) ?? new Map())]
      .map(([opcao, unidades]) => ({ opcao, unidades }))
      .sort((a, b) => a.opcao.localeCompare(b.opcao, 'pt-BR'));
  }

  return {
    pedidos: pedidos.length,
    unidades: pedidos.reduce((soma, pedido) => soma + pedido.unidades, 0),
    pagamentosPendentes: pedidos.filter((pedido) => pedido.status !== 'PAID')
      .length,
    aEntregar: pedidos.filter(
      (pedido) => pedido.status === 'PAID' && !pedido.entregueEm
    ).length,
    entregues: pedidos.filter((pedido) => !!pedido.entregueEm).length,
    porProduto: [...porProduto.values()].sort(
      (a, b) =>
        b.unidades - a.unidades || a.produto.localeCompare(b.produto, 'pt-BR')
    ),
  };
}
