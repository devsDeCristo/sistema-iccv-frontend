import { createContext } from 'react';
import { ChaveDoModulo } from '../../constants/identidadeDosModulos';

/**
 * Em qual módulo a tela está (nulo fora deles), dado pelo `TemaDoModulo`. O
 * tema só carrega as cores; quem precisa da paleta inteira do módulo — os
 * cards de resumo, que usam variações dela — lê daqui.
 */
export const ModuloAtual = createContext<ChaveDoModulo | null>(null);
