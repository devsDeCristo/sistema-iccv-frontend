import { alpha } from '@mui/material';

/**
 * As famílias juntas numa tabela de membros — a de Membros e a de Dizimistas
 * usam o mesmo desenho: as linhas de uma família em sequência, uma faixa da
 * cor dela à esquerda e um fundo leve.
 */

/** Cores das famílias: distintas entre si e legíveis nos dois temas */
export const CORES_DAS_FAMILIAS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#8B5CF6',
  '#06B6D4',
  '#EF4444',
  '#84CC16',
];

/** O lugar da pessoa no bloco da família, para desenhar o bloco */
export type Posicao = 'unica' | 'inicio' | 'meio' | 'fim' | null;

type ComFamilia = { family: { id: string; name: string } | null };

/** `cor`: da família, pela ordem dela na tabela — vizinhas nunca repetem */
export type EmFamilia<T> = T & { posicao: Posicao; cor: string | null };

/**
 * Famílias primeiro, uma depois da outra (pelo nome), com as pessoas de cada
 * uma juntas; depois quem não tem família. A ordem é o que junta a família na
 * tabela — por isso as colunas dessas tabelas não se reordenam por clique.
 */
export function emBlocos<T extends ComFamilia>(itens: T[]): EmFamilia<T>[] {
  const porFamilia = new Map<string, T[]>();
  const sem: T[] = [];
  for (const item of itens) {
    if (!item.family) sem.push(item);
    else
      porFamilia.set(item.family.id, [
        ...(porFamilia.get(item.family.id) ?? []),
        item,
      ]);
  }
  const blocos = [...porFamilia.values()].sort((a, b) =>
    (a[0].family?.name ?? '').localeCompare(b[0].family?.name ?? '', 'pt-BR')
  );

  const linhas: EmFamilia<T>[] = [];
  blocos.forEach((bloco, indice) => {
    const cor = CORES_DAS_FAMILIAS[indice % CORES_DAS_FAMILIAS.length];
    bloco.forEach((item, i) =>
      linhas.push({
        ...item,
        cor,
        posicao:
          bloco.length === 1
            ? 'unica'
            : i === 0
              ? 'inicio'
              : i === bloco.length - 1
                ? 'fim'
                : 'meio',
      })
    );
  });
  return [
    ...linhas,
    ...sem.map((item) => ({ ...item, posicao: null, cor: null })),
  ];
}

/** A primeira linha da família, onde vai o nome dela */
export const abreAFamilia = (posicao: Posicao) =>
  posicao === 'inicio' || posicao === 'unica';

/** A classe da linha, para o fundo leve da família (`getRowClassName`) */
export const classeDaFamilia = (cor: string | null) =>
  cor ? `familia-${cor.slice(1)}` : '';

/**
 * O `sx` do DataGrid que pinta o fundo das famílias e deixa a célula
 * posicionar a faixa. `alturaMinima`: a da linha da tabela.
 */
export const estiloDasFamilias = (alturaMinima: number) => ({
  '& .MuiDataGrid-row--dynamicHeight > .MuiDataGrid-cell': {
    minHeight: alturaMinima,
    position: 'relative',
  },
  ...Object.fromEntries(
    CORES_DAS_FAMILIAS.map((cor) => [
      `& .familia-${cor.slice(1)}`,
      { backgroundColor: alpha(cor, 0.07) },
    ])
  ),
});
