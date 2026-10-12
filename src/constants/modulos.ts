/**
 * Os módulos que o plano de uma igreja libera (`ChurchModule` na API). Fora do
 * plano, o módulo some do painel daquela igreja e a API dele recusa; nada é
 * apagado. Igreja sem plano não tem módulo nenhum.
 *
 * Membros não é módulo: toda igreja tem, com ou sem plano.
 */
export type ModuloDaIgreja =
  | 'EVENTS'
  | 'NEWS'
  | 'TREASURY'
  | 'WHATSAPP'
  | 'INTEGRATIONS'
  | 'ONLINE_PAYMENTS';

/** Na ordem do menu, com o que cada um abre */
export const MODULOS: {
  value: ModuloDaIgreja;
  label: string;
  ajuda: string;
}[] = [
  {
    value: 'EVENTS',
    label: 'Eventos',
    ajuda:
      'Criar e gerir eventos no painel. O evento já publicado segue aberto ao público',
  },
  { value: 'NEWS', label: 'Notícias', ajuda: 'Notícias e disparos' },
  {
    value: 'TREASURY',
    label: 'Tesouraria',
    ajuda: 'Dízimos, lançamentos e conciliação',
  },
  {
    value: 'WHATSAPP',
    label: 'WhatsApp',
    ajuda: 'O número da igreja nos disparadores',
  },
  {
    value: 'INTEGRATIONS',
    label: 'Integrações',
    ajuda: 'Os bancos da igreja pela Pluggy',
  },
  {
    value: 'ONLINE_PAYMENTS',
    label: 'Cobrança online',
    ajuda: 'Pagamento pelo site nas inscrições dos eventos',
  },
];

export const ROTULO_DO_MODULO = Object.fromEntries(
  MODULOS.map((m) => [m.value, m.label])
) as Record<ModuloDaIgreja, string>;
