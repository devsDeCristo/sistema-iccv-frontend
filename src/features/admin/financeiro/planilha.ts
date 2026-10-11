import * as XLSX from 'xlsx';

import { LinhaDaPlanilha } from './types';

const MESES = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

const normalizar = (texto: unknown) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** "R$ 1.600,20" → 1600.2; a célula numérica passa direto */
export const valorDaCelula = (celula: unknown) => {
  const valor =
    typeof celula === 'number'
      ? celula
      : Number(
          String(celula ?? '')
            .replace(/[^\d,-]/g, '')
            .replace(',', '.')
        );
  return Number.isFinite(valor) && valor > 0
    ? Math.round(valor * 100) / 100
    : 0;
};

/**
 * Lê a planilha de dízimos: a primeira aba, com um cabeçalho que tem "Nome" e
 * os meses ("Jan" a "Dez", em qualquer ordem e com o nome inteiro ou não).
 * Fica de fora a linha sem nome ("-" ou vazia), a de total e a sem nenhum
 * valor no ano. A linha "Anônimo" (o nome pode estar na coluna do número)
 * vem marcada.
 *
 * `null`: o arquivo não tem o cabeçalho esperado.
 */
export async function lerPlanilha(
  arquivo: File
): Promise<LinhaDaPlanilha[] | null> {
  const livro = XLSX.read(await arquivo.arrayBuffer());
  const linhas = XLSX.utils.sheet_to_json<unknown[]>(
    livro.Sheets[livro.SheetNames[0]],
    { header: 1, raw: true, defval: null }
  );

  const inicio = linhas.findIndex((l) =>
    l.some((celula) => normalizar(celula) === 'nome')
  );
  if (inicio < 0) return null;
  const cabecalho = linhas[inicio].map(normalizar);
  const colunaDoNome = cabecalho.indexOf('nome');
  const colunas = MESES.map((mes) =>
    cabecalho.findIndex((titulo) => titulo.startsWith(mes))
  );
  if (colunas.some((c) => c < 0)) return null;

  return linhas.slice(inicio + 1).flatMap((linha) => {
    // sem nome na coluna, um texto em outra (o "Anônimo" vem na do número)
    const texto = (celula: unknown) =>
      typeof celula === 'string' && !/^[\s\d.,R$-]*$/.test(celula);
    const nome = String(
      texto(linha[colunaDoNome])
        ? linha[colunaDoNome]
        : (linha.find((celula, i) => !colunas.includes(i) && texto(celula)) ??
            '')
    ).trim();
    const valores = colunas.map((c) => valorDaCelula(linha[c]));
    const total = Math.round(valores.reduce((a, b) => a + b, 0) * 100) / 100;
    if (!nome || !total || normalizar(nome).startsWith('total')) return [];
    return [
      { nome, valores, total, anonimo: normalizar(nome).startsWith('anonim') },
    ];
  });
}
