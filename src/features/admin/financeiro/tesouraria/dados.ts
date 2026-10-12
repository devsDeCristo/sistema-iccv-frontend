/**
 * Tesourarias de eventos e de congregações — MVP com dados de exemplo.
 *
 * O modelo é o de uma conta por tesouraria: a tesouraria de Eventos tem a sua
 * conta no banco, e a de Congregações a dela. O extrato chega pelo Pluggy e
 * fica salvo, e cada movimento é distribuído para a tesouraria do evento (ou
 * da congregação) a que pertence. Ninguém lança à mão para depois conciliar:
 * o banco é a fonte.
 *
 * ponytail: tudo aqui é mock, guardado em memória — o que se cria ou
 * distribui some ao recarregar a página. Quando virar dado de verdade, este
 * arquivo vira o `api.ts` (hooks) e as contas passam para o servidor.
 */
import { Dizimista } from '../types';

export type TipoDoLancamento = 'INCOME' | 'EXPENSE';
/** De onde veio o lançamento: das inscrições pagas no sistema ou da conta */
export type OrigemNaTesouraria = 'INSCRICOES' | 'BANCO';

export interface EventoDoSistema {
  id: string;
  nome: string;
  periodo: string;
}

export interface TesourariaDeEvento {
  id: string;
  nome: string;
  /** O evento do sistema; nulo é evento fora do sistema (um jantar, uma rifa) */
  eventoId: string | null;
  periodo: string;
  situacao: 'ABERTA' | 'ENCERRADA';
}

export interface LancamentoDaTesouraria {
  id: string;
  tesourariaId: string;
  tipo: TipoDoLancamento;
  categoria: string;
  descricao: string;
  valor: number;
  /** "2026-10-03" */
  data: string;
  origem: OrigemNaTesouraria;
}

export const ROTULO_DA_ORIGEM: Record<OrigemNaTesouraria, string> = {
  INSCRICOES: 'Pagamentos das inscrições',
  BANCO: 'Extrato da conta',
};

/** Os eventos cadastrados na igreja, para ligar uma tesouraria a um deles */
export const EVENTOS_DO_SISTEMA: EventoDoSistema[] = [
  {
    id: 'ev-retiro-2027',
    nome: 'Retiro de Carnaval 2027',
    periodo: '13 a 16/02/2027',
  },
  {
    id: 'ev-casais-2026',
    nome: 'Encontro de Casais 2026',
    periodo: '19 e 20/09/2026',
  },
  {
    id: 'ev-cursilho-48',
    nome: 'Cursilho Masculino nº 48',
    periodo: '07 a 10/08/2026',
  },
  {
    id: 'ev-cursilho-f31',
    nome: 'Cursilho Feminino nº 31',
    periodo: '06 a 09/11/2026',
  },
  {
    id: 'ev-jovens-2027',
    nome: 'Acampamento de Jovens 2027',
    periodo: '10 a 12/07/2027',
  },
];

/**
 * Só existe tesouraria de evento que alguém criou: o evento cadastrado no
 * sistema não ganha uma sozinho.
 */
const tesourarias: TesourariaDeEvento[] = [
  {
    id: 'retiro-carnaval-2027',
    nome: 'Retiro de Carnaval 2027',
    eventoId: 'ev-retiro-2027',
    periodo: '13 a 16/02/2027',
    situacao: 'ABERTA',
  },
  {
    id: 'encontro-casais-2026',
    nome: 'Encontro de Casais 2026',
    eventoId: 'ev-casais-2026',
    periodo: '19 e 20/09/2026',
    situacao: 'ENCERRADA',
  },
  {
    id: 'jantar-equipe-2026',
    nome: 'Jantar de confraternização da equipe',
    eventoId: null,
    periodo: '26/09/2026',
    situacao: 'ENCERRADA',
  },
  {
    id: 'cursilho-48',
    nome: 'Cursilho Masculino nº 48',
    eventoId: 'ev-cursilho-48',
    periodo: '07 a 10/08/2026',
    situacao: 'ENCERRADA',
  },
];

export const listarTesourarias = () => [...tesourarias];

export const buscarTesouraria = (id?: string) =>
  tesourarias.find((t) => t.id === id) ?? null;

export function criarTesouraria(
  dados: Pick<TesourariaDeEvento, 'nome' | 'eventoId' | 'periodo'>
) {
  const nova: TesourariaDeEvento = {
    ...dados,
    id: `nova-${Date.now()}`,
    situacao: 'ABERTA',
  };
  tesourarias.unshift(nova);
  return nova;
}

