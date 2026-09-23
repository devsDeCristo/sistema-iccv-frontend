export const GET_CHURCHES = 'GET_CHURCHES';

/** Em que pé a igreja está — a mesma régua do status do evento, um andar acima. */
export type ChurchStatus = 'ACTIVE' | 'INACTIVE' | 'TEST';

/**
 * Como cada situação aparece na tela.
 *
 * O vocabulário acompanha o do evento ("Ativo", "Inativo", "Teste"), no
 * feminino: são as mesmas três situações, e inventar palavra nova para a
 * igreja obrigaria a pessoa a aprender duas listas.
 */
export const CHURCH_STATUS_LABELS: Record<ChurchStatus, string> = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
  TEST: 'Em teste',
};

export const CHURCH_STATUS_OPTIONS: {
  value: ChurchStatus;
  label: string;
  /** o que muda no sistema ao escolher esta situação */
  ajuda: string;
}[] = [
  {
    value: 'ACTIVE',
    label: CHURCH_STATUS_LABELS.ACTIVE,
    ajuda: 'No ar: aparece no filtro de igrejas da home.',
  },
  {
    value: 'TEST',
    label: CHURCH_STATUS_LABELS.TEST,
    ajuda: 'Em implantação: o painel funciona, mas ela não aparece no filtro.',
  },
  {
    value: 'INACTIVE',
    label: CHURCH_STATUS_LABELS.INACTIVE,
    ajuda: 'Fora do ar: some do filtro, e os dados dela continuam guardados.',
  },
];
