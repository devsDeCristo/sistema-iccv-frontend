import { alpha, useTheme } from '@mui/material';

import { sombraDeCartao } from '../../../components/listPageStyles';

/** Raio do furo do picote, o mesmo do ingresso no cartão de Minhas Inscrições */
const RAIO_DO_FURO = 10;

/**
 * O ingresso dos modais de pagamento, no mesmo desenho dos cartões de Minhas
 * Inscrições (`cards.tsx`): corpo e canhoto separados pelo picote, com os
 * furos recortados de verdade — cada metade perde um quarto de círculo nos
 * cantos do lado do picote, e a sombra em `drop-shadow` contorna a meia-lua.
 *
 * Deitado (`principal` + `canhoto`) para a lista do que pagar; em pé
 * (`corpoEmPe` + `canhotoEmPe`) para as opções lado a lado.
 *
 * @param destaque a cor do evento: o selo do canhoto
 */
export function useEstiloDeIngresso(destaque: string) {
  const theme = useTheme();
  const raio = Number(theme.shape.borderRadius) * 3;

  // No claro o ingresso branco sumia no fundo claro do modal: o picote fica
  // mais forte e ganha um contorno fino — em `drop-shadow`, que segue o
  // recorte dos furos, onde uma borda de caixa passaria reto
  const claro = theme.palette.mode === 'light';
  const linhaDoPicote = `2px dashed ${alpha(theme.palette.text.primary, claro ? 0.3 : 0.18)}`;
  const contorno = claro ? 'drop-shadow(0 0 0.75px rgba(16,24,40,.45)) ' : '';

  const recorte = (x: string, y: string) =>
    `radial-gradient(circle at ${x} ${y}, transparent ${RAIO_DO_FURO}px, #000 ${RAIO_DO_FURO + 0.5}px)`;
  /** Cada metade perde os furos do lado do picote: corte em cima/embaixo ou esquerda/direita */
  const mascara = (
    a: [string, string],
    b: [string, string],
    divisao: 'alto-baixo' | 'esquerda-direita' = 'alto-baixo'
  ) => {
    const [ladoA, ladoB, tamanho] =
      divisao === 'alto-baixo'
        ? ['top', 'bottom', '100% 51%']
        : ['left', 'right', '51% 100%'];
    return `${recorte(...a)} ${ladoA} / ${tamanho} no-repeat, ${recorte(...b)} ${ladoB} / ${tamanho} no-repeat`;
  };
  const comMascara = (valor: string) => ({ WebkitMask: valor, mask: valor });

  // O papel do ingresso é o tom secundário de superfície (o dos cards), e
  // não o `paper` do modal: no mesmo tom do fundo ele sumia. Marcado ou não,
  // o tom é o mesmo dos outros cards — quem diz que está marcado é o selo do
  // canhoto (✓ cheio na cor do evento).
  const papel = { backgroundColor: theme.palette.background.paperSecondary };

  const styles = {
    ingresso: {
      display: 'flex',
      width: '100%',
      alignItems: 'stretch',
      textAlign: 'left' as const,
      filter: `${contorno}${sombraDeCartao(theme)}`,
      transition: theme.transitions.create('transform', { duration: 160 }),
      '&:hover': { transform: 'translateY(-1px)' },
    },
    principal: {
      flex: 1,
      minWidth: 0,
      p: 1.75,
      borderRadius: `${raio}px 0 0 ${raio}px`,
      // furos nos cantos da direita
      ...comMascara(mascara(['100%', '0'], ['100%', '100%'])),
    },
    canhoto: {
      width: { xs: 96, sm: 120 },
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0.75,
      p: 1.5,
      borderLeft: linhaDoPicote,
      borderRadius: `0 ${raio}px ${raio}px 0`,
      // furos nos cantos da esquerda
      ...comMascara(mascara(['0', '0'], ['0', '100%'])),
    },
    // o ingresso em pé: corpo em cima, canhoto embaixo do picote
    emPe: { flexDirection: 'column' as const },
    corpoEmPe: {
      flex: 1,
      p: 2,
      borderRadius: `${raio}px ${raio}px 0 0`,
      // furos nos cantos de baixo
      ...comMascara(
        mascara(['0', '100%'], ['100%', '100%'], 'esquerda-direita')
      ),
    },
    canhotoEmPe: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      px: 2,
      py: 1.25,
      borderTop: linhaDoPicote,
      borderRadius: `0 0 ${raio}px ${raio}px`,
      // furos nos cantos de cima
      ...comMascara(mascara(['0', '0'], ['100%', '0'], 'esquerda-direita')),
    },
    selo: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      color: destaque,
      backgroundColor: alpha(destaque, 0.12),
      transition: 'background-color .15s, color .15s',
    },
  };

  return { raio, claro, papel, styles };
}