// ---- as contas de Eventos e de Congregações --------------------------------------

/** As tesourarias que têm conta própria e distribuem o extrato */
export type ContaDaTesouraria = 'EVENTOS' | 'CONGREGACOES';

export const NOME_DA_CONTA: Record<ContaDaTesouraria, string> = {
  EVENTOS: 'Sicredi · Conta de eventos',
  CONGREGACOES: 'Cora · Conta das congregações',
};

/** Um movimento da conta, como o Pluggy trouxe e ficou salvo */
export interface MovimentoDaConta {
  id: string;
  conta: ContaDaTesouraria;
  tipo: TipoDoLancamento;
  descricao: string;
  /** Quem pagou, quando o banco diz */
  pagador: string | null;
  valor: number;
  /** "2026-10-03" */
  data: string;
  /** A tesouraria para onde foi; nulo é "a distribuir" */
  tesourariaId: string | null;
  /** Nula até alguém classificar: aparece como "Sem categoria" */
  categoria: string | null;
}

export const SEM_CATEGORIA = 'Sem categoria';

export const DIZIMOS = 'Dízimos';

/** As categorias que um movimento distribuído pode receber */
const CATEGORIAS_DO_EVENTO: Record<TipoDoLancamento, string[]> = {
  INCOME: [
    'Ingressos',
    'Loja do evento',
    'Convites',
    'Doações',
    'Patrocínio',
    'Outras entradas',
  ],
  EXPENSE: [
    'Hospedagem',
    'Alimentação',
    'Transporte',
    'Materiais',
    'Som e decoração',
    'Outras saídas',
  ],
};

export const CATEGORIAS: Record<
  ContaDaTesouraria,
  Record<TipoDoLancamento, string[]>
> = {
  EVENTOS: CATEGORIAS_DO_EVENTO,
  CONGREGACOES: {
    INCOME: [DIZIMOS, 'Ofertas', 'Campanhas', 'Doações', 'Outras entradas'],
    EXPENSE: [
      'Aluguel',
      'Água e luz',
      'Manutenção',
      'Limpeza',
      'Ação social',
      'Outras saídas',
    ],
  },
};

type Movimento = [
  TipoDoLancamento,
  string,
  number,
  string,
  string | null,
  string | null,
];

