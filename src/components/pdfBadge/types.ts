//import { Event } from "../../features/events/types";
import { EventDetails } from '../../features/admin/events/types';
import { PdfNameCase, PdfSection } from '../../types/pdf';
import { QrCodePath } from '../../utils/qrcode';
import { User } from '../../types/user';

export interface PdfProps {
  data: User[];
  event: EventDetails;
  /**
   * Blocos com cabeçalho (equipe ou grupo de inscrição). Quando não vem,
   * `data` vira um bloco único sem cabeçalho — é o modo usado no crachá avulso.
   */
  sections?: PdfSection[];
  nameCase?: PdfNameCase;
  /** Crachás em branco impressos ao final, sem nome */
  blankCount?: number;
  /**
   * Imprime o QR da inscrição. Desligado, o crachá sai só com o nome — é o
   * caso de quem confere a entrada em lista, sem leitor.
   */
  withQrCode?: boolean;
}

/** Um crachá: o nome impresso e o QR da inscrição (ausente no crachá em branco) */
export interface BadgeEntry {
  name: string;
  qr: QrCodePath | null;
}

/** Uma folha: o cabeçalho do bloco e os até 4 crachás dela */
export interface BadgePage {
  title: string | null;
  badges: BadgeEntry[];
}
