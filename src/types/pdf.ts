import { User } from './user';

/** Como o nome é escrito no crachá/envelope */
export type PdfNameCase = 'upper' | 'lower' | 'capitalize';

/**
 * Bloco impresso junto no PDF: o título (equipe ou grupo de inscrição) vai no
 * cabeçalho das folhas do bloco e um bloco nunca divide folha com outro.
 */
export interface PdfSection {
  title: string | null;
  users: User[];
}