/** tesouraria (nula: a distribuir) → [tipo, descrição, valor, data, categoria, pagador] */
const MOVIMENTOS: [string | null, Movimento[]][] = [
  [
    'retiro-carnaval-2027',
    [
      [
        'EXPENSE',
        'Pix enviado — Sítio Recanto Verde (sinal)',
        5000,
        '2026-09-15',
        'Hospedagem',
        null,
      ],
    ],
  ],
  [
    'encontro-casais-2026',
    [
      [
        'EXPENSE',
        'Pix enviado — Hotel Fazenda Serra Azul (sinal)',
        4000,
        '2026-07-28',
        'Hospedagem',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Hotel Fazenda Serra Azul',
        4800,
        '2026-09-18',
        'Hospedagem',
        null,
      ],
      [
        'EXPENSE',
        'Boleto — Buffet Sabor & Arte',
        1650,
        '2026-09-19',
        'Alimentação',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Malharia Fiel (50 camisas)',
        1250,
        '2026-08-30',
        'Materiais',
        null,
      ],
      [
        'EXPENSE',
        'Cartão — Papelaria Central',
        640,
        '2026-09-12',
        'Materiais',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Som e Luz Eventos',
        900,
        '2026-09-19',
        'Som e decoração',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Transportes Rota Sul',
        380,
        '2026-09-19',
        'Transporte',
        null,
      ],
    ],
  ],
  [
    'jantar-equipe-2026',
    [
      [
        'INCOME',
        'Pix recebido',
        300,
        '2026-09-22',
        'Doações',
        'Família Mendes',
      ],
      [
        'EXPENSE',
        'Cartão — Restaurante Sabor da Terra',
        1480,
        '2026-09-26',
        'Alimentação',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Floricultura Bela Flor',
        210,
        '2026-09-25',
        null,
        null,
      ],
    ],
  ],
  [
    'cursilho-48',
    [
      [
        'INCOME',
        'Pix recebido',
        1200,
        '2026-07-02',
        'Doações',
        'Paróquia São Pedro',
      ],
      [
        'INCOME',
        'Pix recebido',
        800,
        '2026-07-20',
        'Patrocínio',
        'Mercado Bom Preço',
      ],
      [
        'EXPENSE',
        'Pix enviado — Casa de Retiros São José',
        7200,
        '2026-08-10',
        'Hospedagem',
        null,
      ],
      ['EXPENSE', 'Cartão — Atacadão', 2380, '2026-08-05', 'Alimentação', null],
      [
        'EXPENSE',
        'Pix enviado — Padaria Pão Nosso',
        460,
        '2026-08-08',
        'Alimentação',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Viação Litoral (fretamento)',
        1700,
        '2026-08-07',
        'Transporte',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Gráfica Rápida',
        520,
        '2026-07-30',
        'Materiais',
        null,
      ],
      [
        'EXPENSE',
        'Pix enviado — Som e Luz Eventos',
        450,
        '2026-08-07',
        'Som e decoração',
        null,
      ],
    ],
  ],
  [
    null,
    [
      [
        'EXPENSE',
        'Pix enviado — Casa de Retiros São José (caução)',
        1500,
        '2026-10-09',
        null,
        null,
      ],
      ['INCOME', 'Pix recebido', 190, '2026-10-08', null, 'Carla Menezes'],
      ['INCOME', 'Pix recebido', 450, '2026-10-02', null, 'Grupo de Jovens'],
      ['INCOME', 'Depósito em dinheiro', 1240, '2026-09-22', null, null],
      [
        'INCOME',
        'Pix recebido',
        1520,
        '2026-09-21',
        null,
        'Tesoureira do jantar',
      ],
      ['INCOME', 'Depósito em dinheiro', 1050, '2026-09-11', null, null],
      [
        'EXPENSE',
        'Pix enviado — Gráfica Rápida',
        280,
        '2026-09-06',
        null,
        null,
      ],
      ['INCOME', 'Depósito em dinheiro', 1560, '2026-08-03', null, null],
    ],
  ],
];

const EXTRATO: MovimentoDaConta[] = MOVIMENTOS.flatMap(
  ([tesourariaId, linhas]) =>
    linhas.map(([tipo, descricao, valor, data, categoria, pagador], i) => ({
      id: `mov-${tesourariaId ?? 'livre'}-${i}`,
      conta: 'EVENTOS' as const,
      tipo,
      descricao,
      pagador,
      valor,
      data,
      tesourariaId,
      categoria,
    }))
);

/** Entradas menos saídas */
export const saldoDe = (movimentos: MovimentoDaConta[]) =>
  movimentos.reduce(
    (soma, m) => soma + (m.tipo === 'INCOME' ? m.valor : -m.valor),
    0
  );

const maisRecentes = (a: MovimentoDaConta, b: MovimentoDaConta) =>
  b.data.localeCompare(a.data);

/** O que está na conta e ainda não foi para nenhuma tesouraria */
export const aDistribuir = (conta: ContaDaTesouraria) =>
  EXTRATO.filter((m) => m.conta === conta && !m.tesourariaId).sort(
    maisRecentes
  );

export const movimentosDa = (tesourariaId: string) =>
  EXTRATO.filter((m) => m.tesourariaId === tesourariaId).sort(maisRecentes);

/**
 * Traz movimentos a distribuir para a tesouraria. Entram sem categoria, a não
 * ser que `categoriaDe` reconheça uma (o dízimo de um membro, por exemplo).
 */
export function distribuir(
  ids: string[],
  tesourariaId: string,
  categoriaDe: (m: MovimentoDaConta) => string | null = () => null
) {
  for (const m of EXTRATO) {
    if (!ids.includes(m.id) || m.tesourariaId) continue;
    m.tesourariaId = tesourariaId;
    m.categoria = categoriaDe(m);
  }
}

/** Devolve o movimento para a distribuir */
export function devolver(id: string) {
  const m = EXTRATO.find((x) => x.id === id);
  if (!m) return;
  m.tesourariaId = null;
  m.categoria = null;
}

export function classificar(id: string, categoria: string) {
  const m = EXTRATO.find((x) => x.id === id);
  if (m) m.categoria = categoria;
}

// ---- os ingressos, que vêm das inscrições pagas no sistema ---------------------

type Ingresso = [string, string, number, string];

