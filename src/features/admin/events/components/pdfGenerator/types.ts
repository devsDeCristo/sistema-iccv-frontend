/** Qual PDF o modal está gerando */
export type PdfDocType = 'badge' | 'envelope';

/** Envelope com nome (cartas) ou sem nome (fotos) */
export type EnvelopeKind = 'letter' | 'photo';

/** De onde saem os registros impressos */
export type PdfScope =
  | 'selected'
  | 'filtered'
  | 'all'
  | 'teams'
  | 'groups'
  | 'blank';

/** Agrupamento do PDF; entra no cabeçalho das folhas */
export type PdfGroupBy = 'none' | 'registrationGroup' | 'team';
