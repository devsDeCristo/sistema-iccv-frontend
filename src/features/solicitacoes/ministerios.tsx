import { ReactElement } from 'react';
import {
  ChildCare,
  CleanHands,
  Favorite,
  Groups,
  Handshake,
  MenuBook,
  MoreHoriz,
  MusicNote,
  SelfImprovement,
  Speaker,
  Videocam,
  VolunteerActivism,
} from '@mui/icons-material';
import { MINISTERIOS } from './constants';

type Ministerio = (typeof MINISTERIOS)[number];

/**
 * O ícone de cada ministério: nos cards de escolha do pedido e no card da
 * solicitação. Ministério fora da lista (a API mudou antes da tela) cai no
 * de "Outro".
 */
export const ICONE_DO_MINISTERIO: Record<Ministerio, ReactElement> = {
  Louvor: <MusicNote />,
  Mídia: <Videocam />,
  'Som e iluminação': <Speaker />,
  Infantil: <ChildCare />,
  Jovens: <Groups />,
  Recepção: <Handshake />,
  Intercessão: <SelfImprovement />,
  'Ação social': <VolunteerActivism />,
  Diaconia: <CleanHands />,
  Ensino: <MenuBook />,
  Casais: <Favorite />,
  Outro: <MoreHoriz />,
};

export const iconeDoMinisterio = (ministerio: string) =>
  ICONE_DO_MINISTERIO[ministerio as Ministerio] ?? ICONE_DO_MINISTERIO.Outro;