const INGRESSOS: Record<string, Ingresso[]> = {
  'retiro-carnaval-2027': [
    ['Ingressos', 'Ingressos — 1º lote (41 inscrições)', 7790, '2026-09-30'],
    [
      'Ingressos',
      'Ingressos — 2º lote, parcial (17 inscrições)',
      3740,
      '2026-10-10',
    ],
    ['Loja do evento', 'Camisas — pré-venda (23 un.)', 1035, '2026-10-05'],
  ],
  'encontro-casais-2026': [
    ['Ingressos', 'Ingressos — 1º lote (18 casais)', 5400, '2026-07-20'],
    ['Ingressos', 'Ingressos — 2º lote (13 casais)', 4550, '2026-08-25'],
    ['Loja do evento', 'Camisas do encontro (42 un.)', 1890, '2026-09-20'],
  ],
  'cursilho-48': [
    ['Ingressos', 'Ingressos — 1º lote (30 inscrições)', 6600, '2026-06-15'],
    ['Ingressos', 'Ingressos — 2º lote (22 inscrições)', 5720, '2026-07-15'],
  ],
};

/**
 * Os lançamentos de uma tesouraria de evento: os ingressos pagos no sistema e
 * os movimentos da conta distribuídos para ela.
 */
export function lancamentosDa(tesourariaId: string): LancamentoDaTesouraria[] {
  const ingressos = (INGRESSOS[tesourariaId] ?? []).map(
    ([categoria, descricao, valor, data], i): LancamentoDaTesouraria => ({
      id: `${tesourariaId}-ingresso-${i}`,
      tesourariaId,
      tipo: 'INCOME',
      categoria,
      descricao,
      valor,
      data,
      origem: 'INSCRICOES',
    })
  );
  const daConta = movimentosDa(tesourariaId).map(
    (m): LancamentoDaTesouraria => ({
      id: m.id,
      tesourariaId,
      tipo: m.tipo,
      categoria: m.categoria ?? SEM_CATEGORIA,
      descricao: m.pagador ? `${m.descricao} — ${m.pagador}` : m.descricao,
      valor: m.valor,
      data: m.data,
      origem: 'BANCO',
    })
  );
  return [...ingressos, ...daConta];
}

const centavos = (valor: number) => Math.round(valor * 100) / 100;

export function resumir(lancamentos: LancamentoDaTesouraria[]) {
  let entradas = 0;
  let saidas = 0;
  for (const l of lancamentos) {
    if (l.tipo === 'INCOME') entradas += l.valor;
    else saidas += l.valor;
  }
  return {
    entradas: centavos(entradas),
    saidas: centavos(saidas),
    saldo: centavos(entradas - saidas),
  };
}

/** Total por categoria de um tipo, do maior para o menor */
export function porCategoria(
  lancamentos: LancamentoDaTesouraria[],
  tipo: TipoDoLancamento
) {
  const totais = new Map<string, number>();
  for (const l of lancamentos) {
    if (l.tipo !== tipo) continue;
    totais.set(l.categoria, (totais.get(l.categoria) ?? 0) + l.valor);
  }
  return [...totais]
    .map(([categoria, total]) => ({ categoria, total: centavos(total) }))
    .sort((a, b) => b.total - a.total);
}

// ---- congregações ----------------------------------------------------------------

/**
 * ponytail: por enquanto a congregação nasce com a tesouraria (criar uma cria
 * a outra). Quando houver o cadastro de congregações, a tesouraria passa a
 * escolher uma congregação que já existe, como a de evento escolhe o evento.
 */
export interface Congregacao {
  id: string;
  nome: string;
  /** Bairro, distrito ou cidade */
  local: string | null;
}

export interface TesourariaDeCongregacao {
  id: string;
  congregacao: Congregacao;
}

interface MembroDaCongregacao {
  nome: string;
  cpf: string;
  /** O valor do dízimo: Pix do membro com esse valor é dízimo */
  dizimo: number;
}

const tesourariasDeCongregacao: TesourariaDeCongregacao[] = [
  {
    id: 'vila-nova',
    congregacao: {
      id: 'cong-vila-nova',
      nome: 'Congregação Vila Nova',
      local: 'Bairro Vila Nova',
    },
  },
  {
    id: 'sao-jose',
    congregacao: {
      id: 'cong-sao-jose',
      nome: 'Congregação São José',
      local: 'Distrito de São José',
    },
  },
  {
    id: 'jardim-das-flores',
    congregacao: {
      id: 'cong-jardim-das-flores',
      nome: 'Congregação Jardim das Flores',
      local: 'Jardim das Flores',
    },
  },
];

