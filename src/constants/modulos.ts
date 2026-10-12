/**
 * Os módulos que o plano de uma igreja libera (`ChurchModule` na API). Fora do
 * plano, o módulo some do painel daquela igreja e a API dele recusa; nada é
 * apagado. Igreja sem plano não tem módulo nenhum.
 *
 * Membros não é módulo: toda igreja tem, com ou sem plano. As configurações
 * seguem o módulo a que servem: Pagamentos é de Eventos, Disparadores
 * (WhatsApp) de Notícias, Integrações (Pluggy) de Tesouraria. A cobrança
 * online é parte de Eventos.
 */
export type ModuloDaIgreja = 'EVENTS' | 'NEWS' | 'TREASURY';

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
      'Criar e gerir eventos no painel, com os gateways e a cobrança online nas inscrições. O evento já publicado segue aberto ao público',
  },
  {
    value: 'NEWS',
    label: 'Notícias',
    ajuda: 'Notícias, disparos e o WhatsApp da igreja',
  },
  {
    value: 'TREASURY',
    label: 'Tesouraria',
    ajuda: 'Dízimos, lançamentos, conciliação e os bancos (Pluggy)',
  },
];

export const ROTULO_DO_MODULO = Object.fromEntries(
  MODULOS.map((m) => [m.value, m.label])
) as Record<ModuloDaIgreja, string>;
