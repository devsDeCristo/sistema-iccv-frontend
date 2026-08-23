//import { Event } from "../../features/events/types";
import { EventDetails } from '../../features/admin/events/types';
import { PdfNameCase, PdfSection } from '../../types/pdf';
import { User } from '../../types/user';

export interface PdfProps {
  data: User[];
  event: EventDetails;
  /** Blocos com cabeçalho (equipe ou grupo). Sem eles, `data` vira um bloco só */
  sections?: PdfSection[];
  nameCase?: PdfNameCase;
  /** Envelopes em branco impressos ao final, sem nome */
  blankCount?: number;
}

/** Uma folha do PDF: um envelope */
export interface EnvelopePage {
  name: string;
}