/** Os membros de cada congregação (pela congregação, não pela tesouraria) */
const MEMBROS: Record<string, MembroDaCongregacao[]> = {
  'cong-vila-nova': [
    { nome: 'Ana Paula Ribeiro', cpf: '52998224725', dizimo: 250 },
    { nome: 'Marcos Vinícius Souza', cpf: '11144477735', dizimo: 180 },
    { nome: 'Juliana Ferreira', cpf: '39053344705', dizimo: 120 },
    { nome: 'Roberto Almeida', cpf: '15350946056', dizimo: 300 },
    { nome: 'Patrícia Gomes', cpf: '87748248800', dizimo: 90 },
    { nome: 'Lucas Martins', cpf: '45317828791', dizimo: 150 },
  ],
  'cong-sao-jose': [
    { nome: 'Antônio Carlos Lima', cpf: '71428793860', dizimo: 200 },
    { nome: 'Maria das Graças Silva', cpf: '28625587887', dizimo: 110 },
    { nome: 'José Pereira', cpf: '04252011040', dizimo: 160 },
    { nome: 'Francisca Oliveira', cpf: '93541134780', dizimo: 75 },
  ],
  'cong-jardim-das-flores': [
    { nome: 'Rafael Costa', cpf: '62648716004', dizimo: 140 },
    { nome: 'Camila Rocha', cpf: '35895732093', dizimo: 95 },
    { nome: 'Diego Nascimento', cpf: '80283497078', dizimo: 210 },
  ],
};

export const listarTesourariasDeCongregacao = () => [
  ...tesourariasDeCongregacao,
];

export const buscarTesourariaDeCongregacao = (id?: string) =>
  tesourariasDeCongregacao.find((t) => t.id === id) ?? null;

export const membrosDa = (tesourariaId: string) => {
  const t = buscarTesourariaDeCongregacao(tesourariaId);
  return t ? (MEMBROS[t.congregacao.id] ?? []) : [];
};

/** Cria a congregação e a tesouraria dela, de uma vez */
export function criarTesourariaDeCongregacao(dados: Omit<Congregacao, 'id'>) {
  const id = String(Date.now());
  const nova: TesourariaDeCongregacao = {
    id: `nova-${id}`,
    congregacao: { ...dados, id: `cong-${id}` },
  };
  tesourariasDeCongregacao.unshift(nova);
  return nova;
}

/**
 * O que a linha "a distribuir" diz numa congregação: se quem pagou é membro
 * dela — e, se o valor é o do dízimo dele, já entra como Dízimos, como na
 * importação do banco da administrativa.
 */
export function reconhecerNaCongregacao(
  tesourariaId: string,
  m: MovimentoDaConta
) {
  const membro = membrosDa(tesourariaId).find((x) => x.nome === m.pagador);
  if (!membro || m.tipo !== 'INCOME') return null;
  return m.valor === membro.dizimo
    ? { dica: 'Dízimo de membro desta congregação', categoria: DIZIMOS }
    : { dica: 'Membro desta congregação', categoria: null };
}

/**
 * O extrato de exemplo da conta das Congregações: de janeiro a setembro de
 * 2026 já distribuído; o de outubro, a distribuir. Gerado, para ter o ano
 * inteiro sem uma lista de cem linhas — as falhas de dízimo seguem uma regra
 * fixa, e não o acaso, para os números não mudarem a cada recarga.
 */
const GASTOS: Record<
  string,
  { aluguel: number; extra: [number, string, string, number][] }
> = {
  'vila-nova': {
    aluguel: 900,
    extra: [
      [4, 'Cartão — Casa do Construtor', 'Manutenção', 480],
      [6, 'Pix enviado — Cestas básicas', 'Ação social', 350],
    ],
  },
  'sao-jose': {
    aluguel: 0,
    extra: [[8, 'Cartão — Atacadão (limpeza)', 'Limpeza', 160]],
  },
  'jardim-das-flores': {
    aluguel: 650,
    extra: [
      [3, 'Pix enviado — Gráfica Rápida (campanha)', 'Outras saídas', 220],
    ],
  },
};

const OUTUBRO = 10;
const dia = (mes: number, d: number) =>
  `2026-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

for (const [ti, t] of tesourariasDeCongregacao.entries()) {
  const membros = MEMBROS[t.congregacao.id];
  const gastos = GASTOS[t.id];
  let n = 0;
  const lancar = (
    mes: number,
    d: number,
    tipo: TipoDoLancamento,
    descricao: string,
    valor: number,
    categoria: string,
    pagador: string | null = null
  ) => {
    // outubro ainda está a distribuir, e só até hoje (dia 12)
    if (mes === OUTUBRO && d > 12) return;
    const distribuido = mes < OUTUBRO;
    EXTRATO.push({
      id: `mov-${t.id}-${n++}`,
      conta: 'CONGREGACOES',
      tipo,
      descricao,
      pagador,
      valor,
      data: dia(mes, d),
      tesourariaId: distribuido ? t.id : null,
      categoria: distribuido ? categoria : null,
    });
  };

  for (let mes = 1; mes <= OUTUBRO; mes++) {
    membros.forEach((membro, i) => {
      if ((i * 3 + mes + ti) % 7 === 0) return;
      lancar(
        mes,
        3 + i,
        'INCOME',
        'Pix recebido',
        membro.dizimo,
        DIZIMOS,
        membro.nome
      );
    });
    lancar(
      mes,
      8,
      'INCOME',
      'Depósito em dinheiro',
      180 + ((mes * 37 + ti * 53) % 140),
      'Ofertas'
    );
    if (gastos.aluguel) {
      lancar(
        mes,
        10,
        'EXPENSE',
        'Pix enviado — Aluguel do salão',
        gastos.aluguel,
        'Aluguel'
      );
    }
    lancar(
      mes,
      15,
      'EXPENSE',
      'Boleto — Energisa',
      120 + ((mes * 13) % 60),
      'Água e luz'
    );
    lancar(
      mes,
      18,
      'EXPENSE',
      'Boleto — Saneamento',
      55 + ((mes * 7) % 25),
      'Água e luz'
    );
    for (const [mesExtra, descricao, categoria, valor] of gastos.extra) {
      if (mesExtra === mes)
        lancar(mes, 20, 'EXPENSE', descricao, valor, categoria);
    }
  }
}

// um membro que mandou uma oferta, e não o dízimo: é membro, mas sem categoria
EXTRATO.push({
  id: 'mov-oferta-juliana',
  conta: 'CONGREGACOES',
  tipo: 'INCOME',
  descricao: 'Pix recebido',
  pagador: 'Juliana Ferreira',
  valor: 50,
  data: dia(OUTUBRO, 11),
  tesourariaId: null,
  categoria: null,
});

/**
 * Os dizimistas da congregação no formato da tela de Dízimos da
 * administrativa (`Dizimista`), para usar a mesma tabela. O dízimo de cada
 * mês é o que foi distribuído para a congregação como Dízimos e pago pelo
 * membro; o total do mês conta também o dízimo sem membro identificado.
 */
export function dizimistasDa(tesourariaId: string, ano: number) {
  const dizimos = movimentosDa(tesourariaId).filter(
    (m) => m.categoria === DIZIMOS && m.data.startsWith(String(ano))
  );
  const porMesDe = (de: (m: MovimentoDaConta) => boolean) => {
    const meses: number[] = Array(12).fill(0);
    for (const m of dizimos.filter(de)) {
      meses[Number(m.data.slice(5, 7)) - 1] += m.valor;
    }
    return meses.map(centavos);
  };
  const soma = (valores: number[]) =>
    centavos(valores.reduce((a, b) => a + b, 0));

  const dizimistas = membrosDa(tesourariaId).map((membro): Dizimista => {
    const porMes = porMesDe((m) => m.pagador === membro.nome);
    const datas = dizimos
      .filter((m) => m.pagador === membro.nome)
      .map((m) => m.data)
      .sort();
    return {
      id: `${tesourariaId}-${membro.cpf}`,
      fullName: membro.nome,
      cpf: membro.cpf,
      cellphone: '',
      email: '',
      profilePhotoUrl: null,
      memberSince: null,
      family: null,
      titheAmount: membro.dizimo,
      totalNoAno: soma(porMes),
      mesesNoAno: porMes.flatMap((v, i) => (v ? [i + 1] : [])),
      porMes,
      ultimoDizimo: datas[datas.length - 1] ?? null,
    };
  });
  const porMes = porMesDe(() => true);
  return { dizimistas, porMes, total: soma(porMes) };
}
